import { Authenticated, Refine } from '@refinedev/core';
import { Center, Loader } from '@mantine/core';
import routerProvider, {
  CatchAllNavigate,
  NavigateToResource,
} from '@refinedev/react-router-v6';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { elementalTheme } from '@elemental/ui';

import { authProvider } from './auth-provider';
import { notificationProvider } from './notification-provider';
import { dataProvider } from './data-provider';
import { accessControlProvider } from './access-control';
import { modules } from './modules';
import { AppLayout } from './layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CompaniesList, CompaniesShow, CompaniesEdit, CompaniesCreate } from './pages/companies';
import { ContactsList, ContactsShow, ContactsEdit, ContactsCreate } from './pages/contacts';
import { DealsList, DealsShow, DealsEdit, DealsCreate } from './pages/deals';
import { ActivitiesList, ActivitiesShow, ActivitiesEdit, ActivitiesCreate } from './pages/activities';
import { TasksList, TasksShow, TasksEdit, TasksCreate } from './pages/tasks';
import { SchemaBuilderPage } from './pages/SchemaBuilderPage';
import { UsersPage } from './pages/UsersPage';
import { resolveIcon } from './icons';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

function AuthLoading() {
  return (
    <Center h="100vh">
      <Loader size="lg" />
    </Center>
  );
}

export default function App() {
  const refineResources = modules.flatMap((mod) =>
    mod.resources.map((r) => {
      const Icon = resolveIcon(r.icon);
      return {
        name: r.name,
        list: r.path ?? `/${r.name}`,
        show: `${r.path ?? `/${r.name}`}/show/:id`,
        create: `${r.path ?? `/${r.name}`}/create`,
        edit: `${r.path ?? `/${r.name}`}/edit/:id`,
        meta: {
          label: r.label,
          icon: <Icon size={18} />,
          canDelete: true,
        },
      };
    }),
  );

  return (
    <BrowserRouter>
      <MantineProvider theme={elementalTheme} defaultColorScheme="light">
        <ModalsProvider>
          <Notifications position="top-right" />
            <Refine
              authProvider={authProvider}
              dataProvider={dataProvider}
              routerProvider={routerProvider}
              accessControlProvider={accessControlProvider}
              notificationProvider={notificationProvider}
              resources={refineResources}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
              }}
            >
              <Routes>
                <Route
                  element={
                    <Authenticated
                      key="protected"
                      loading={<AuthLoading />}
                      fallback={<CatchAllNavigate to="/login" />}
                    >
                      <AppLayout>
                        <Outlet />
                      </AppLayout>
                    </Authenticated>
                  }
                >
                  <Route index element={<DashboardPage />} />

                  <Route path="companies">
                    <Route index element={<CompaniesList />} />
                    <Route path="create" element={<CompaniesCreate />} />
                    <Route path="show/:id" element={<CompaniesShow />} />
                    <Route path="edit/:id" element={<CompaniesEdit />} />
                  </Route>

                  <Route path="contacts">
                    <Route index element={<ContactsList />} />
                    <Route path="create" element={<ContactsCreate />} />
                    <Route path="show/:id" element={<ContactsShow />} />
                    <Route path="edit/:id" element={<ContactsEdit />} />
                  </Route>

                  <Route path="deals">
                    <Route index element={<DealsList />} />
                    <Route path="create" element={<DealsCreate />} />
                    <Route path="show/:id" element={<DealsShow />} />
                    <Route path="edit/:id" element={<DealsEdit />} />
                  </Route>

                  <Route path="activities">
                    <Route index element={<ActivitiesList />} />
                    <Route path="create" element={<ActivitiesCreate />} />
                    <Route path="show/:id" element={<ActivitiesShow />} />
                    <Route path="edit/:id" element={<ActivitiesEdit />} />
                  </Route>

                  <Route path="tasks">
                    <Route index element={<TasksList />} />
                    <Route path="create" element={<TasksCreate />} />
                    <Route path="show/:id" element={<TasksShow />} />
                    <Route path="edit/:id" element={<TasksEdit />} />
                  </Route>

                  <Route path="settings">
                    <Route path="schema" element={<SchemaBuilderPage />} />
                    <Route path="users" element={<UsersPage />} />
                  </Route>

                  <Route path="*" element={<NavigateToResource />} />
                </Route>

                <Route
                  element={
                    <Authenticated key="public" loading={<AuthLoading />} fallback={<Outlet />}>
                      <NavigateToResource />
                    </Authenticated>
                  }
                >
                  <Route path="/login" element={<LoginPage />} />
                </Route>
              </Routes>
            </Refine>
        </ModalsProvider>
      </MantineProvider>
    </BrowserRouter>
  );
}
