import { Center, Stack, Text, ThemeIcon } from '@mantine/core';
import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Center py="xl">
      <Stack align="center" gap="xs" maw={420}>
        {icon ? (
          <ThemeIcon size={48} radius="xl" variant="light" color="gray">
            {icon}
          </ThemeIcon>
        ) : null}
        <Text fw={600}>{title}</Text>
        {description ? (
          <Text size="sm" c="dimmed" ta="center">
            {description}
          </Text>
        ) : null}
        {action}
      </Stack>
    </Center>
  );
}
