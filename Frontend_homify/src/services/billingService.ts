import { API_BASE_URL } from '../api/routes';
import { apiFetch } from './apiClient';

export type PaymentOperator = 'MTN_Cameroon' | 'Orange_Cameroon';
export type PaymentMode = 'no_redirect' | 'redirect';

export interface BillingProduct {
  code: string;
  name: string;
  description: string;
  product_type: 'BOOST' | 'SUBSCRIPTION';
  amount_fcfa: string;
  duration_days: number;
}

export interface BillingSummary {
  plan_code: 'FREE' | 'PRO';
  is_pro: boolean;
  subscription_expires_at: string | null;
  active_listings_count: number;
  max_listings: number | null;
  can_create_listing: boolean;
  boosted_listings_count: number;
  mock_payments?: boolean;
  payment_provider?: 'MOCK' | 'AANGARAAPAY';
}

export interface PaymentOrder {
  id: number;
  product_code: string;
  product_name: string;
  property: number | null;
  amount_fcfa: string;
  status: string;
  provider: string;
  transaction_id?: string;
  operator?: string;
  provider_reference: string;
  created_at: string;
  completed_at: string | null;
}

export interface PaymentInitPayload {
  phone_number?: string;
  operator?: PaymentOperator;
  payment_mode?: PaymentMode;
}

export interface PaymentInitInfo {
  mode: PaymentMode;
  status: string;
  payment_url?: string | null;
  message?: string;
}

export interface OrderResponse {
  message: string;
  order: PaymentOrder;
  payment?: PaymentInitInfo;
  billing?: BillingSummary;
}

const BILLING = {
  products: `${API_BASE_URL}/billing/products/`,
  me: `${API_BASE_URL}/billing/me/`,
  boost: `${API_BASE_URL}/billing/boost/`,
  subscribe: `${API_BASE_URL}/billing/subscribe/`,
  order: (id: number) => `${API_BASE_URL}/billing/orders/${id}/`,
} as const;

export async function getBillingProducts(): Promise<BillingProduct[]> {
  return apiFetch<BillingProduct[]>(BILLING.products);
}

export async function getBillingSummary(): Promise<BillingSummary> {
  return apiFetch<BillingSummary>(BILLING.me);
}

export async function getOrder(orderId: number): Promise<{ order: PaymentOrder; billing: BillingSummary }> {
  return apiFetch(BILLING.order(orderId));
}

export async function purchaseBoost(
  propertyId: number,
  productCode: string,
  payment?: PaymentInitPayload,
): Promise<OrderResponse> {
  return apiFetch<OrderResponse>(BILLING.boost, {
    method: 'POST',
    body: JSON.stringify({
      property_id: propertyId,
      product_code: productCode,
      payment_mode: payment?.payment_mode ?? 'no_redirect',
      phone_number: payment?.phone_number ?? '',
      operator: payment?.operator ?? '',
    }),
  });
}

export async function subscribeToPlan(
  productCode: string,
  payment?: PaymentInitPayload,
): Promise<OrderResponse> {
  return apiFetch<OrderResponse>(BILLING.subscribe, {
    method: 'POST',
    body: JSON.stringify({
      product_code: productCode,
      payment_mode: payment?.payment_mode ?? 'no_redirect',
      phone_number: payment?.phone_number ?? '',
      operator: payment?.operator ?? '',
    }),
  });
}

export async function pollOrderUntilDone(
  orderId: number,
  { intervalMs = 3000, maxAttempts = 40 } = {},
): Promise<{ order: PaymentOrder; billing: BillingSummary }> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const res = await getOrder(orderId);
    if (res.order.status === 'COMPLETED' || res.order.status === 'FAILED' || res.order.status === 'CANCELLED') {
      return res;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return getOrder(orderId);
}

export function formatFcfa(amount: string | number): string {
  const n = typeof amount === 'string' ? parseInt(amount, 10) : amount;
  return `${n.toLocaleString('fr-FR')} FCFA`;
}

export function isMockPayments(summary: BillingSummary | null | undefined): boolean {
  return summary?.mock_payments !== false;
}
