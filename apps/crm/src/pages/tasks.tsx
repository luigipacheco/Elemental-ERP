import {
  Anchor,
  Badge,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useCreate, useOne, useUpdate } from '@refinedev/core';
import { Link, useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { ListShell, type ListColumn } from '../components/ListShell';
import { KanbanBoard, type KanbanColumn } from '../components/KanbanBoard';
import { PageTitle } from '@elemental/ui';

const RESOURCE = 'tasks';

export const TASK_STATUSES: KanbanColumn[] = [
  { id: 'todo', title: 'To do', color: 'gray' },
  { id: 'in_progress', title: 'In progress', color: 'blue' },
  { id: 'done', title: 'Done', color: 'green' },
  { id: 'cancelled', title: 'Cancelled', color: 'red' },
];

const STATUS_OPTIONS = TASK_STATUSES.map((s) => ({ value: s.id, label: s.title }));

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const PRIORITY_COLOR: Record<string, string> = {
  low: 'gray',
  medium: 'blue',
  high: 'orange',
  urgent: 'red',
};

interface Task {
  Id: number;
  title: string;
  due_at?: string;
  priority?: string;
  status?: string;
  assignee?: string;
}

const COLUMNS: ListColumn<Task>[] = [
  {
    key: 'title',
    header: 'Task',
    render: (r) => (
      <Anchor component={Link} to={`show/${r.Id}`} fw={500}>
        {r.title}
      </Anchor>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: 130,
    render: (r) => {
      const col = TASK_STATUSES.find((s) => s.id === r.status);
      return col ? <Badge color={col.color}>{col.title}</Badge> : <Text c="dimmed">—</Text>;
    },
  },
  {
    key: 'priority',
    header: 'Priority',
    width: 110,
    render: (r) =>
      r.priority ? (
        <Badge color={PRIORITY_COLOR[r.priority] ?? 'gray'} variant="light">
          {r.priority}
        </Badge>
      ) : (
        <Text c="dimmed">—</Text>
      ),
  },
  {
    key: 'due_at',
    header: 'Due',
    width: 160,
    render: (r) => (r.due_at ? dayjs(r.due_at).format('MMM D, HH:mm') : <Text c="dimmed">—</Text>),
  },
  { key: 'assignee', header: 'Assignee', width: 120 },
];

export function TasksList() {
  return (
    <ListShell<Task>
      resource={RESOURCE}
      title="Tasks"
      subtitle="What needs to happen next"
      columns={COLUMNS}
      searchableFields={['title', 'assignee']}
      renderKanban={(rows) => (
        <KanbanBoard<Task>
          resource={RESOURCE}
          groupBy="status"
          columns={TASK_STATUSES}
          rows={rows}
          hrefFor={(r) => `show/${r.Id}`}
          renderCard={(r) => (
            <Stack gap={4}>
              <Text fw={600} size="sm" lineClamp={2}>
                {r.title}
              </Text>
              <Group justify="space-between" gap={4}>
                {r.priority ? (
                  <Badge size="xs" color={PRIORITY_COLOR[r.priority] ?? 'gray'} variant="light">
                    {r.priority}
                  </Badge>
                ) : <span />}
                <Text size="xs" c="dimmed">
                  {r.due_at ? dayjs(r.due_at).format('MMM D') : ''}
                </Text>
              </Group>
            </Stack>
          )}
        />
      )}
    />
  );
}

function TaskForm({
  initial,
  onSubmit,
  submitting,
}: {
  initial?: Partial<Task>;
  onSubmit: (values: Partial<Task>) => void;
  submitting?: boolean;
}) {
  const form = useForm<Partial<Task> & { due_at_obj?: Date | null }>({
    initialValues: {
      title: initial?.title ?? '',
      due_at_obj: initial?.due_at ? dayjs(initial.due_at).toDate() : null,
      priority: initial?.priority ?? 'medium',
      status: initial?.status ?? 'todo',
      assignee: initial?.assignee ?? '',
    },
    validate: { title: (v) => (v && v.length > 0 ? null : 'Required') },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) =>
        onSubmit({
          title: values.title,
          priority: values.priority,
          status: values.status,
          assignee: values.assignee,
          due_at: values.due_at_obj ? dayjs(values.due_at_obj).toISOString() : undefined,
        }),
      )}
    >
      <Stack>
        <TextInput label="Title" required {...form.getInputProps('title')} />
        <Group grow>
          <Select label="Status" data={STATUS_OPTIONS} {...form.getInputProps('status')} />
          <Select label="Priority" data={PRIORITY_OPTIONS} {...form.getInputProps('priority')} />
        </Group>
        <Group grow>
          <DateTimePicker label="Due at" clearable {...form.getInputProps('due_at_obj')} />
          <TextInput label="Assignee" {...form.getInputProps('assignee')} />
        </Group>
        <Group justify="flex-end">
          <Button type="submit" loading={submitting}>
            Save
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export function TasksCreate() {
  const navigate = useNavigate();
  const { mutate: create, isLoading } = useCreate<Task>();
  return (
    <Stack>
      <PageTitle title="New task" />
      <Paper withBorder p="lg" radius="md">
        <TaskForm
          submitting={isLoading}
          onSubmit={(values) =>
            create(
              { resource: RESOURCE, values },
              { onSuccess: ({ data }) => navigate(`/tasks/show/${data.Id}`) },
            )
          }
        />
      </Paper>
    </Stack>
  );
}

export function TasksEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useOne<Task>({ resource: RESOURCE, id });
  const { mutate: update, isLoading: saving } = useUpdate<Task>();
  if (isLoading) return <Text>Loading...</Text>;
  return (
    <Stack>
      <PageTitle title="Edit task" />
      <Paper withBorder p="lg" radius="md">
        <TaskForm
          initial={data?.data}
          submitting={saving}
          onSubmit={(values) =>
            update(
              { resource: RESOURCE, id: id!, values },
              { onSuccess: () => navigate(`/tasks/show/${id}`) },
            )
          }
        />
      </Paper>
    </Stack>
  );
}

export function TasksShow() {
  const { id } = useParams();
  const { data, isLoading } = useOne<Task>({ resource: RESOURCE, id });
  if (isLoading) return <Text>Loading...</Text>;
  const t = data?.data;
  if (!t) return <Text>Not found</Text>;
  const statusCol = TASK_STATUSES.find((s) => s.id === t.status);
  return (
    <Stack>
      <PageTitle
        title={t.title}
        subtitle={statusCol?.title}
        actions={
          <Button component={Link} to={`/tasks/edit/${id}`} variant="default">
            Edit
          </Button>
        }
      />
      <Paper withBorder p="lg" radius="md">
        <Stack gap="xs">
          <Field label="Status">
            {statusCol ? <Badge color={statusCol.color}>{statusCol.title}</Badge> : <Text c="dimmed">—</Text>}
          </Field>
          <Field label="Priority">
            {t.priority ? (
              <Badge color={PRIORITY_COLOR[t.priority] ?? 'gray'} variant="light">
                {t.priority}
              </Badge>
            ) : (
              <Text c="dimmed">—</Text>
            )}
          </Field>
          <Field label="Due at">
            {t.due_at ? dayjs(t.due_at).format('MMM D, YYYY HH:mm') : <Text c="dimmed">—</Text>}
          </Field>
          <Field label="Assignee">{t.assignee ?? <Text c="dimmed">—</Text>}</Field>
        </Stack>
      </Paper>
    </Stack>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Group align="flex-start" wrap="nowrap" gap="xl">
      <Text size="sm" c="dimmed" w={120}>
        {label}
      </Text>
      <div style={{ flex: 1 }}>{children}</div>
    </Group>
  );
}
