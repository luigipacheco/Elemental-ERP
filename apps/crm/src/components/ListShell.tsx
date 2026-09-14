import {
  ActionIcon,
  Box,
  Button,
  Group,
  Pagination,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { IconEdit, IconEye, IconPlus, IconTrash } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useDelete, useList, type CrudFilters } from '@refinedev/core';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageTitle, EmptyState } from '@elemental/ui';
import { ViewPicker, type NocoView } from './ViewPicker';

export interface ListColumn<TRow> {
  /** Unique key, also used as accessor when render is omitted. */
  key: keyof TRow & string;
  header: string;
  width?: number;
  render?: (row: TRow) => React.ReactNode;
}

export interface ListShellProps<TRow extends { Id: number }> {
  resource: string;
  title: string;
  subtitle?: string;
  columns: ListColumn<TRow>[];
  /** Optional kanban renderer rendered when the picked view is type=4 (kanban). */
  renderKanban?: (rows: TRow[]) => JSX.Element;
  /** Search-friendly columns for the simple text search box. */
  searchableFields?: string[];
}

const PAGE_SIZE = 25;

/**
 * Generic list page used by every CRM resource. It plugs into the view-bridge:
 * when a NocoDB view is selected, its `viewId` is forwarded to the data
 * provider via `meta.viewId`, so columns/filters/sort defined in NocoDB are
 * applied server-side.
 */
export function ListShell<TRow extends { Id: number }>({
  resource,
  title,
  subtitle,
  columns,
  renderKanban,
  searchableFields = [],
}: ListShellProps<TRow>) {
  const [params] = useSearchParams();
  const viewId = params.get('view') ?? undefined;
  const [activeView, setActiveView] = useState<NocoView | null>(null);
  const [search, setSearch] = useState('');
  const [current, setCurrent] = useState(1);

  const filters: CrudFilters | undefined = useMemo(() => {
    if (!search || !searchableFields.length) return undefined;
    return searchableFields.map((f) => ({
      field: f,
      operator: 'contains' as const,
      value: search,
    }));
  }, [search, searchableFields]);

  const { data, isLoading, refetch } = useList<TRow>({
    resource,
    pagination: { current, pageSize: PAGE_SIZE },
    filters,
    meta: viewId ? { viewId } : undefined,
  });

  const { mutate: deleteRow } = useDelete();

  const rows = (data?.data ?? []) as TRow[];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const showKanban = activeView?.type === 4 && !!renderKanban;

  return (
    <Stack>
      <PageTitle
        title={title}
        subtitle={subtitle}
        actions={
          <>
            <ViewPicker resource={resource} onChange={setActiveView} />
            <Button leftSection={<IconPlus size={16} />} component={Link} to="create" size="sm">
              New
            </Button>
          </>
        }
      />

      {searchableFields.length > 0 ? (
        <Group>
          <TextInput
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setCurrent(1);
            }}
            placeholder="Search..."
            size="sm"
            w={300}
          />
          {search ? (
            <Text size="xs" c="dimmed">
              filtering by {searchableFields.join(', ')}
            </Text>
          ) : null}
        </Group>
      ) : null}

      {showKanban ? (
        renderKanban!(rows)
      ) : rows.length === 0 && !isLoading ? (
        <EmptyState
          title={`No ${title.toLowerCase()} yet`}
          description="Create your first record to get started."
          action={
            <Button component={Link} to="create" leftSection={<IconPlus size={16} />}>
              New {title.toLowerCase()}
            </Button>
          }
        />
      ) : (
        <Box style={{ overflowX: 'auto' }}>
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                {columns.map((c) => (
                  <Table.Th key={c.key} style={{ width: c.width }}>
                    {c.header}
                  </Table.Th>
                ))}
                <Table.Th style={{ width: 110 }}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((row) => (
                <Table.Tr key={row.Id}>
                  {columns.map((c) => (
                    <Table.Td key={c.key}>
                      {c.render ? c.render(row) : formatCell((row as Record<string, unknown>)[c.key])}
                    </Table.Td>
                  ))}
                  <Table.Td>
                    <Group gap={4} justify="flex-end">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        component={Link}
                        to={`show/${row.Id}`}
                        aria-label="View"
                      >
                        <IconEye size={14} />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        component={Link}
                        to={`edit/${row.Id}`}
                        aria-label="Edit"
                      >
                        <IconEdit size={14} />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="red"
                        aria-label="Delete"
                        onClick={() => {
                          if (window.confirm('Delete this record?')) {
                            deleteRow(
                              { resource, id: row.Id },
                              { onSuccess: () => refetch() },
                            );
                          }
                        }}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          <Group mt="md" justify="space-between">
            <Text size="sm" c="dimmed">
              {total} record{total === 1 ? '' : 's'}
            </Text>
            <Pagination total={pageCount} value={current} onChange={setCurrent} size="sm" />
          </Group>
        </Box>
      )}
    </Stack>
  );
}

function formatCell(v: unknown): React.ReactNode {
  if (v === null || v === undefined || v === '') return <Text c="dimmed">—</Text>;
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}
