import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { getOrder, pollOrderUntilDone } from '@/services/billingService';

export default function BillingReturnScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = Number(params.get('order_id'));
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');

  useEffect(() => {
    if (!orderId || Number.isNaN(orderId)) {
      setStatus('failed');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await pollOrderUntilDone(orderId, { maxAttempts: 20 });
        if (cancelled) return;
        if (res.order.status === 'COMPLETED') setStatus('success');
        else if (res.order.status === 'FAILED' || res.order.status === 'CANCELLED') setStatus('failed');
        else setStatus('pending');
      } catch {
        if (!cancelled) setStatus('failed');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return (
    <div className="px-5 md:px-0 pt-2 pb-28 max-w-lg mx-auto text-center">
      <PageHeader greeting={t('billing.greeting')} title={t('billing.returnTitle')} showNotifications={false} />

      {status === 'loading' && (
        <div className="py-16">
          <Loader2 className="w-10 h-10 text-homify-primary animate-spin mx-auto mb-4" />
          <p className="text-homify-muted">{t('billing.returnChecking')}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="py-16">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <p className="font-semibold text-homify-text mb-2">{t('billing.returnSuccess')}</p>
          <button
            type="button"
            onClick={() => navigate('/my-properties')}
            className="mt-4 px-6 py-3 rounded-btn bg-homify-primary text-white font-semibold"
          >
            {t('billing.backToListings')}
          </button>
        </div>
      )}

      {status === 'failed' && (
        <div className="py-16">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="font-semibold text-homify-text mb-2">{t('billing.returnFailed')}</p>
          <button
            type="button"
            onClick={() => navigate('/landlord/billing')}
            className="mt-4 px-6 py-3 rounded-btn bg-homify-accent text-white font-semibold"
          >
            {t('billing.managePlan')}
          </button>
        </div>
      )}

      {status === 'pending' && (
        <div className="py-16">
          <Loader2 className="w-10 h-10 text-homify-accent animate-spin mx-auto mb-4" />
          <p className="text-homify-muted mb-4">{t('billing.returnPending')}</p>
          <button
            type="button"
            onClick={() => orderId && getOrder(orderId).then(() => setStatus('loading'))}
            className="text-sm text-homify-primary font-medium hover:underline"
          >
            {t('billing.returnRetry')}
          </button>
        </div>
      )}
    </div>
  );
}
