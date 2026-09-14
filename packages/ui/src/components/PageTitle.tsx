import { Group, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

export interface PageTitleProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageTitle({ title, subtitle, actions }: PageTitleProps) {
  return (
    <Group justify="space-between" align="flex-end" mb="md" wrap="nowrap">
      <Stack gap={2}>
        <Title order={2}>{title}</Title>
        {subtitle ? (
          <Text c="dimmed" size="sm">
            {subtitle}
          </Text>
        ) : null}
      </Stack>
      {actions ? <Group gap="xs">{actions}</Group> : null}
    </Group>
  );
}
