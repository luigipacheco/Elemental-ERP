import {
  Anchor,
  Badge,
  Button,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useCreate, useOne, useUpdate } from '@refinedev/core';
import { Link, useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { ListShell, type ListColumn } from '../components/ListShell';
import { KanbanBoard, type KanbanColumn } from '../components/KanbanBoard';
import { PageTitle } from '@elemental/ui';

const RESOURCE = 'deals';

export const DEAL_STAGES: KanbanColumn[] = [
  { id: 'Lead', title: 'Lead', color: 'gray' },
  { id: 'Qualified', title: 'Qualified', color: 'blue' },
  { id: 'Proposal', title: 'Proposal', color: 'cyan' },
  { id: 'Won', title: 'Won', color: 'green' },
  { id: 'Lost', title: 'Lost', color: 'red' },
];

const STAGE_OPTIONS = DEAL_STAGES.map((s) => ({ value: s.id, label: s.title }));

const CURRENCY_OPTIONS = ['USD', 'EUR', 'MXN', 'GBP'].map((c) => ({ value: c, label: c }));

export interface Deal {
  Id: number;
  title: string;
  value?: number;
  currency?: string;
  stage?: string;
  close_date?: string;
  owner?: string;
}

const COLUMNS: ListColumn<Deal>[] = [
  {
    key: 'title',
    header: 'Deal',
    render: (r) => (
      <Anchor component={Link} to={`show/${r.Id}`} fw={500}>
        {r.title}
      </Anchor>
    ),
  },
  {
    key: 'stage',
    header: 'Stage',
    width: 120,
    render: (r) => (r.stage ? <Badge color={stageColor(r.stage)}>{r.stage}</Badge> : <Text c="dimmed">—</Text>),
  },
  {
    key: 'value',
    header: 'Value',
    width: 140,
    render: (r) =>
      r.value != null ? <Text fw={500}>{formatMoney(r.value, r.currency)}</Text> : <Text c="dimmed">—</Text>,
  },
  {
    key: 'close_date',
    header: 'Close date',
    width: 140,
    render: (r) =>
      r.close_date ? dayjs(r.close_date).format('MMM D, YYYY') : <Text c="dimmed">—</Text>,
  },
  { key: 'owner', header: 'Owner', width: 120 },
];

function stageColor(stage: string) {
  return DEAL_STAGES.find((s) => s.id === stage)?.color ?? 'gray';
}

export function formatMoney(v: number, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(v);
  } catch {
    return `${currency} ${v}`;
  }
}

export function DealsList() {
  return (
    <ListShell<Deal>
      resource={RESOURCE}
      title="Deals"
      subtitle="Sales pipeline"
      columns={COLUMNS}
      searchableFields={['title', 'owner']}
      renderKanban={(rows) => (
        <KanbanBoard<Deal>
          resource={RESOURCE}
          groupBy="stage"
          columns={DEAL_STAGES}
          rows={rows}
          hrefFor={(r) => `show/${r.Id}`}
          renderCard={(r) => (
            <Stack gap={4}>
              <Text fw={600} size="sm" lineClamp={2}>
                {r.title}
              </Text>
              <Group justify="space-between" gap={4}>
                <Text size="xs" c="dimmed">
                  {r.close_date ? dayjs(r.close_date).format('MMM D') : 'No date'}
                </Text>
                <Text size="xs" fw={600}>
                  {r.value != null ? formatMoney(r.value, r.currency) : '—'}
                </Text>
              </Group>
            </Stack>
          )}
        />
      )}
    />
  );
}

function DealForm({
  initial,
  onSubmit,
  submitting,
}: {
  initial?: Partial<Deal>;
  onSubmit: (values: Partial<Deal>) => void;
  submitting?: boolean;
}) {
  const form = useForm<Partial<Deal> & { close_date_obj?: Date | null }>({
    initialValues: {
      title: initial?.title ?? '',
      value: initial?.value ?? 0,
      currency: initial?.currency ?? 'USD',
      stage: initial?.stage ?? 'Lead',
      close_date_obj: initial?.close_date ? dayjs(initial.close_date).toDate() : null,
      owner: initial?.owner ?? '',
    },
    validate: { title: (v) => (v && v.length > 0 ? null : 'Required') },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) =>
        onSubmit({
          title: values.title,
          value: values.value,
          currency: values.currency,
          stage: values.stage,
          owner: values.owner,
          close_date: values.close_date_obj
            ? dayjs(values.close_date_obj).format('YYYY-MM-DD')
            : undefined,
        }),
      )}
    >
      <Stack>
        <TextInput label="Title" required {...form.getInputProps('title')} />
        <Group grow>
          <NumberInput label="Value" min={0} {...form.getInputProps('value')} />
          <Select label="Currency" data={CURRENCY_OPTIONS} {...form.getInputProps('currency')} />
        </Group>
        <Group grow>
          <Select label="Stage" data={STAGE_OPTIONS} {...form.getInputProps('stage')} />
          <DateInput label="Close date" clearable {...form.getInputProps('close_date_obj')} />
        </Group>
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

export function DealsCreate() {
  const navigate = useNavigate();
  const { mutate: create, isLoading } = useCreate<Deal>();
  return (
    <Stack>
      <PageTitle title="New deal" />
      <Paper withBorder p="lg" radius="md">
        <DealForm
          submitting={isLoading}
          onSubmit={(values) =>
            create(
              { resource: RESOURCE, values },
              { onSuccess: ({ data }) => navigate(`/deals/show/${data.Id}`) },
            )
          }
        />
      </Paper>
    </Stack>
  );
}

export function DealsEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useOne<Deal>({ resource: RESOURCE, id });
  const { mutate: update, isLoading: saving } = useUpdate<Deal>();
  if (isLoading) return <Text>Loading...</Text>;
  return (
    <Stack>
      <PageTitle title="Edit deal" />
      <Paper withBorder p="lg" radius="md">
        <DealForm
          initial={data?.data}
          submitting={saving}
          onSubmit={(values) =>
            update(
              { resource: RESOURCE, id: id!, values },
              { onSuccess: () => navigate(`/deals/show/${id}`) },
            )
          }
        />
      </Paper>
    </Stack>
  );
}

export function DealsShow() {
  const { id } = useParams();
  const { data, isLoading } = useOne<Deal>({ resource: RESOURCE, id });
  if (isLoading) return <Text>Loading...</Text>;
  const d = data?.data;
  if (!d) return <Text>Not found</Text>;
  return (
    <Stack>
      <PageTitle
        title={d.title}
        subtitle={d.stage ? `Stage: ${d.stage}` : undefined}
        actions={
          <Button component={Link} to={`/deals/edit/${id}`} variant="default">
            Edit
          </Button>
        }
      />
      <Paper withBorder p="lg" radius="md">
        <Stack gap="xs">
          <Field label="Stage">
            {d.stage ? <Badge color={stageColor(d.stage)}>{d.stage}</Badge> : <Text c="dimmed">—</Text>}
          </Field>
          <Field label="Value">
            {d.value != null ? formatMoney(d.value, d.currency) : <Text c="dimmed">—</Text>}
          </Field>
          <Field label="Close date">
            {d.close_date ? dayjs(d.close_date).format('MMM D, YYYY') : <Text c="dimmed">—</Text>}
          </Field>
          <Field label="Owner">{d.owner ?? <Text c="dimmed">—</Text>}</Field>
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
