import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import { resetPassword } from '../../services/authService';
import { ApiError } from '../../services/apiClient';
import Carosel from './Carosel';
import MobileCarousel from './MobileCarossel';
import { authInputClass } from './SocialButtons';

const ResetPass = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Lien invalide ou expiré. Demandez un nouveau lien.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password, passwordConfirm);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Réinitialisation impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-homify-surface">
      <Carosel />

      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-2">
            <MobileCarousel />
          </div>

          <div className="bg-homify-card rounded-modal shadow-card p-8 border border-homify-border">
            <div className="w-14 h-14 bg-homify-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-7 h-7 text-homify-primary" />
            </div>

            {success ? (
              <div className="text-center">
                <h2 className="text-xl font-bold text-homify-text mb-2">Mot de passe mis à jour</h2>
                <p className="text-homify-muted text-sm mb-6">
                  Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                </p>
                <Link
                  to="/signin"
                  className="inline-flex items-center gap-2 text-homify-primary font-semibold hover:underline"
                >
                  Se connecter
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-homify-text mb-2 text-center">
                  Nouveau mot de passe
                </h2>
                <p className="text-homify-muted text-sm mb-6 text-center">
                  Choisissez un mot de passe sécurisé pour votre compte.
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-btn text-sm border border-red-100">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-homify-text mb-1.5">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        className={authInputClass}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-homify-muted"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-homify-text mb-1.5">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      required
                      className={authInputClass}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-homify-primary text-white font-bold py-3 rounded-btn hover:bg-homify-primary-light transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Réinitialiser
                  </button>
                </form>

                <Link
                  to="/signin"
                  className="mt-6 inline-flex items-center gap-2 text-homify-primary font-semibold hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la connexion
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPass;
