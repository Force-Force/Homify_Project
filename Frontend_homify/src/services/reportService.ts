import { API_ROUTES } from '../api/routes';
import { apiFetch } from './apiClient';

export type ReportReason = 'FRAUD' | 'INAPPROPRIATE' | 'DUPLICATE' | 'OTHER';

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
