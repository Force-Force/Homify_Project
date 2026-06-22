import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API_ROUTES } from '../../api/routes';
import Carosel from './Carosel';
import MobileCarousel from './MobileCarossel';
import { SocialButtons, authInputClass } from './SocialButtons';

const HomifiSignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(API_ROUTES.auth.login, {
        email: formData.email,
        password: formData.password,
      });

      const { access, refresh } = response.data || {};
      if (access && refresh) {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        window.location.href = '/';
      } else {
        setError('Réponse invalide du serveur.');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Identifiants incorrects. Veuillez réessayer.');
      } else {
        setError('Erreur de connexion. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSocialSignIn = async (provider: string) => {
    try {
      await axios.post(API_ROUTES.auth.social, { provider });
      alert(`Connexion ${provider} initiée`);
    } catch {
      setError(`Échec de la connexion ${provider}`);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      alert('Veuillez entrer votre email d\'abord');
      return;
    }
    try {
      await axios.post(API_ROUTES.auth.forgotPassword, { email: formData.email });
      alert('Lien de réinitialisation envoyé !');
    } catch {
      setError('Échec de l\'envoi du lien');
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
            to="/"
            className="hidden lg:flex items-center gap-2 text-homify-muted mb-6 hover:text-homify-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Retour à l'accueil</span>
          </Link>

          <div className="bg-homify-card/90 backdrop-blur-sm rounded-modal shadow-card p-6 sm:p-8 border border-homify-border">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-homify-text">
              Bon retour !
            </h2>
            <p className="text-center text-homify-muted mb-6">
              Connectez-vous pour continuer votre recherche
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-btn text-red-600 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Adresse email"
                autoComplete="email"
                required
                className={authInputClass}
              />

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mot de passe"
                  autoComplete="current-password"
                  required
                  className={`${authInputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-homify-muted hover:text-homify-text"
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 text-homify-primary border-homify-border rounded focus:ring-homify-primary/30 cursor-pointer"
                  />
                  <span className="text-homify-muted group-hover:text-homify-primary transition-colors">Se souvenir de moi</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-homify-primary font-medium hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-homify-primary hover:bg-homify-primary-light text-white rounded-btn font-semibold text-base transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            <SocialButtons onSocial={handleSocialSignIn} mode="signin" />

            <p className="text-center text-sm text-homify-muted">
              Pas encore de compte ?{' '}
              <Link to="/signup" className="text-homify-primary font-semibold hover:underline">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomifiSignIn;
