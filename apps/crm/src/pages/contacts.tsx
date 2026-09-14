import {
  Anchor,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  TagsInput,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useCreate, useList, useOne, useUpdate } from '@refinedev/core';
import { ListShell, type ListColumn } from '../components/ListShell';
import { PageTitle } from '@elemental/ui';
import { useMemo } from 'react';

const RESOURCE = 'contacts';

interface Contact {
  Id: number;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  title?: string;
  tags?: string;
  owner?: string;
  company?: { Id: number; name: string } | null;
}

interface Company {
  Id: number;
  name: string;
}

const COLUMNS: ListColumn<Contact>[] = [
  {
    key: 'first_name',
    header: 'Name',
    render: (r) => (
      <Anchor component={Link} to={`show/${r.Id}`} fw={500}>
        {[r.first_name, r.last_name].filter(Boolean).join(' ')}
      </Anchor>
    ),
  },
  { key: 'title', header: 'Title' },
  {
    key: 'email',
    header: 'Email',
    render: (r) =>
      r.email ? <Anchor href={`mailto:${r.email}`}>{r.email}</Anchor> : <Text c="dimmed">—</Text>,
  },
  { key: 'phone', header: 'Phone', width: 160 },
  { key: 'tags', header: 'Tags' },
];

export function ContactsList() {
  return (
    <ListShell<Contact>
      resource={RESOURCE}
      title="Contacts"
      subtitle="People you talk to"
      columns={COLUMNS}
      searchableFields={['first_name', 'last_name', 'email', 'title']}
    />
  );
}

function ContactForm({
  initial,
  onSubmit,
  submitting,
}: {
  initial?: Partial<Contact>;
  onSubmit: (values: Partial<Contact>) => void;
  submitting?: boolean;
}) {
  const { data: companies } = useList<Company>({
    resource: 'companies',
    pagination: { pageSize: 200 },
  });
  const companyOptions = useMemo(
    () =>
      (companies?.data ?? [])
        .map((c) => ({ value: String(c.Id), label: c.name || `Company #${c.Id}` }))
        .filter((o) => o.label),
    [companies?.data],
  );

  const form = useForm<Partial<Contact> & { company_id?: string; tags_arr?: string[] }>({
    initialValues: {
      first_name: initial?.first_name ?? '',
      last_name: initial?.last_name ?? '',
      email: initial?.email ?? '',
      phone: initial?.phone ?? '',
      title: initial?.title ?? '',
      owner: initial?.owner ?? '',
      company_id: initial?.company
        ? String(typeof initial.company === 'object' && initial.company !== null && 'Id' in initial.company
            ? (initial.company as { Id: number }).Id
            : initial.company)
        : '',
      tags_arr: typeof initial?.tags === 'string' && initial.tags.length
        ? initial.tags.split(',').map((s) => s.trim())
        : [],
    },
    validate: { first_name: (v) => (v && v.length > 0 ? null : 'Required') },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) =>
        onSubmit({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone: values.phone,
          title: values.title,
          owner: values.owner,
          tags: (values.tags_arr ?? []).join(','),
          ...(values.company_id ? { company: Number(values.company_id) } : {}),
        }),
      )}
    >
      <Stack>
        <Group grow>
          <TextInput label="First name" required {...form.getInputProps('first_name')} />
          <TextInput label="Last name" {...form.getInputProps('last_name')} />
        </Group>
        <Group grow>
          <TextInput label="Email" {...form.getInputProps('email')} />
          <TextInput label="Phone" {...form.getInputProps('phone')} />
        </Group>
        <Group grow>
          <TextInput label="Job title" {...form.getInputProps('title')} />
          <Select
            label="Company"
            data={companyOptions}
            searchable
            clearable
            {...form.getInputProps('company_id')}
          />
        </Group>
        <TagsInput label="Tags" {...form.getInputProps('tags_arr')} />
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

export function ContactsCreate() {
  const navigate = useNavigate();
  const { mutate: create, isLoading } = useCreate<Contact>();
  return (
    <Stack>
      <PageTitle title="New contact" />
      <Paper withBorder p="lg" radius="md">
        <ContactForm
          submitting={isLoading}
          onSubmit={(values) =>
            create(
              { resource: RESOURCE, values },
              { onSuccess: ({ data }) => navigate(`/contacts/show/${data.Id}`) },
            )
          }
        />
      </Paper>
    </Stack>
  );
}

export function ContactsEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useOne<Contact>({ resource: RESOURCE, id });
  const { mutate: update, isLoading: saving } = useUpdate<Contact>();

  if (isLoading) return <Text>Loading...</Text>;
  return (
    <Stack>
      <PageTitle title={`Edit contact`} />
      <Paper withBorder p="lg" radius="md">
        <ContactForm
          initial={data?.data}
          submitting={saving}
          onSubmit={(values) =>
            update(
              { resource: RESOURCE, id: id!, values },
              { onSuccess: () => navigate(`/contacts/show/${id}`) },
            )
          }
        />
      </Paper>
    </Stack>
  );
}

export function ContactsShow() {
  const { id } = useParams();
  const { data, isLoading } = useOne<Contact>({ resource: RESOURCE, id });
  if (isLoading) return <Text>Loading...</Text>;
  const c = data?.data;
  if (!c) return <Text>Not found</Text>;
  return (
    <Stack>
      <PageTitle
        title={[c.first_name, c.last_name].filter(Boolean).join(' ')}
        subtitle={c.title || undefined}
        actions={
          <Button component={Link} to={`/contacts/edit/${id}`} variant="default">
            Edit
          </Button>
        }
      />
      <Paper withBorder p="lg" radius="md">
        <Stack gap="xs">
          <Field label="Email">
            {c.email ? <Anchor href={`mailto:${c.email}`}>{c.email}</Anchor> : <Text c="dimmed">—</Text>}
          </Field>
          <Field label="Phone">{c.phone ?? <Text c="dimmed">—</Text>}</Field>
          <Field label="Tags">{c.tags ?? <Text c="dimmed">—</Text>}</Field>
          <Field label="Owner">{c.owner ?? <Text c="dimmed">—</Text>}</Field>
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
