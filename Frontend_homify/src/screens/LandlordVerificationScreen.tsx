import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { getVerificationStatus, submitVerification } from '@/services/verificationService';
import { inputClass, textareaClass } from '@/lib/formStyles';

export default function LandlordVerificationScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verified, setVerified] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [idNumber, setIdNumber] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'LANDLORD' && user?.role !== 'ADMIN') {
      setLoading(false);
      return;
    }
    getVerificationStatus()
      .then((res) => {
        setVerified(res.landlord_verified);
        setStatus(res.request?.status ?? null);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      await submitVerification({ id_number: idNumber, note });
      setStatus('PENDING');
      setMessage(t('verification.submitSuccess'));
    } catch {
      setError(t('verification.submitError'));
    } finally {
      setSubmitting(false);
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
    <div className="px-5 md:px-0 pt-2 pb-28 max-w-lg mx-auto">
      <Link
        to="/my-properties"
        className="inline-flex items-center gap-2 text-sm text-homify-muted hover:text-homify-primary mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('billing.backToListings')}
      </Link>

      <PageHeader greeting={t('verification.greeting')} title={t('verification.title')} showNotifications={false} />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-homify-primary animate-spin" />
        </div>
      ) : verified ? (
        <div className="text-center py-12 bg-homify-card rounded-modal border border-homify-border p-6">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <p className="font-semibold text-homify-text">{t('verification.verified')}</p>
        </div>
      ) : status === 'PENDING' ? (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-modal p-5">
          <p className="font-semibold text-homify-text mb-1">{t('verification.pendingTitle')}</p>
          <p className="text-sm text-homify-muted">{t('verification.pendingHint')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-homify-muted">{t('verification.description')}</p>
          <div>
            <label className="block text-xs font-medium text-homify-muted mb-1.5">{t('verification.idLabel')}</label>
            <input
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              className={inputClass}
              placeholder="CNI / Passeport"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-homify-muted mb-1.5">{t('verification.noteLabel')}</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={textareaClass}
              rows={3}
              placeholder={t('verification.notePlaceholder')}
            />
          </div>
          {message && <p className="text-sm text-homify-primary">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-btn bg-homify-primary text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {t('verification.submitCta')}
          </button>
        </form>
      )}
    </div>
  );
}
