import type { AuthProvider } from '@refinedev/core';
import { http } from './http';
import { STORAGE_KEYS } from './config';
import type { Role } from '@elemental/sdk';

/** Shape of the JWT we store from NocoDB. */
export interface AppUser {
  id: string;
  email: string;
  /** App-level role, derived from NocoDB's role list. */
  role: Role;
  display: string;
  rawRoles: string[];
}

function parseRoles(roles: unknown): string[] {
  if (!roles) return [];
  if (typeof roles === 'string') {
    return roles.split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (typeof roles === 'object') {
    return Object.entries(roles as Record<string, unknown>)
      .filter(([, enabled]) => enabled === true || enabled === 'true')
      .map(([name]) => name);
  }
  return [];
}

function mapRole(rawRoles: string[]): Role {
  const adminRoles = ['super', 'owner', 'creator', 'org-level-creator', 'workspace-level-owner'];
  if (rawRoles.some((r) => adminRoles.includes(r))) {
    return 'admin';
  }
  if (rawRoles.includes('editor')) return 'manager';
  return 'user';
}

async function fetchMe(): Promise<AppUser | null> {
  try {
    const { data } = await http.get('/api/v1/auth/user/me');
    const rawRoles = parseRoles(data?.roles);
    const display = data?.display_name || data?.email || 'User';
    const user: AppUser = {
      id: String(data?.id ?? ''),
      email: data?.email ?? '',
      display,
      rawRoles,
      role: mapRole(rawRoles),
    };
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    return user;
  } catch {
    return null;
  }
}

export const authProvider: AuthProvider = {
  async login({ email, password }) {
    try {
      const { data } = await http.post('/api/v1/auth/user/signin', { email, password });
      if (!data?.token) {
        return { success: false, error: { name: 'LoginError', message: 'Missing token in response' } };
      }
      localStorage.setItem(STORAGE_KEYS.authToken, data.token);
      const user = await fetchMe();
      if (!user) {
        localStorage.removeItem(STORAGE_KEYS.authToken);
        return {
          success: false,
          error: { name: 'LoginError', message: 'Signed in but could not load your profile. Try again.' },
        };
      }
      return { success: true, redirectTo: '/' };
    } catch (err: unknown) {
      const e = err as { response?: { data?: { msg?: string } } };
      return {
        success: false,
        error: {
          name: 'LoginError',
          message: e?.response?.data?.msg ?? 'Invalid email or password',
        },
      };
    }
  },

  async logout() {
    localStorage.removeItem(STORAGE_KEYS.authToken);
    localStorage.removeItem(STORAGE_KEYS.user);
    return { success: true, redirectTo: '/login' };
  },

  async check() {
    const token = localStorage.getItem(STORAGE_KEYS.authToken);
    if (!token) return { authenticated: false, redirectTo: '/login' };

    const cached = localStorage.getItem(STORAGE_KEYS.user);
    if (cached) return { authenticated: true };

    const user = await fetchMe();
    return user ? { authenticated: true } : { authenticated: false, redirectTo: '/login' };
  },

  async getIdentity() {
    const cached = localStorage.getItem(STORAGE_KEYS.user);
    if (cached) {
      try {
        const u = JSON.parse(cached) as AppUser;
        return { ...u, name: u.display, avatar: undefined };
      } catch {
        // fallthrough
      }
    }
    return null;
  },

  async getPermissions() {
    const cached = localStorage.getItem(STORAGE_KEYS.user);
    if (!cached) return null;
    try {
      const u = JSON.parse(cached) as AppUser;
      return u.role;
    } catch {
      return null;
    }
  },

  async onError(error) {
    if (error?.statusCode === 401 || error?.status === 401) {
      return { logout: true, redirectTo: '/login' };
    }
    return {};
  },
};
