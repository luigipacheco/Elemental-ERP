import { Card, Group, Text, ThemeIcon } from '@mantine/core';
import type { ReactNode } from 'react';

export interface StatTileProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  accent?: 'brand' | 'green' | 'orange' | 'red' | 'gray';
}

export function StatTile({ label, value, hint, icon, accent = 'brand' }: StatTileProps) {
  return (
    <Card withBorder padding="lg" radius="md">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div>
          <Text size="sm" c="dimmed" fw={500}>
            {label}
          </Text>
          <Text size="xl" fw={700} mt={4}>
            {value}
          </Text>
          {hint ? (
            <Text size="xs" c="dimmed" mt={4}>
              {hint}
            </Text>
          ) : null}
        </div>
        {icon ? (
          <ThemeIcon size="lg" radius="md" variant="light" color={accent}>
            {icon}
          </ThemeIcon>
        ) : null}
      </Group>
    </Card>
  );
}
