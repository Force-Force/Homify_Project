import { API_BASE_URL } from '../api/routes';
import { apiFetch } from './apiClient';

export interface LandlordVerificationRequest {
  id: number;
  user: number;
  user_email?: string;
  user_name?: string;
  id_number: string;
  note: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  admin_note: string;
  created_at: string;
  reviewed_at: string | null;
}

const VERIFICATION = `${API_BASE_URL}/auth/me/landlord-verification/`;

export interface VerificationStatus {
  landlord_verified: boolean;
  request: LandlordVerificationRequest | null;
}

export async function getVerificationStatus(): Promise<VerificationStatus> {
  return apiFetch<VerificationStatus>(VERIFICATION);
}

export async function submitVerification(payload: {
  id_number?: string;
  note?: string;
}): Promise<{ message: string; request: LandlordVerificationRequest }> {
  return apiFetch(VERIFICATION, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface AdminVerificationRequest extends LandlordVerificationRequest {
  user_email: string;
  user_name: string;
}

export async function getAdminVerifications(status = 'PENDING'): Promise<AdminVerificationRequest[]> {
  const data = await apiFetch<AdminVerificationRequest[] | { results: AdminVerificationRequest[] }>(
    `${API_BASE_URL}/auth/admin/landlord-verifications/?status=${status}`,
  );
  return Array.isArray(data) ? data : data.results ?? [];
}

export async function approveVerification(id: number, adminNote = ''): Promise<void> {
  await apiFetch(`${API_BASE_URL}/auth/admin/landlord-verifications/${id}/approve/`, {
    method: 'POST',
    body: JSON.stringify({ admin_note: adminNote }),
  });
}

export async function rejectVerification(id: number, adminNote = ''): Promise<void> {
  await apiFetch(`${API_BASE_URL}/auth/admin/landlord-verifications/${id}/reject/`, {
    method: 'POST',
    body: JSON.stringify({ admin_note: adminNote }),
  });
}
