import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { verifyEmail } from '@/services/authService';
import { ApiError } from '@/services/apiClient';

export default function VerifyEmailScreen() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Lien invalide.');
      return;
    }
    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setMessage(err instanceof ApiError ? err.message : 'Vérification impossible.');
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-homify-surface p-6">
      <div className="max-w-md w-full bg-homify-card rounded-modal p-8 border border-homify-border text-center shadow-card">
        {status === 'loading' && (
          <>
            <Loader2 className="w-10 h-10 text-homify-primary animate-spin mx-auto mb-4" />
            <p className="text-homify-muted">Vérification en cours...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-homify-text mb-2">Email confirmé !</h1>
            <p className="text-sm text-homify-muted mb-6">Votre compte est activé. Vous pouvez vous connecter.</p>
            <Link to="/signin" className="inline-block bg-homify-primary text-white px-6 py-3 rounded-btn font-semibold">
              Se connecter
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-homify-text mb-2">Échec de la vérification</h1>
            <p className="text-sm text-homify-muted mb-6">{message}</p>
            <Link to="/signin" className="text-homify-primary font-medium hover:underline">
              Retour à la connexion
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
