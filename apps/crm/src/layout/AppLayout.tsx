import { AppShell, Burger, Button, Group, NavLink, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useGetIdentity, useLogout, usePermissions } from '@refinedev/core';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { config } from '../config';
import { resolveIcon } from '../icons';
import { modules } from '../modules';
import type { AppUser } from '../auth-provider';
import type { Role, NavItem } from '@elemental/sdk';

/**
 * Top-level shell with collapsible sidebar. The sidebar is built dynamically
 * from each module's `navigation` array, plus a fixed Settings group that's
 * gated on the user's role.
 */
export function AppLayout({ children }: { children: ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const { data: identity } = useGetIdentity<AppUser & { name: string }>();
  const { data: permissions } = usePermissions<Role>();
  const { mutate: logout } = useLogout();
  const location = useLocation();

  const moduleGroups = groupNavigation(modules.flatMap((m) => m.navigation));

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={4}>{config.appName}</Title>
          </Group>
          <Group gap="xs">
            <Text size="sm" c="dimmed">
              {identity?.name ?? identity?.email ?? ''}
              {permissions ? ` (${permissions})` : ''}
            </Text>
            <Button variant="subtle" size="xs" onClick={() => logout()}>
              Sign out
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <ScrollArea h="100%">
          <Stack gap="xs">
            {Object.entries(moduleGroups).map(([group, items]) => (
              <div key={group}>
                <Text size="xs" tt="uppercase" c="dimmed" fw={700} mt="sm" mb={4} px="sm">
                  {group}
                </Text>
                {items.map((item) => {
                  const Icon = resolveIcon(item.icon);
                  return (
                    <NavLink
                      key={item.to}
                      component={Link}
                      to={item.to}
                      label={item.label}
                      leftSection={<Icon size={18} />}
                      active={location.pathname === item.to}
                    />
                  );
                })}
              </div>
            ))}

            {permissions === 'admin' ? (
              <div>
                <Text size="xs" tt="uppercase" c="dimmed" fw={700} mt="sm" mb={4} px="sm">
                  Admin
                </Text>
                {(() => { const Icon = resolveIcon('IconSettings'); return (
                  <NavLink
                    component={Link}
                    to="/settings/schema"
                    label="Schema Builder"
                    leftSection={<Icon size={18} />}
                    active={location.pathname.startsWith('/settings/schema')}
                  />
                ); })()}
                {(() => { const Icon = resolveIcon('IconUsers'); return (
                  <NavLink
                    component={Link}
                    to="/settings/users"
                    label="Users"
                    leftSection={<Icon size={18} />}
                    active={location.pathname.startsWith('/settings/users')}
                  />
                ); })()}
              </div>
            ) : null}
          </Stack>
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

function groupNavigation(items: NavItem[]): Record<string, NavItem[]> {
  const out: Record<string, NavItem[]> = {};
  for (const item of items) {
    const g = item.group ?? 'General';
    (out[g] ??= []).push(item);
  }
  return out;
}
