import { ActionIcon, Group, Loader, Menu, Text, Tooltip } from '@mantine/core';
import { IconChevronDown, IconLayoutGrid, IconLayoutKanban, IconRefresh } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { nocodbMeta } from '../data-provider';

/**
 * View-bridge component. Reads the available NocoDB views for the given
 * resource and exposes a dropdown so end users can switch views without
 * leaving the curated CRM UI. The selected view id is persisted in the
 * URL as `?view=<id>` so links and refreshes preserve the choice.
 *
 * Admins create new views in NocoDB; they appear here automatically.
 */
export interface NocoView {
  id: string;
  title: string;
  type: number;
}

const VIEW_TYPE_LABEL: Record<number, string> = {
  1: 'Grid',
  2: 'Form',
  3: 'Gallery',
  4: 'Kanban',
  6: 'Calendar',
};

export interface ViewPickerProps {
  resource: string;
  onChange?: (view: NocoView | null) => void;
}

export function ViewPicker({ resource, onChange }: ViewPickerProps) {
  const [views, setViews] = useState<NocoView[]>([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useSearchParams();
  const selectedId = params.get('view');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    nocodbMeta
      .listViews(resource)
      .then((list) => {
        if (cancelled) return;
        setViews(list as NocoView[]);
        if (!selectedId && list[0]) {
          // Auto-select the first view so subsequent renders use a stable id.
          const next = new URLSearchParams(params);
          next.set('view', list[0].id);
          setParams(next, { replace: true });
        }
      })
      .catch(() => {
        // Resource may not be in NocoDB yet (e.g. still seeding) - degrade silently.
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  const selected = views.find((v) => v.id === selectedId) ?? views[0];

  useEffect(() => {
    onChange?.(selected ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  if (loading) {
    return (
      <Group gap="xs">
        <Loader size="xs" />
        <Text size="sm" c="dimmed">
          Loading views
        </Text>
      </Group>
    );
  }

  if (!views.length) return null;

  return (
    <Menu position="bottom-start" withinPortal>
      <Menu.Target>
        <Group gap={4} style={{ cursor: 'pointer' }}>
          {selected?.type === 4 ? <IconLayoutKanban size={16} /> : <IconLayoutGrid size={16} />}
          <Text size="sm" fw={500}>
            {selected?.title ?? 'Default view'}
          </Text>
          <IconChevronDown size={14} />
        </Group>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Available views</Menu.Label>
        {views.map((v) => (
          <Menu.Item
            key={v.id}
            leftSection={v.type === 4 ? <IconLayoutKanban size={14} /> : <IconLayoutGrid size={14} />}
            onClick={() => {
              const next = new URLSearchParams(params);
              next.set('view', v.id);
              setParams(next);
            }}
            rightSection={
              <Text size="xs" c="dimmed">
                {VIEW_TYPE_LABEL[v.type] ?? ''}
              </Text>
            }
          >
            {v.title}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}

export function RefreshButton({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip label="Refresh">
      <ActionIcon variant="subtle" onClick={onClick}>
        <IconRefresh size={16} />
      </ActionIcon>
    </Tooltip>
  );
}
