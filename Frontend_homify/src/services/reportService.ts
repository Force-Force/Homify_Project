import { API_ROUTES } from '../api/routes';
import { ApiReport, PaginatedResponse } from '../types/api';
import { apiFetch } from './apiClient';

export type ReportReason = 'FRAUD' | 'INAPPROPRIATE' | 'DUPLICATE' | 'OTHER';

export type ResolveAction = 'reject_property' | 'unpublish_property' | 'suspend_user';

export async function createReport(payload: {
  property?: number;
  reported_user?: number;
  reason: ReportReason;
  description: string;
}): Promise<void> {
  await apiFetch(API_ROUTES.reports.create, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getReports(): Promise<ApiReport[]> {
  const data = await apiFetch<PaginatedResponse<ApiReport> | ApiReport[]>(API_ROUTES.reports.list);
  return Array.isArray(data) ? data : data.results;
}

export async function reviewReport(id: number): Promise<void> {
  await apiFetch(API_ROUTES.reports.review(id), { method: 'POST' });
}

export async function resolveReport(
  id: number,
  action?: ResolveAction,
  reason = '',
): Promise<void> {
  await apiFetch(API_ROUTES.reports.resolve(id), {
    method: 'POST',
    body: JSON.stringify({ action: action ?? null, reason }),
  });
}

export async function dismissReport(id: number): Promise<void> {
  await apiFetch(API_ROUTES.reports.dismiss(id), { method: 'POST' });
}
