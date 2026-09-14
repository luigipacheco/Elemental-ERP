import {
  Anchor,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useCreate, useOne, useUpdate } from '@refinedev/core';
import { ListShell, type ListColumn } from '../components/ListShell';
import { PageTitle } from '@elemental/ui';

const RESOURCE = 'companies';

interface Company {
  Id: number;
  name: string;
  domain?: string;
  industry?: string;
  size?: string;
  country?: string;
  notes?: string;
}

const SIZE_OPTIONS = ['1-10', '11-50', '51-200', '201-1000', '1000+'].map((v) => ({
  value: v,
  label: v,
}));

const COLUMNS: ListColumn<Company>[] = [
  {
    key: 'name',
    header: 'Name',
    render: (r) => (
      <Anchor component={Link} to={`show/${r.Id}`} fw={500}>
        {r.name}
      </Anchor>
    ),
  },
  { key: 'industry', header: 'Industry' },
  { key: 'size', header: 'Size', width: 120 },
  { key: 'country', header: 'Country', width: 120 },
  {
    key: 'domain',
    header: 'Website',
    render: (r) =>
      r.domain ? (
        <Anchor href={r.domain} target="_blank" rel="noreferrer">
          {prettyDomain(r.domain)}
        </Anchor>
      ) : (
        <Text c="dimmed">—</Text>
      ),
  },
];

function prettyDomain(d: string) {
  try {
    return new URL(d).host;
  } catch {
    return d;
  }
}

export function CompaniesList() {
  return (
    <ListShell<Company>
      resource={RESOURCE}
      title="Companies"
      subtitle="Organizations you sell to or partner with"
      columns={COLUMNS}
      searchableFields={['name', 'industry', 'country']}
    />
  );
}

function CompanyForm({
  initial,
  onSubmit,
  submitting,
}: {
  initial?: Partial<Company>;
  onSubmit: (values: Partial<Company>) => void;
  submitting?: boolean;
}) {
  const form = useForm<Partial<Company>>({
    initialValues: {
      name: initial?.name ?? '',
      domain: initial?.domain ?? '',
      industry: initial?.industry ?? '',
      size: initial?.size ?? '',
      country: initial?.country ?? '',
      notes: initial?.notes ?? '',
    },
    validate: { name: (v) => (v && v.length > 0 ? null : 'Required') },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <TextInput label="Name" required {...form.getInputProps('name')} />
        <Group grow>
          <TextInput label="Industry" {...form.getInputProps('industry')} />
          <Select
            label="Size"
            data={SIZE_OPTIONS}
            clearable
            {...form.getInputProps('size')}
          />
        </Group>
        <Group grow>
          <TextInput label="Country" {...form.getInputProps('country')} />
          <TextInput label="Website" placeholder="https://..." {...form.getInputProps('domain')} />
        </Group>
        <Textarea label="Notes" autosize minRows={3} {...form.getInputProps('notes')} />
        <Group justify="flex-end">
          <Button type="submit" loading={submitting}>
            Save
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export function CompaniesCreate() {
  const navigate = useNavigate();
  const { mutate: create, isLoading } = useCreate<Company>();
  return (
    <Stack>
      <PageTitle title="New company" />
      <Paper withBorder p="lg" radius="md">
        <CompanyForm
          submitting={isLoading}
          onSubmit={(values) =>
            create(
              { resource: RESOURCE, values },
              { onSuccess: ({ data }) => navigate(`/companies/show/${data.Id}`) },
            )
          }
        />
      </Paper>
    </Stack>
  );
}

export function CompaniesEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useOne<Company>({ resource: RESOURCE, id });
  const { mutate: update, isLoading: saving } = useUpdate<Company>();

  if (isLoading) return <Text>Loading...</Text>;
  return (
    <Stack>
      <PageTitle title={`Edit ${data?.data.name ?? 'company'}`} />
      <Paper withBorder p="lg" radius="md">
        <CompanyForm
          initial={data?.data}
          submitting={saving}
          onSubmit={(values) =>
            update(
              { resource: RESOURCE, id: id!, values },
              { onSuccess: () => navigate(`/companies/show/${id}`) },
            )
          }
        />
      </Paper>
    </Stack>
  );
}

export function CompaniesShow() {
  const { id } = useParams();
  const { data, isLoading } = useOne<Company>({ resource: RESOURCE, id });
  if (isLoading) return <Text>Loading...</Text>;
  const c = data?.data;
  if (!c) return <Text>Not found</Text>;

  return (
    <Stack>
      <PageTitle
        title={c.name}
        subtitle={c.industry || undefined}
        actions={
          <Button component={Link} to={`/companies/edit/${id}`} variant="default">
            Edit
          </Button>
        }
      />
      <Paper withBorder p="lg" radius="md">
        <Stack gap="xs">
          <Field label="Website">
            {c.domain ? (
              <Anchor href={c.domain} target="_blank" rel="noreferrer">
                {c.domain}
              </Anchor>
            ) : (
              <Text c="dimmed">—</Text>
            )}
          </Field>
          <Field label="Size">{c.size ?? <Text c="dimmed">—</Text>}</Field>
          <Field label="Country">{c.country ?? <Text c="dimmed">—</Text>}</Field>
          <Field label="Notes">
            <Text style={{ whiteSpace: 'pre-wrap' }}>{c.notes || <Text c="dimmed">—</Text>}</Text>
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
