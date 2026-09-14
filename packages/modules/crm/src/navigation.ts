import type { NavItem } from '@elemental/sdk';

export const navigation: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: 'IconLayoutDashboard', group: 'Overview' },
  { label: 'Companies', to: '/companies', icon: 'IconBuilding', group: 'CRM' },
  { label: 'Contacts', to: '/contacts', icon: 'IconUser', group: 'CRM' },
  { label: 'Deals', to: '/deals', icon: 'IconBriefcase', group: 'CRM' },
  { label: 'Activities', to: '/activities', icon: 'IconPhone', group: 'CRM' },
  { label: 'Tasks', to: '/tasks', icon: 'IconListCheck', group: 'CRM' },
];
