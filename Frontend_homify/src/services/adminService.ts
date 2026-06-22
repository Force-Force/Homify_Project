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

export async function rejectProperty(id: number, reason: string): Promise<void> {
  await apiFetch(API_ROUTES.admin.rejectProperty(id), {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}
