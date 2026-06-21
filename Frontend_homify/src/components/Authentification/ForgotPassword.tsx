import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API_ROUTES } from '../../api/routes';
import Carosel from './Carosel';
import MobileCarousel from './MobileCarossel';
import { authInputClass } from './SocialButtons';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Veuillez entrer votre email');
      return;
    }

    try {
      setLoading(true);
      await axios.post(API_ROUTES.auth.forgotPassword, { email });
      setSuccess('Lien de réinitialisation envoyé ! Vérifiez votre boîte mail.');
    } catch {
      setError("Échec de l'envoi du lien. Veuillez réessayer.");
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

          <Link
            to="/signin"
            className="hidden lg:flex items-center gap-2 text-homify-muted mb-6 hover:text-homify-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Retour à la connexion</span>
          </Link>

          <div className="bg-homify-card/90 backdrop-blur-sm rounded-modal shadow-card p-6 sm:p-8 border border-homify-border">
            <h2 className="text-2xl font-bold text-center mb-2 text-homify-text">Mot de passe oublié ?</h2>
            <p className="text-center text-homify-muted mb-6 text-sm">
              Entrez votre adresse email et nous vous enverrons un lien de réinitialisation.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-btn text-red-600 text-sm">{error}</div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-btn text-emerald-700 text-sm">{success}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Adresse email"
                autoComplete="email"
                required
                className={authInputClass}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-homify-primary hover:bg-homify-primary-light text-white rounded-btn font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer le lien'
                )}
              </button>
            </form>

            <p className="text-center text-sm text-homify-muted mt-6">
              <Link to="/signin" className="text-homify-primary font-semibold hover:underline">
                Retour à la connexion
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
