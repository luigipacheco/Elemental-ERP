import { Badge, Card, Group, Paper, ScrollArea, Stack, Text } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useUpdate } from '@refinedev/core';
import type { ReactNode } from 'react';

/**
 * Lightweight kanban board with drag-and-drop powered by the HTML5 DnD API.
 * Dropping a card on a different column updates the configured `groupBy`
 * field on the underlying record. We deliberately avoid heavy DnD libraries
 * here to keep the bundle small.
 */
export interface KanbanColumn {
  id: string;
  title: string;
  /** Optional accent color for the column header. */
  color?: string;
}

export interface KanbanBoardProps<TRow extends { Id: number }> {
  resource: string;
  groupBy: keyof TRow & string;
  columns: KanbanColumn[];
  rows: TRow[];
  renderCard: (row: TRow) => ReactNode;
  /** Optional href factory; cards become links to the show page. */
  hrefFor?: (row: TRow) => string;
}

export function KanbanBoard<TRow extends { Id: number }>({
  resource,
  groupBy,
  columns,
  rows,
  renderCard,
  hrefFor,
}: KanbanBoardProps<TRow>) {
  const { mutate: update } = useUpdate();

  return (
    <ScrollArea>
      <Group align="flex-start" wrap="nowrap" gap="md">
        {columns.map((col) => {
          const colRows = rows.filter(
            (r) => String((r as Record<string, unknown>)[groupBy] ?? '') === col.id,
          );
          return (
            <Paper
              key={col.id}
              withBorder
              p="xs"
              radius="md"
              w={300}
              miw={300}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const id = e.dataTransfer.getData('text/plain');
                if (!id) return;
                update({
                  resource,
                  id,
                  values: { [groupBy]: col.id },
                });
              }}
            >
              <Group justify="space-between" mb="xs" px={4}>
                <Text fw={600} size="sm">
                  {col.title}
                </Text>
                <Badge variant="light" color={col.color ?? 'gray'} size="sm">
                  {colRows.length}
                </Badge>
              </Group>
              <Stack gap="xs">
                {colRows.map((row) => {
                  const cardContent = (
                    <Card
                      withBorder
                      shadow="xs"
                      radius="sm"
                      padding="xs"
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', String(row.Id))}
                      style={{ cursor: 'grab' }}
                    >
                      {renderCard(row)}
                    </Card>
                  );
                  if (hrefFor) {
                    return (
                      <Link
                        key={row.Id}
                        to={hrefFor(row)}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        {cardContent}
                      </Link>
                    );
                  }
                  return <div key={row.Id}>{cardContent}</div>;
                })}
              </Stack>
            </Paper>
          );
        })}
      </Group>
    </ScrollArea>
  );
}
