import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Loader2, Building2, Send, Home, Pencil, Trash2, Crown, Sparkles, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { getMyProperties, submitPropertyForReview, markPropertyRented, deleteProperty, STATUS_LABELS } from '@/services/propertyService';
import {
  getBillingSummary,
  getBillingProducts,
  purchaseBoost,
  pollOrderUntilDone,
  formatFcfa,
  isMockPayments,
  BillingSummary,
  BillingProduct,
} from '@/services/billingService';
import { MobileMoneyFields, MobileMoneyFormValues } from '@/components/billing/MobileMoneyFields';
import { useAuth } from '@/context/AuthContext';
import { PropertyImage } from '@/components/PropertyImage';
import { Hotel } from '@/types';
import { cn } from '@/lib/utils';

function BoostModal({
  property,
  products,
  mockPayments,
  onClose,
  onSuccess,
}: {
  property: Hotel;
  products: BillingProduct[];
  mockPayments: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(products[0]?.code ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waitingPhone, setWaitingPhone] = useState(false);
  const [mobileMoney, setMobileMoney] = useState<MobileMoneyFormValues>({
    phone_number: '',
    operator: 'MTN_Cameroon',
  });

  const handlePurchase = async () => {
    if (!selected) return;
    if (!mockPayments && !mobileMoney.phone_number.trim()) {
      setError(t('billing.phoneRequired'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await purchaseBoost(
        property.id,
        selected,
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
        setWaitingPhone(true);
        const polled = await pollOrderUntilDone(res.order.id);
        if (polled.order.status === 'COMPLETED') {
          onSuccess();
          onClose();
          return;
        }
        setError(
          polled.order.status === 'CANCELLED'
            ? t('billing.paymentTimeout')
            : t('billing.boostError'),
        );
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError(t('billing.boostError'));
    } finally {
      setLoading(false);
      setWaitingPhone(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-homify-card rounded-modal border border-homify-border shadow-xl p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-homify-text">{t('billing.boostTitle')}</h3>
            <p className="text-sm text-homify-muted mt-1 truncate">{property.name}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-homify-muted hover:text-homify-text">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-homify-muted mb-4">{t('billing.boostDescription')}</p>
        <div className="space-y-2 mb-4">
          {products.map((product) => (
            <label
              key={product.code}
              className={cn(
                'flex items-center justify-between gap-3 p-3 rounded-btn border cursor-pointer transition',
                selected === product.code
                  ? 'border-homify-accent bg-homify-accent/5'
                  : 'border-homify-border hover:border-homify-primary/30',
              )}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="boost-product"
                  value={product.code}
                  checked={selected === product.code}
                  onChange={() => setSelected(product.code)}
                  className="accent-homify-accent"
                />
                <div>
                  <p className="font-medium text-sm text-homify-text">{product.name}</p>
                  <p className="text-xs text-homify-muted">{product.description}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-homify-primary shrink-0">
                {formatFcfa(product.amount_fcfa)}
              </span>
            </label>
          ))}
        </div>
        {!mockPayments && (
          <div className="mb-4 pt-2 border-t border-homify-border">
            <MobileMoneyFields values={mobileMoney} onChange={setMobileMoney} disabled={loading} />
          </div>
        )}
        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
        )}
        <button
          type="button"
          disabled={loading || !selected}
          onClick={handlePurchase}
          className="w-full py-3 rounded-btn bg-homify-accent text-white font-semibold hover:bg-homify-accent-hover transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {waitingPhone ? t('billing.waitingConfirmation') : t('billing.boostCta')}
        </button>
        {mockPayments ? (
          <p className="text-[10px] text-homify-muted text-center mt-2">{t('billing.mockPaymentHint')}</p>
        ) : (
          <p className="text-[10px] text-homify-muted text-center mt-2">{t('billing.aangaraaHint')}</p>
        )}
      </div>
    </div>
  );
}

export default function MyPropertiesScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState<Hotel[]>([]);
  const [billing, setBilling] = useState<BillingSummary | null>(null);
  const [boostProducts, setBoostProducts] = useState<BillingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [boostProperty, setBoostProperty] = useState<Hotel | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [props, summary, products] = await Promise.all([
        getMyProperties(),
        getBillingSummary(),
        getBillingProducts(),
      ]);
      setProperties(props);
      setBilling(summary);
      setBoostProducts(products.filter((p) => p.product_type === 'BOOST'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'LANDLORD' || user?.role === 'ADMIN') load();
    else setLoading(false);
  }, [user, load]);

  const handleSubmit = async (id: number) => {
    setActionId(id);
    try {
      await submitPropertyForReview(id);
      await load();
    } catch {
      alert(t('myProperties.submitError'));
    } finally {
      setActionId(null);
    }
  };

  const handleMarkRented = async (id: number) => {
    setActionId(id);
    try {
      await markPropertyRented(id);
      await load();
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('myProperties.deleteConfirm'))) return;
    setActionId(id);
    try {
      await deleteProperty(id);
      await load();
    } finally {
      setActionId(null);
    }
  };

  const handleBoostSuccess = () => {
    setToast(t('billing.boostSuccess'));
    load();
    setTimeout(() => setToast(null), 4000);
  };

  if (user?.role !== 'LANDLORD' && user?.role !== 'ADMIN') {
    return (
      <div className="px-5 pt-8 text-center text-homify-muted">
        <p>{t('myProperties.landlordOnly')}</p>
      </div>
    );
  }

  const showQuotaWarning =
    billing &&
    !billing.is_pro &&
    billing.max_listings != null &&
    !billing.can_create_listing;

  return (
    <div className="px-5 md:px-0 pt-2 pb-28">
      <PageHeader greeting={t('myProperties.greeting')} title={t('myProperties.title')} showNotifications={false} />

      {toast && (
        <div className="mb-4 p-3 rounded-btn bg-homify-primary/10 text-homify-primary text-sm border border-homify-primary/20">
          {toast}
        </div>
      )}

      {billing && (
        <div className="bg-homify-card rounded-modal border border-homify-border p-4 mb-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl shrink-0',
                billing.is_pro ? 'bg-homify-accent/15' : 'bg-homify-surface',
              )}>
                <Crown className={cn('w-5 h-5', billing.is_pro ? 'text-homify-accent' : 'text-homify-muted')} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-homify-muted">{t('billing.summaryTitle')}</p>
                <p className="font-bold text-homify-text truncate">
                  {billing.is_pro ? t('billing.planPro') : t('billing.planFree')}
                  {!billing.is_pro && billing.max_listings != null && (
                    <span className="font-normal text-homify-muted text-sm ml-1">
                      · {billing.active_listings_count}/{billing.max_listings}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Link
              to="/landlord/billing"
              className="text-xs font-semibold text-homify-accent hover:underline shrink-0"
            >
              {t('billing.managePlan')}
            </Link>
          </div>
          {showQuotaWarning && (
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-3 pt-3 border-t border-homify-border">
              {t('billing.quotaWarning', {
                current: billing.active_listings_count,
                max: billing.max_listings,
              })}
            </p>
          )}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-homify-muted">
          {t('myProperties.managedCount', { count: user.properties_count ?? properties.length })}
        </p>
        <button
          onClick={() => navigate('/property/new')}
          disabled={billing != null && !billing.can_create_listing}
          className="flex items-center gap-2 bg-homify-accent text-white px-4 py-2.5 rounded-btn font-semibold text-sm hover:bg-homify-accent-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          {t('myProperties.newListing')}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-homify-primary animate-spin" />
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 bg-homify-card rounded-modal border border-homify-border p-8">
          <Building2 className="w-12 h-12 text-homify-muted/40 mx-auto mb-4" />
          <p className="font-medium text-homify-text mb-2">{t('myProperties.emptyTitle')}</p>
          <p className="text-sm text-homify-muted mb-6">{t('myProperties.emptyHint')}</p>
          <button
            onClick={() => navigate('/property/new')}
            className="bg-homify-primary text-white px-6 py-3 rounded-btn font-semibold"
          >
            {t('myProperties.createListing')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((p) => {
            const status = p.status ?? 'DRAFT';
            return (
              <div
                key={p.id}
                className="bg-homify-card rounded-card border border-homify-border overflow-hidden flex gap-4 p-3"
              >
                <div className="relative shrink-0">
                  <PropertyImage src={p.imageUrl} alt={p.name} className="w-24 h-24 rounded-btn object-cover" />
                  {p.isBoosted && (
                    <span className="absolute bottom-1 left-1 right-1 text-center bg-homify-accent text-white text-[9px] font-bold px-1 py-0.5 rounded">
                      {t('billing.boostBadge')}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <h3 className="font-bold text-homify-text truncate">{p.name}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-homify-surface text-homify-primary shrink-0">
                      {STATUS_LABELS[status] ?? status}
                    </span>
                  </div>
                  <p className="text-sm text-homify-muted truncate">{p.location}</p>
                  <p className="text-sm font-semibold text-homify-primary mt-1">{p.displayPrice}/mois</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => navigate(`/property/${p.id}`)}
                      className="text-xs font-medium text-homify-primary hover:underline"
                    >
                      {t('myProperties.view')}
                    </button>
                    {(status === 'DRAFT' || status === 'REJECTED') && (
                      <>
                        <button
                          onClick={() => navigate(`/property/${p.id}/edit`)}
                          className="flex items-center gap-1 text-xs font-medium text-homify-muted hover:text-homify-primary"
                        >
                          <Pencil className="w-3 h-3" />
                          {t('myProperties.edit')}
                        </button>
                        <button
                          disabled={actionId === p.id}
                          onClick={() => handleSubmit(p.id)}
                          className="flex items-center gap-1 text-xs font-medium text-homify-accent disabled:opacity-50"
                        >
                          <Send className="w-3 h-3" />
                          {t('myProperties.submit')}
                        </button>
                      </>
                    )}
                    {status === 'PUBLISHED' && (
                      <>
                        {!p.isBoosted && boostProducts.length > 0 && (
                          <button
                            disabled={actionId === p.id}
                            onClick={() => setBoostProperty(p)}
                            className="flex items-center gap-1 text-xs font-medium text-homify-accent disabled:opacity-50"
                          >
                            <Sparkles className="w-3 h-3" />
                            {t('billing.boostCta')}
                          </button>
                        )}
                        {p.isBoosted && (
                          <span className="text-xs font-medium text-homify-accent">
                            {t('billing.boostActive')}
                          </span>
                        )}
                        <button
                          disabled={actionId === p.id}
                          onClick={() => handleMarkRented(p.id)}
                          className="flex items-center gap-1 text-xs font-medium text-emerald-600 disabled:opacity-50"
                        >
                          <Home className="w-3 h-3" />
                          {t('myProperties.markRented')}
                        </button>
                      </>
                    )}
                    {status !== 'PUBLISHED' && status !== 'PENDING' && (
                      <button
                        disabled={actionId === p.id}
                        onClick={() => handleDelete(p.id)}
                        className="flex items-center gap-1 text-xs font-medium text-red-600 disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" />
                        {t('myProperties.delete')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {boostProperty && boostProducts.length > 0 && (
        <BoostModal
          property={boostProperty}
          products={boostProducts}
          mockPayments={isMockPayments(billing)}
          onClose={() => setBoostProperty(null)}
          onSuccess={handleBoostSuccess}
        />
      )}
    </div>
  );
}
