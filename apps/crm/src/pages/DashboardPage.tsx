import {
  Anchor,
  Badge,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { useGetIdentity, useList } from '@refinedev/core';
import {
  IconBriefcase,
  IconCalendarEvent,
  IconCircleCheck,
  IconCurrencyDollar,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { PageTitle, StatTile } from '@elemental/ui';
import type { AppUser } from '../auth-provider';
import { formatMoney, type Deal } from './deals';

interface Task {
  Id: number;
  title: string;
  status?: string;
  due_at?: string;
  priority?: string;
}

interface Activity {
  Id: number;
  subject: string;
  type?: string;
  due_at?: string;
}

const PRIORITY_COLOR: Record<string, string> = {
  low: 'gray',
  medium: 'blue',
  high: 'orange',
  urgent: 'red',
};

export function DashboardPage() {
  const { data: identity } = useGetIdentity<AppUser & { name: string }>();

  const { data: deals } = useList<Deal>({
    resource: 'deals',
    pagination: { pageSize: 200 },
  });
  const { data: tasks } = useList<Task>({
    resource: 'tasks',
    pagination: { pageSize: 100 },
  });
  const { data: activities } = useList<Activity>({
    resource: 'activities',
    pagination: { pageSize: 20 },
    sorters: [{ field: 'CreatedAt', order: 'desc' }],
  });

  const dealRows = deals?.data ?? [];
  const openDeals = dealRows.filter((d) => d.stage !== 'Won' && d.stage !== 'Lost');
  const wonDeals = dealRows.filter((d) => d.stage === 'Won');

  const pipelineValue = openDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const wonValue = wonDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

  const today = dayjs();
  const monthEnd = today.endOf('month');
  const closingSoon = openDeals.filter(
    (d) => d.close_date && dayjs(d.close_date).isAfter(today.subtract(1, 'day')) && dayjs(d.close_date).isBefore(monthEnd),
  );

  const myOpenTasks = (tasks?.data ?? []).filter(
    (t) => t.status !== 'done' && t.status !== 'cancelled',
  );

  return (
    <Stack>
      <PageTitle
        title={`Welcome${identity?.name ? `, ${identity.name}` : ''}`}
        subtitle="Your CRM at a glance"
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <StatTile
          label="Open pipeline"
          value={formatMoney(pipelineValue)}
          hint={`${openDeals.length} active deal${openDeals.length === 1 ? '' : 's'}`}
          icon={<IconCurrencyDollar />}
          accent="brand"
        />
        <StatTile
          label="Closed-won (all time)"
          value={formatMoney(wonValue)}
          hint={`${wonDeals.length} deal${wonDeals.length === 1 ? '' : 's'} won`}
          icon={<IconBriefcase />}
          accent="green"
        />
        <StatTile
          label="Closing this month"
          value={closingSoon.length}
          hint={`${formatMoney(closingSoon.reduce((s, d) => s + (Number(d.value) || 0), 0))} potential`}
          icon={<IconCalendarEvent />}
          accent="orange"
        />
        <StatTile
          label="Open tasks"
          value={myOpenTasks.length}
          hint={`${myOpenTasks.filter((t) => t.priority === 'urgent').length} urgent`}
          icon={<IconCircleCheck />}
          accent="brand"
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <Paper withBorder p="lg" radius="md">
          <Group justify="space-between" mb="sm">
            <Text fw={600}>Closing this month</Text>
            <Anchor component={Link} to="/deals" size="sm">
              View all deals →
            </Anchor>
          </Group>
          {closingSoon.length === 0 ? (
            <Text c="dimmed" size="sm">
              No deals scheduled to close this month.
            </Text>
          ) : (
            <Stack gap="xs">
              {closingSoon
                .sort((a, b) => (a.close_date! < b.close_date! ? -1 : 1))
                .slice(0, 6)
                .map((d) => (
                  <Group key={d.Id} justify="space-between">
                    <Anchor component={Link} to={`/deals/show/${d.Id}`}>
                      {d.title}
                    </Anchor>
                    <Group gap="xs">
                      {d.stage ? <Badge variant="light">{d.stage}</Badge> : null}
                      <Text size="sm" fw={600}>
                        {formatMoney(Number(d.value) || 0, d.currency)}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {dayjs(d.close_date).format('MMM D')}
                      </Text>
                    </Group>
                  </Group>
                ))}
            </Stack>
          )}
        </Paper>

        <Paper withBorder p="lg" radius="md">
          <Group justify="space-between" mb="sm">
            <Text fw={600}>My open tasks</Text>
            <Anchor component={Link} to="/tasks" size="sm">
              View all →
            </Anchor>
          </Group>
          {myOpenTasks.length === 0 ? (
            <Text c="dimmed" size="sm">
              All caught up!
            </Text>
          ) : (
            <Stack gap="xs">
              {myOpenTasks
                .sort((a, b) => (a.due_at ?? '') < (b.due_at ?? '') ? -1 : 1)
                .slice(0, 6)
                .map((t) => (
                  <Group key={t.Id} justify="space-between">
                    <Anchor component={Link} to={`/tasks/show/${t.Id}`}>
                      {t.title}
                    </Anchor>
                    <Group gap="xs">
                      {t.priority ? (
                        <Badge size="sm" color={PRIORITY_COLOR[t.priority] ?? 'gray'} variant="light">
                          {t.priority}
                        </Badge>
                      ) : null}
                      <Text size="xs" c="dimmed">
                        {t.due_at ? dayjs(t.due_at).format('MMM D') : ''}
                      </Text>
                    </Group>
                  </Group>
                ))}
            </Stack>
          )}
        </Paper>
      </SimpleGrid>

      <Paper withBorder p="lg" radius="md">
        <Group justify="space-between" mb="sm">
          <Text fw={600}>Recent activity</Text>
          <Anchor component={Link} to="/activities" size="sm">
            Open timeline →
          </Anchor>
        </Group>
        {(activities?.data ?? []).length === 0 ? (
          <Text c="dimmed" size="sm">
            Nothing logged yet.
          </Text>
        ) : (
          <Stack gap="xs">
            {(activities?.data ?? []).slice(0, 8).map((a) => (
              <Group key={a.Id} justify="space-between">
                <Group gap="xs">
                  {a.type ? <Badge variant="light">{a.type}</Badge> : null}
                  <Anchor component={Link} to={`/activities/show/${a.Id}`}>
                    {a.subject}
                  </Anchor>
                </Group>
                <Text size="xs" c="dimmed">
                  {a.due_at ? dayjs(a.due_at).format('MMM D, HH:mm') : ''}
                </Text>
              </Group>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
