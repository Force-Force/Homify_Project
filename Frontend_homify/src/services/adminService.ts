import { API_ROUTES } from '../api/routes';
import { ApiPropertyDetail, PaginatedResponse } from '../types/api';
import { apiFetch } from './apiClient';

export async function getPendingProperties(): Promise<ApiPropertyDetail[]> {
  const data = await apiFetch<PaginatedResponse<ApiPropertyDetail> | ApiPropertyDetail[]>(
    API_ROUTES.admin.pendingProperties,
  );
  return Array.isArray(data) ? data : data.results;
}

export async function approveProperty(id: number): Promise<void> {
  await apiFetch(API_ROUTES.admin.approveProperty(id), { method: 'POST' });
}

export async function publishProperty(id: number): Promise<void> {
  await apiFetch(API_ROUTES.admin.publishProperty(id), { method: 'POST' });
}

export async function approveAndPublishProperty(id: number): Promise<void> {
  await approveProperty(id);
  await publishProperty(id);
}

export async function getApprovedProperties(): Promise<ApiPropertyDetail[]> {
  const data = await apiFetch<PaginatedResponse<ApiPropertyDetail> | ApiPropertyDetail[]>(
    `${API_ROUTES.admin.propertiesList}?status=APPROVED`,
  );
  return Array.isArray(data) ? data : data.results;
}

export async function rejectProperty(id: number, reason: string): Promise<void> {
  await apiFetch(API_ROUTES.admin.rejectProperty(id), {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export interface AdminUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  status: string;
  is_active: boolean;
  email_verified: boolean;
  properties_count?: number;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const data = await apiFetch<PaginatedResponse<AdminUser> | AdminUser[]>(
    API_ROUTES.admin.users,
  );
  return Array.isArray(data) ? data : data.results;
}

export async function suspendUser(id: number): Promise<void> {
  await apiFetch(API_ROUTES.admin.suspendUser(id), { method: 'POST' });
}

export async function activateUser(id: number): Promise<void> {
  await apiFetch(API_ROUTES.admin.activateUser(id), { method: 'POST' });
}
