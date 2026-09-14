import { Alert, Button, Card, Group, List, Paper, Stack, Text } from '@mantine/core';
import { IconExternalLink, IconShieldLock } from '@tabler/icons-react';
import { CanAccess } from '@refinedev/core';
import { config } from '../config';
import { PageTitle } from '@elemental/ui';

/**
 * The "Schema Builder" route. Admins use this to add tables, columns, and
 * views via NocoDB's full Airtable-style UI. We deliberately do not embed it
 * in an iframe: NocoDB requires its own auth context and browsers block
 * cookie sharing across origins. A button that opens it in a new tab is the
 * boring, working choice.
 */
export function SchemaBuilderPage() {
  return (
    <CanAccess
      resource="settings.schema"
      action="read"
      fallback={
        <Stack>
          <PageTitle title="Schema Builder" />
          <Alert color="orange" icon={<IconShieldLock />}>
            Only admins can access the Schema Builder.
          </Alert>
        </Stack>
      }
    >
      <Stack>
        <PageTitle
          title="Schema Builder"
          subtitle="Add tables, fields, relations, and views without writing code"
        />
        <Card withBorder padding="lg" radius="md">
          <Stack>
            <Text>
              The Schema Builder is powered by NocoDB, an open-source spreadsheet-style database
              UI. Anything you build there - new tables, custom columns, relations, kanban or
              calendar views - shows up automatically in {config.appName} after a refresh.
            </Text>
            <Group>
              <Button
                component="a"
                href={config.nocodbUrl}
                target="_blank"
                rel="noreferrer"
                rightSection={<IconExternalLink size={16} />}
              >
                Open Schema Builder
              </Button>
            </Group>
          </Stack>
        </Card>

        <Paper withBorder p="lg" radius="md">
          <Stack gap="xs">
            <Text fw={600}>Cheat sheet</Text>
            <List size="sm" spacing={4}>
              <List.Item>
                <b>Add a field:</b> open a table, click the + at the right of the column header,
                pick a type, save. Reloading {config.appName} will pick it up automatically.
              </List.Item>
              <List.Item>
                <b>Add a view:</b> click the eye icon next to a table, choose Grid / Kanban / Form,
                give it a name. The view dropdown in {config.appName} will list it.
              </List.Item>
              <List.Item>
                <b>Add a relation:</b> create a "Link to another record" column and pick the target
                table. Both sides of the relation are exposed in the data API.
              </List.Item>
              <List.Item>
                <b>Add a new module:</b> create a new <code>Table</code> in the same base; for first-class
                support add a folder under <code>packages/modules/</code> with the same schema and
                rebuild.
              </List.Item>
            </List>
          </Stack>
        </Paper>
      </Stack>
    </CanAccess>
  );
}
