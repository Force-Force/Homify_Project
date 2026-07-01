import { API_ROUTES } from '../api/routes';
import { ApiPropertyDetail, PaginatedResponse } from '../types/api';
import { apiFetch } from './apiClient';
import { getReports } from './reportService';
import { getAdminVerifications } from './verificationService';

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

export interface AdminDashboardStats {
  pendingProperties: number;
  approvedProperties: number;
  pendingReports: number;
  pendingKyc: number;
  totalUsers: number;
  suspendedUsers: number;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [pending, approved, reports, verifications, users] = await Promise.all([
    getPendingProperties(),
    getApprovedProperties(),
    getReports(),
    getAdminVerifications('PENDING'),
    getAdminUsers(),
  ]);

  return {
    pendingProperties: pending.length,
    approvedProperties: approved.length,
    pendingReports: reports.filter((r) => r.status === 'PENDING' || r.status === 'REVIEWED').length,
    pendingKyc: verifications.length,
    totalUsers: users.length,
    suspendedUsers: users.filter((u) => u.status === 'SUSPENDED' || !u.is_active).length,
  };
}

export interface AdminBillingOverview {
  completed_orders: number;
  total_revenue_fcfa: string;
  active_pro_subscriptions: number;
  pending_commissions: number;
  pending_commissions_amount_fcfa: string;
  recent_orders: Array<{
    id: number;
    product_name: string;
    user_email: string;
    amount_fcfa: string;
    status: string;
    completed_at: string | null;
  }>;
  recent_commissions: Array<{
    id: number;
    property_title: string;
    landlord_email: string;
    amount_fcfa: string;
    status: string;
    created_at: string;
  }>;
}

export async function getAdminBillingOverview(): Promise<AdminBillingOverview> {
  return apiFetch<AdminBillingOverview>(API_ROUTES.billing.adminOverview);
}
