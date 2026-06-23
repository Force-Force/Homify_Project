import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, Loader2 } from 'lucide-react';
import { resendVerification } from '@/services/authService';
import { ApiError } from '@/services/apiClient';

export default function VerifyPendingScreen() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await resendVerification(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Envoi impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-homify-surface p-6">
      <div className="max-w-md w-full bg-homify-card rounded-modal p-8 border border-homify-border text-center shadow-card">
        <Mail className="w-12 h-12 text-homify-accent mx-auto mb-4" />
        <h1 className="text-xl font-bold text-homify-text mb-2">Vérifiez votre email</h1>
        <p className="text-sm text-homify-muted mb-6">
          Un lien de confirmation a été envoyé à{' '}
          <span className="font-medium text-homify-text">{email || 'votre adresse'}</span>.
          Cliquez dessus pour activer votre compte.
        </p>
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        {sent && <p className="text-sm text-emerald-600 mb-4">Email renvoyé avec succès.</p>}
        <button
          onClick={handleResend}
          disabled={loading || !email}
          className="w-full bg-homify-primary text-white py-3 rounded-btn font-semibold disabled:opacity-50 flex items-center justify-center gap-2 mb-4"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Renvoyer l'email
        </button>
        <Link to="/signin" className="text-sm text-homify-primary font-medium hover:underline">
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
