import { API_ROUTES } from '../api/routes';
import { apiFetch } from './apiClient';

export interface AppNotification {
  id: number;
  notification_type: string;
  title: string;
  body: string;
  property_id: number | null;
  message_id: number | null;
  metadata: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  message_alerts: boolean;
  new_listing_alerts: boolean;
  property_updates: boolean;
  updated_at: string;
}

interface PaginatedNotifications {
  count: number;
  next: string | null;
  previous: string | null;
  results: AppNotification[];
}

export async function getNotifications(page = 1): Promise<PaginatedNotifications> {
  return apiFetch<PaginatedNotifications>(`${API_ROUTES.notifications.list}?page=${page}`);
}

export async function getNotificationUnreadCount(): Promise<number> {
  const data = await apiFetch<{ unread_count: number }>(API_ROUTES.notifications.unreadCount);
  return data.unread_count;
}

export async function markNotificationRead(id: number): Promise<AppNotification> {
  return apiFetch<AppNotification>(API_ROUTES.notifications.markRead(id), { method: 'POST' });
}

export async function markAllNotificationsRead(): Promise<{ marked_read: number }> {
  return apiFetch<{ marked_read: number }>(API_ROUTES.notifications.markAllRead, { method: 'POST' });
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  return apiFetch<NotificationPreferences>(API_ROUTES.notifications.preferences);
}

export async function updateNotificationPreferences(
  patch: Partial<Omit<NotificationPreferences, 'updated_at'>>,
): Promise<NotificationPreferences> {
  return apiFetch<NotificationPreferences>(API_ROUTES.notifications.preferences, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export function notificationActionPath(notification: AppNotification): string | null {
  const path = notification.metadata?.action_path;
  if (typeof path === 'string' && path.startsWith('/')) return path;
  if (notification.message_id && notification.property_id) {
    return `/messages/${notification.property_id}`;
  }
  if (notification.property_id) return `/property/${notification.property_id}`;
  return null;
}
