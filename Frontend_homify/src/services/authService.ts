import { API_ROUTES } from '../api/routes';
import { apiFetch, setTokens, clearTokens, getRefreshToken } from './apiClient';

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  role: 'TENANT' | 'LANDLORD' | 'ADMIN' | 'VISITOR';
  pending_role?: string | null;
  status: string;
  email_verified: boolean;
  created_at: string;
  last_login_at?: string | null;
  properties_count?: number;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user?: UserProfile;
}

export async function login(email: string, password: string): Promise<UserProfile | null> {
  const data = await apiFetch<LoginResponse>(
    API_ROUTES.auth.login,
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    },
    false,
  );

  if (data.access && data.refresh) {
    setTokens(data.access, data.refresh);
    return data.user ?? null;
  }
  return null;
}

export async function logout(): Promise<void> {
  const refresh = getRefreshToken();
  try {
    if (refresh) {
      await apiFetch(API_ROUTES.auth.logout, {
        method: 'POST',
        body: JSON.stringify({ refresh }),
      });
    }
  } finally {
    clearTokens();
  }
}

export async function getMe(): Promise<UserProfile> {
  return apiFetch<UserProfile>(API_ROUTES.auth.me);
}

export async function updateMe(
  payload: Partial<Pick<UserProfile, 'first_name' | 'last_name' | 'phone'>>,
): Promise<UserProfile> {
  return apiFetch<UserProfile>(API_ROUTES.auth.me, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiFetch(
    API_ROUTES.auth.forgotPassword,
    { method: 'POST', body: JSON.stringify({ email }) },
    false,
  );
}

export async function resetPassword(
  token: string,
  password: string,
  passwordConfirm: string,
): Promise<void> {
  await apiFetch(
    API_ROUTES.auth.resetPassword,
    {
      method: 'POST',
      body: JSON.stringify({ token, password, password_confirm: passwordConfirm }),
    },
    false,
  );
}
