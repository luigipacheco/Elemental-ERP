import type { ResourceConfig } from '@elemental/sdk';

/**
 * Refine resources contributed by the CRM module.
 *
 * The host app pairs each `name` with the matching React component from
 * `apps/crm/src/modules/crm/`. We keep the wiring shallow here so that
 * a future module-loader could also accept lazy `() => import(...)`
 * components.
 */
export const resources: ResourceConfig[] = [
  {
    name: 'companies',
    label: 'Companies',
    icon: 'IconBuilding',
    path: '/companies',
  },
  {
    name: 'contacts',
    label: 'Contacts',
    icon: 'IconUser',
    path: '/contacts',
  },
  {
    name: 'deals',
    label: 'Deals',
    icon: 'IconBriefcase',
    path: '/deals',
  },
  {
    name: 'activities',
    label: 'Activities',
    icon: 'IconPhone',
    path: '/activities',
  },
  {
    name: 'tasks',
    label: 'Tasks',
    icon: 'IconListCheck',
    path: '/tasks',
  },
];
