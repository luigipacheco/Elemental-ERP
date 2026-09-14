import {
  Anchor,
  Badge,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useCreate, useList, useOne, useUpdate } from '@refinedev/core';
import { Link, useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { ListShell, type ListColumn } from '../components/ListShell';
import { PageTitle } from '@elemental/ui';

const RESOURCE = 'activities';

const TYPE_OPTIONS = [
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'note', label: 'Note' },
];

const RELATED_OPTIONS = [
  { value: 'company', label: 'Company' },
  { value: 'contact', label: 'Contact' },
  { value: 'deal', label: 'Deal' },
];

interface Activity {
  Id: number;
  subject: string;
  type?: string;
  body?: string;
  due_at?: string;
  completed_at?: string;
  related_type?: string;
  owner?: string;
}

const TYPE_COLORS: Record<string, string> = {
  call: 'blue',
  email: 'cyan',
  meeting: 'violet',
  note: 'gray',
};

const COLUMNS: ListColumn<Activity>[] = [
  {
    key: 'subject',
    header: 'Subject',
    render: (r) => (
      <Anchor component={Link} to={`show/${r.Id}`} fw={500}>
        {r.subject}
      </Anchor>
    ),
  },
  {
    key: 'type',
    header: 'Type',
    width: 100,
    render: (r) => (r.type ? <Badge color={TYPE_COLORS[r.type] ?? 'gray'}>{r.type}</Badge> : <Text c="dimmed">—</Text>),
  },
  {
    key: 'due_at',
    header: 'Due',
    width: 160,
    render: (r) => (r.due_at ? dayjs(r.due_at).format('MMM D, HH:mm') : <Text c="dimmed">—</Text>),
  },
  {
    key: 'completed_at',
    header: 'Completed',
    width: 160,
    render: (r) =>
      r.completed_at ? <Badge color="green">{dayjs(r.completed_at).format('MMM D')}</Badge> : <Text c="dimmed">open</Text>,
  },
  { key: 'owner', header: 'Owner', width: 120 },
];

export function ActivitiesList() {
  const { data } = useList<Activity>({
    resource: RESOURCE,
    pagination: { pageSize: 100 },
  });
  const groups = groupByDay(data?.data ?? []);

  return (
    <Stack>
      <ListShell<Activity>
        resource={RESOURCE}
        title="Activities"
        subtitle="Calls, meetings, emails, notes"
        columns={COLUMNS}
        searchableFields={['subject', 'owner']}
      />
      {groups.length > 0 ? (
        <Paper withBorder p="lg" radius="md">
          <Text fw={600} mb="sm">
            Timeline
          </Text>
          <Stack gap="md">
            {groups.map((g) => (
              <Stack key={g.day} gap={4}>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  {g.day}
                </Text>
                {g.items.map((a) => (
                  <Group key={a.Id} gap="xs" wrap="nowrap">
                    {a.type ? <Badge color={TYPE_COLORS[a.type] ?? 'gray'}>{a.type}</Badge> : null}
                    <Anchor component={Link} to={`show/${a.Id}`} fw={500}>
                      {a.subject}
                    </Anchor>
                    {a.due_at ? (
                      <Text size="sm" c="dimmed">
                        {dayjs(a.due_at).format('HH:mm')}
                      </Text>
                    ) : null}
                  </Group>
                ))}
              </Stack>
            ))}
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
}

function groupByDay(rows: Activity[]) {
  const sorted = [...rows].sort((a, b) => (a.due_at ?? '') < (b.due_at ?? '') ? 1 : -1);
  const out: { day: string; items: Activity[] }[] = [];
  for (const r of sorted) {
    const day = r.due_at ? dayjs(r.due_at).format('dddd, MMM D') : 'No date';
    let bucket = out.find((b) => b.day === day);
    if (!bucket) {
      bucket = { day, items: [] };
      out.push(bucket);
    }
    bucket.items.push(r);
  }
  return out;
}

function ActivityForm({
  initial,
  onSubmit,
  submitting,
}: {
  initial?: Partial<Activity>;
  onSubmit: (values: Partial<Activity>) => void;
  submitting?: boolean;
}) {
  const form = useForm<
    Partial<Activity> & { due_at_obj?: Date | null; completed_at_obj?: Date | null }
  >({
    initialValues: {
      subject: initial?.subject ?? '',
      type: initial?.type ?? 'note',
      body: initial?.body ?? '',
      due_at_obj: initial?.due_at ? dayjs(initial.due_at).toDate() : null,
      completed_at_obj: initial?.completed_at ? dayjs(initial.completed_at).toDate() : null,
      related_type: initial?.related_type ?? '',
      owner: initial?.owner ?? '',
    },
    validate: { subject: (v) => (v && v.length > 0 ? null : 'Required') },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) =>
        onSubmit({
          subject: values.subject,
          type: values.type,
          body: values.body,
          related_type: values.related_type || undefined,
          owner: values.owner,
          due_at: values.due_at_obj ? dayjs(values.due_at_obj).toISOString() : undefined,
          completed_at: values.completed_at_obj ? dayjs(values.completed_at_obj).toISOString() : undefined,
        }),
      )}
    >
      <Stack>
        <TextInput label="Subject" required {...form.getInputProps('subject')} />
        <Group grow>
          <Select label="Type" data={TYPE_OPTIONS} {...form.getInputProps('type')} />
          <Select label="Related to" data={RELATED_OPTIONS} clearable {...form.getInputProps('related_type')} />
        </Group>
        <Group grow>
          <DateTimePicker label="Due at" clearable {...form.getInputProps('due_at_obj')} />
          <DateTimePicker label="Completed at" clearable {...form.getInputProps('completed_at_obj')} />
        </Group>
        <Textarea label="Body" autosize minRows={3} {...form.getInputProps('body')} />
        <TextInput label="Owner" {...form.getInputProps('owner')} />
        <Group justify="flex-end">
          <Button type="submit" loading={submitting}>
            Save
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export function ActivitiesCreate() {
  const navigate = useNavigate();
  const { mutate: create, isLoading } = useCreate<Activity>();
  return (
    <Stack>
      <PageTitle title="New activity" />
      <Paper withBorder p="lg" radius="md">
        <ActivityForm
          submitting={isLoading}
          onSubmit={(values) =>
            create(
              { resource: RESOURCE, values },
              { onSuccess: ({ data }) => navigate(`/activities/show/${data.Id}`) },
            )
          }
        />
      </Paper>
    </Stack>
  );
}

export function ActivitiesEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useOne<Activity>({ resource: RESOURCE, id });
  const { mutate: update, isLoading: saving } = useUpdate<Activity>();
  if (isLoading) return <Text>Loading...</Text>;
  return (
    <Stack>
      <PageTitle title="Edit activity" />
      <Paper withBorder p="lg" radius="md">
        <ActivityForm
          initial={data?.data}
          submitting={saving}
          onSubmit={(values) =>
            update(
              { resource: RESOURCE, id: id!, values },
              { onSuccess: () => navigate(`/activities/show/${id}`) },
            )
          }
        />
      </Paper>
    </Stack>
  );
}

export function ActivitiesShow() {
  const { id } = useParams();
  const { data, isLoading } = useOne<Activity>({ resource: RESOURCE, id });
  if (isLoading) return <Text>Loading...</Text>;
  const a = data?.data;
  if (!a) return <Text>Not found</Text>;
  return (
    <Stack>
      <PageTitle
        title={a.subject}
        subtitle={a.type ?? undefined}
        actions={
          <Button component={Link} to={`/activities/edit/${id}`} variant="default">
            Edit
          </Button>
        }
      />
      <Paper withBorder p="lg" radius="md">
        <Stack gap="xs">
          <Field label="Type">{a.type ?? <Text c="dimmed">—</Text>}</Field>
          <Field label="Due at">
            {a.due_at ? dayjs(a.due_at).format('MMM D, YYYY HH:mm') : <Text c="dimmed">—</Text>}
          </Field>
          <Field label="Completed">
            {a.completed_at ? dayjs(a.completed_at).format('MMM D, YYYY HH:mm') : <Text c="dimmed">open</Text>}
          </Field>
          <Field label="Body">
            <Text style={{ whiteSpace: 'pre-wrap' }}>
              {a.body || <Text c="dimmed">—</Text>}
            </Text>
          </Field>
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
