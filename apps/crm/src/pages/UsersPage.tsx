import {
  Alert,
  Anchor,
  Badge,
  Button,
  Card,
  Group,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { CanAccess } from '@refinedev/core';
import { IconExternalLink, IconShieldLock, IconUserPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { http } from '../http';
import { PageTitle } from '@elemental/ui';
import { config } from '../config';

/**
 * Lightweight user-management page. NocoDB owns identity, so we proxy
 * its `/api/v1/users` endpoint for listing and `invite` for new accounts.
 *
 * Anything fancier (password resets, deactivation, SSO) we punt to the
 * Schema Builder link, which is the full NocoDB admin.
 */

interface NocoUser {
  id: string;
  email: string;
  display_name?: string;
  roles?: string;
  base_roles?: string;
  invite_token?: string;
}

const ROLE_OPTIONS = [
  { value: 'editor', label: 'Manager (editor)' },
  { value: 'commenter', label: 'User (commenter)' },
  { value: 'viewer', label: 'Viewer (read-only)' },
];

export function UsersPage() {
  return (
    <CanAccess
      resource="settings.users"
      action="read"
      fallback={
        <Stack>
          <PageTitle title="Users" />
          <Alert color="orange" icon={<IconShieldLock />}>
            Only admins can manage users.
          </Alert>
        </Stack>
      }
    >
      <UsersInner />
    </CanAccess>
  );
}

function UsersInner() {
  const [users, setUsers] = useState<NocoUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteResult, setInviteResult] = useState<{ token?: string; email: string } | null>(null);

  const form = useForm({
    initialValues: { email: '', roles: 'commenter' },
    validate: { email: (v) => (/^.+@.+\..+$/.test(v) ? null : 'Enter a valid email') },
  });

  async function load() {
    setLoading(true);
    try {
      const { data } = await http.get<{ list: NocoUser[]; pageInfo: { totalRows: number } }>(
        '/api/v1/users',
      );
      setUsers(data.list ?? []);
      setError(null);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { msg?: string } } };
      setError(e?.response?.data?.msg ?? 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function invite(values: { email: string; roles: string }) {
    try {
      const { data } = await http.post<{ invite_token?: string }>('/api/v1/users', values);
      setInviteResult({ email: values.email, token: data?.invite_token });
      form.reset();
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { msg?: string } } };
      setError(e?.response?.data?.msg ?? 'Invite failed');
    }
  }

  return (
    <Stack>
      <PageTitle
        title="Users"
        subtitle="Invite teammates and assign roles"
        actions={
          <Button
            component="a"
            href={`${config.nocodbUrl}/#/account/users`}
            target="_blank"
            rel="noreferrer"
            variant="default"
            rightSection={<IconExternalLink size={16} />}
          >
            Advanced (NocoDB)
          </Button>
        }
      />

      {error ? (
        <Alert color="red" onClose={() => setError(null)} withCloseButton>
          {error}
        </Alert>
      ) : null}

      <Card withBorder padding="lg" radius="md">
        <form onSubmit={form.onSubmit(invite)}>
          <Group align="flex-end" gap="sm">
            <TextInput
              label="Email"
              placeholder="teammate@company.com"
              {...form.getInputProps('email')}
              w={280}
            />
            <Select
              label="Role"
              data={ROLE_OPTIONS}
              {...form.getInputProps('roles')}
              w={220}
            />
            <Button type="submit" leftSection={<IconUserPlus size={16} />}>
              Invite
            </Button>
          </Group>
        </form>
        {inviteResult ? (
          <Alert color="green" mt="md">
            Invited <b>{inviteResult.email}</b>.
            {inviteResult.token ? (
              <Text size="sm" mt={4}>
                Share this signup link:{' '}
                <Anchor href={`${config.nocodbUrl}/#/signup/${inviteResult.token}`} target="_blank">
                  {`${config.nocodbUrl}/#/signup/${inviteResult.token}`}
                </Anchor>
              </Text>
            ) : null}
          </Alert>
        ) : null}
      </Card>

      <Paper withBorder p="md" radius="md">
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Email</Table.Th>
              <Table.Th>Display name</Table.Th>
              <Table.Th>Roles</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={3}>
                  <Text c="dimmed">Loading...</Text>
                </Table.Td>
              </Table.Tr>
            ) : users.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={3}>
                  <Text c="dimmed">No users yet.</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              users.map((u) => (
                <Table.Tr key={u.id}>
                  <Table.Td>{u.email}</Table.Td>
                  <Table.Td>{u.display_name || <Text c="dimmed">—</Text>}</Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      {(u.roles ?? '').split(',').filter(Boolean).map((r) => (
                        <Badge key={r} variant="light" size="sm">
                          {r}
                        </Badge>
                      ))}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}
