export const Role = {
  Admin: 'admin',
  Manager: 'manager',
  User: 'user',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ROLE_ORDER: Record<Role, number> = {
  admin: 3,
  manager: 2,
  user: 1,
};

export function hasAtLeast(actual: Role | undefined, required: Role): boolean {
  if (!actual) return false;
  return ROLE_ORDER[actual] >= ROLE_ORDER[required];
}

export type ResourceAction = 'list' | 'show' | 'create' | 'edit' | 'delete';

export type PermissionMatrix = Partial<Record<Role, Partial<Record<ResourceAction, boolean>>>>;

/**
 * Default permission matrix that resources can extend or override.
 * Admin gets everything; manager can CRUD; user can read all + create + edit own.
 */
export const DEFAULT_PERMISSIONS: PermissionMatrix = {
  admin: { list: true, show: true, create: true, edit: true, delete: true },
  manager: { list: true, show: true, create: true, edit: true, delete: true },
  user: { list: true, show: true, create: true, edit: true, delete: false },
};
