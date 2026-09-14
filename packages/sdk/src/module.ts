import type { ComponentType } from 'react';
import type { TableDefinition } from './field-types.js';
import type { PermissionMatrix } from './roles.js';

/**
 * A `ResourceConfig` is what each module contributes to the Refine app's
 * resource list. It is intentionally small and loosely coupled so that
 * modules can be authored without depending on Refine internals directly.
 */
export interface ResourceConfig {
  /** NocoDB table name. Used as Refine's resource identifier. */
  name: string;
  /** Display label in the sidebar. */
  label: string;
  /** Tabler icon name (e.g. "IconUsers"). Resolved by the host app. */
  icon?: string;
  /** Path under which this resource is mounted (defaults to /:name). */
  path?: string;
  /** Override permissions for this resource. */
  permissions?: PermissionMatrix;
  /**
   * Optional custom React components. If absent, the host app falls back
   * to a generic table/show/create/edit derived from the schema.
   */
  components?: {
    list?: ComponentType;
    show?: ComponentType;
    create?: ComponentType;
    edit?: ComponentType;
  };
}

export interface NavItem {
  label: string;
  /** Either a route path or an external URL. */
  to: string;
  icon?: string;
  /** Group label for sectioned sidebars. */
  group?: string;
  /** Roles allowed to see this nav item; missing = all roles. */
  visibleTo?: Array<'admin' | 'manager' | 'user'>;
}

/**
 * The contract every module must implement. Modules are zero-coupling units
 * of business functionality - drop a folder in `packages/modules/<id>` and
 * register it in `apps/crm/src/modules.ts`.
 */
export interface ErpModule {
  /** Stable lowercase identifier, e.g. "crm", "inventory". */
  id: string;
  /** Display name shown to admins. */
  name: string;
  /** Semver of the module itself; bumped when schema changes. */
  version: string;
  /** Tables + views the module installs in NocoDB. */
  schema: TableDefinition[];
  /** Refine resources contributed by this module. */
  resources: ResourceConfig[];
  /** Sidebar navigation entries. */
  navigation: NavItem[];
  /** Optional cross-cutting permission overrides. */
  permissions?: PermissionMatrix;
  /**
   * Optional hook called by `pnpm demo:seed` after the schema is in place.
   * Use it to insert demo records via the NocoDB data API.
   */
  seed?: (ctx: { baseId: string; tableIds: Record<string, string> }) => Promise<void>;
}

export function defineModule(mod: ErpModule): ErpModule {
  return mod;
}
