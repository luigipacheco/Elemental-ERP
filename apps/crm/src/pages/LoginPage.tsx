import { Alert, Button, Center, Paper, PasswordInput, Stack, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useLogin } from '@refinedev/core';
import { config } from '../config';

export function LoginPage() {
  const { mutate: login, isLoading, error } = useLogin<{ email: string; password: string }>();
  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email: (v) => (/^.+@.+\..+$/.test(v) ? null : 'Enter a valid email'),
      password: (v) => (v.length > 0 ? null : 'Password required'),
    },
  });

  return (
    <Center h="100vh">
      <Paper withBorder p="xl" radius="md" w={420} shadow="sm">
        <Stack>
          <Title order={3} ta="center">
            {config.appName}
          </Title>
          <form onSubmit={form.onSubmit((values) => login(values))}>
            <Stack>
              <TextInput
                label="Email"
                placeholder="you@company.com"
                autoComplete="email"
                {...form.getInputProps('email')}
              />
              <PasswordInput
                label="Password"
                placeholder="Your password"
                autoComplete="current-password"
                {...form.getInputProps('password')}
              />
              {error ? (
                <Alert color="red" variant="light">
                  {error.message}
                </Alert>
              ) : null}
              <Button type="submit" loading={isLoading} fullWidth>
                Sign in
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Center>
  );
}
