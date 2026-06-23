import { API_ROUTES } from '../api/routes';
import { ApiMessage, PaginatedResponse, UnreadCountResponse } from '../types/api';
import { apiFetch } from './apiClient';

export async function getThread(propertyId: number): Promise<ApiMessage[]> {
  const data = await apiFetch<PaginatedResponse<ApiMessage> | ApiMessage[]>(
    API_ROUTES.messages.thread(propertyId),
  );
  return Array.isArray(data) ? data : data.results;
}

export async function sendMessage(payload: {
  property_id: number;
  subject: string;
  content: string;
}): Promise<ApiMessage> {
  return apiFetch<ApiMessage>(API_ROUTES.messages.send, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getUnreadCount(): Promise<number> {
  const data = await apiFetch<UnreadCountResponse>(API_ROUTES.messages.unreadCount);
  return data.unread_count;
}

export async function getInbox(): Promise<ApiMessage[]> {
  const data = await apiFetch<PaginatedResponse<ApiMessage> | ApiMessage[]>(
    API_ROUTES.messages.inbox,
  );
  return Array.isArray(data) ? data : data.results;
}

export async function getSent(): Promise<ApiMessage[]> {
  const data = await apiFetch<PaginatedResponse<ApiMessage> | ApiMessage[]>(
    API_ROUTES.messages.sent,
  );
  return Array.isArray(data) ? data : data.results;
}

export async function deleteMessage(messageId: number): Promise<void> {
  await apiFetch(API_ROUTES.messages.details(messageId), { method: 'DELETE' });
}

export async function markAsRead(messageId: number): Promise<void> {
  await apiFetch(API_ROUTES.messages.markAsRead(messageId), { method: 'POST' });
}
