import type { AccessControlProvider } from '@refinedev/core';
import { hasAtLeast, type Role } from '@elemental/sdk';
import { STORAGE_KEYS } from './config';

/**
 * Maps Refine's `can()` calls to our three-role model. The matrix:
 *
 *   - admin   : everything
 *   - manager : everything except schema-builder + user invites
 *   - user    : list/show on data; create/edit only (no delete) on data;
 *               cannot reach /settings
 */
function getRole(): Role | undefined {
  const cached = localStorage.getItem(STORAGE_KEYS.user);
  if (!cached) return undefined;
  try {
    return (JSON.parse(cached) as { role: Role }).role;
  } catch {
    return undefined;
  }
}

const ADMIN_ONLY_RESOURCES = new Set(['settings.schema', 'settings.users']);
const MANAGER_PLUS_ACTIONS = new Set(['delete']);

export const accessControlProvider: AccessControlProvider = {
  async can({ resource, action }) {
    const role = getRole();
    if (!role) return { can: false, reason: 'Not authenticated' };

    if (resource && ADMIN_ONLY_RESOURCES.has(resource)) {
      return { can: hasAtLeast(role, 'admin'), reason: 'Admin only' };
    }

    if (action && MANAGER_PLUS_ACTIONS.has(action)) {
      return { can: hasAtLeast(role, 'manager'), reason: 'Manager or admin only' };
    }

    return { can: true };
  },
  options: {
    buttons: { enableAccessControl: true, hideIfUnauthorized: true },
  },
};
