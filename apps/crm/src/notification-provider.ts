import type { NotificationProvider } from '@refinedev/core';
import { notifications } from '@mantine/notifications';

/** Mantine v7 notification bridge for Refine (replaces @refinedev/mantine). */
export const notificationProvider: NotificationProvider = {
  open: ({ message, description, type, key }) => {
    const color =
      type === 'success' ? 'green' : type === 'error' ? 'red' : type === 'progress' ? 'blue' : 'gray';
    notifications.show({
      id: key,
      title: message,
      message: description,
      color,
    });
  },
  close: (key) => {
    notifications.hide(key);
  },
};
