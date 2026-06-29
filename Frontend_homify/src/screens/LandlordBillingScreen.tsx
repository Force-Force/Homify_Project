import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Crown, Loader2, Sparkles, Check, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/context/AuthContext';
import {
  getBillingProducts,
  getBillingSummary,
  subscribeToPlan,
  pollOrderUntilDone,
  formatFcfa,
  isMockPayments,
  BillingProduct,
  BillingSummary,
} from '@/services/billingService';
import { MobileMoneyFields, MobileMoneyFormValues } from '@/components/billing/MobileMoneyFields';
import { cn } from '@/lib/utils';

export default function LandlordBillingScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [products, setProducts] = useState<BillingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionCode, setActionCode] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mobileMoney, setMobileMoney] = useState<MobileMoneyFormValues>({
    phone_number: '',
    operator: 'MTN_Cameroon',
  });

  const mockPayments = isMockPayments(summary);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([getBillingSummary(), getBillingProducts()]);
      setSummary(s);
      setProducts(p.filter((x) => x.product_type === 'SUBSCRIPTION'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'LANDLORD' || user?.role === 'ADMIN') load();
    else setLoading(false);
  }, [user, load]);

  const handleSubscribe = async (code: string) => {
    if (!mockPayments && !mobileMoney.phone_number.trim()) {
      setError(t('billing.phoneRequired'));
      return;
    }

    setActionCode(code);
    setMessage(null);
    setError(null);
    try {
      const res = await subscribeToPlan(
        code,
        mockPayments
          ? undefined
          : {
              phone_number: mobileMoney.phone_number,
              operator: mobileMoney.operator,
              payment_mode: 'no_redirect',
            },
      );

      if (res.payment?.payment_url) {
        window.location.href = res.payment.payment_url;
        return;
      }

      if (res.order.status === 'PENDING') {
        setMessage(t('billing.waitingConfirmation'));
        const polled = await pollOrderUntilDone(res.order.id);
        if (polled.order.status === 'COMPLETED') {
          setSummary(polled.billing);
          setMessage(t('billing.subscribeSuccess'));
          return;
        }
        setError(
          polled.order.status === 'CANCELLED'
            ? t('billing.paymentTimeout')
            : t('billing.subscribeError'),
        );
        return;
      }

      if (res.billing) setSummary(res.billing);
      setMessage(t('billing.subscribeSuccess'));
    } catch {
      setError(t('billing.subscribeError'));
    } finally {
      setActionCode(null);
    }
  };

  if (user?.role !== 'LANDLORD' && user?.role !== 'ADMIN') {
    return (
      <div className="px-5 pt-8 text-center text-homify-muted">
        <p>{t('billing.landlordOnly')}</p>
      </div>
    );
  }

  return (
    <div className="px-5 md:px-0 pt-2 pb-28 max-w-2xl mx-auto">
      <Link
        to="/my-properties"
        className="inline-flex items-center gap-2 text-sm text-homify-muted hover:text-homify-primary mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('billing.backToListings')}
      </Link>

      <PageHeader greeting={t('billing.greeting')} title={t('billing.title')} showNotifications={false} />

      {message && (
        <div className="mb-4 p-3 rounded-btn bg-homify-primary/10 text-homify-primary text-sm border border-homify-primary/20">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-btn bg-red-500/10 text-red-600 text-sm border border-red-500/20">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-homify-primary animate-spin" />
        </div>
      ) : summary && (
        <>
          <div className="bg-homify-card rounded-modal border border-homify-border p-5 mb-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl',
                summary.is_pro ? 'bg-homify-accent/15' : 'bg-homify-surface',
              )}>
                <Crown className={cn('w-6 h-6', summary.is_pro ? 'text-homify-accent' : 'text-homify-muted')} />
              </div>
              <div>
                <p className="text-sm text-homify-muted">{t('billing.currentPlan')}</p>
                <p className="text-lg font-bold text-homify-text">
                  {summary.is_pro ? t('billing.planPro') : t('billing.planFree')}
                </p>
                {summary.subscription_expires_at && (
                  <p className="text-xs text-homify-muted mt-0.5">
                    {t('billing.expiresOn', {
                      date: new Date(summary.subscription_expires_at).toLocaleDateString('fr-FR'),
                    })}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-homify-border text-center">
              <div>
                <p className="text-lg font-bold text-homify-primary">{summary.active_listings_count}</p>
                <p className="text-[11px] text-homify-muted">{t('billing.activeListings')}</p>
              </div>
              <div>
                <p className="text-lg font-bold text-homify-primary">
                  {summary.max_listings ?? '∞'}
                </p>
                <p className="text-[11px] text-homify-muted">{t('billing.listingLimit')}</p>
              </div>
            </div>
          </div>

          {!mockPayments && !summary.is_pro && (
            <div className="bg-homify-card rounded-modal border border-homify-border p-5 mb-6">
              <h3 className="font-semibold text-homify-text mb-3">{t('billing.paymentMethod')}</h3>
              <MobileMoneyFields
                values={mobileMoney}
                onChange={setMobileMoney}
                disabled={Boolean(actionCode)}
              />
            </div>
          )}

          <div className="space-y-4">
            <h2 className="font-bold text-homify-text flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-homify-accent" />
              {t('billing.upgradeTitle')}
            </h2>

            <div className="bg-homify-card rounded-modal border border-homify-border p-5">
              <h3 className="font-semibold text-homify-text mb-2">{t('billing.planFree')}</h3>
              <ul className="text-sm text-homify-muted space-y-1.5 mb-0">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-homify-primary shrink-0" />{t('billing.freeFeature1', { count: summary.max_listings ?? 2 })}</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-homify-primary shrink-0" />{t('billing.freeFeature2')}</li>
              </ul>
            </div>

            {products.map((product) => (
              <div
                key={product.code}
                className={cn(
                  'rounded-modal border-2 p-5 transition',
                  summary.is_pro ? 'border-homify-border bg-homify-card' : 'border-homify-accent/40 bg-homify-accent/5',
                )}
              >
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-homify-text">{product.name}</h3>
                    <p className="text-sm text-homify-muted mt-1">{product.description}</p>
                  </div>
                  <p className="text-lg font-extrabold text-homify-primary shrink-0">
                    {formatFcfa(product.amount_fcfa)}
                  </p>
                </div>
                <ul className="text-sm text-homify-muted space-y-1.5 mb-4">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-homify-accent shrink-0" />{t('billing.proFeature1')}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-homify-accent shrink-0" />{t('billing.proFeature2')}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-homify-accent shrink-0" />{t('billing.proFeature3')}</li>
                </ul>
                <button
                  type="button"
                  disabled={summary.is_pro || actionCode === product.code}
                  onClick={() => handleSubscribe(product.code)}
                  className="w-full py-3 rounded-btn bg-homify-accent text-white font-semibold hover:bg-homify-accent-hover transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionCode === product.code && <Loader2 className="w-4 h-4 animate-spin" />}
                  {summary.is_pro ? t('billing.alreadyPro') : t('billing.subscribeCta')}
                </button>
                {mockPayments ? (
                  <p className="text-[10px] text-homify-muted text-center mt-2">{t('billing.mockPaymentHint')}</p>
                ) : (
                  <p className="text-[10px] text-homify-muted text-center mt-2">{t('billing.aangaraaHint')}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
