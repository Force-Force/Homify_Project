import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API_ROUTES } from '../../api/routes';
import Carosel from './Carosel';
import MobileCarousel from './MobileCarossel';
import { SocialButtons, authInputClass } from './SocialButtons';

const HomifiSignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirm: '',
    role: 'TENANT',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone || !formData.password) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    if (formData.password !== formData.password_confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      await axios.post(API_ROUTES.auth.register, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm,
        phone: formData.phone,
        role: formData.role,
      });
      window.location.href = '/signin';
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Échec de l'inscription. Veuillez réessayer.");
      } else {
        setError("Échec de l'inscription. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : false;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSocialSignUp = async (provider: string) => {
    try {
      await axios.post(API_ROUTES.auth.social, { provider });
      alert(`Inscription ${provider} initiée`);
    } catch {
      setError(`Échec de l'inscription ${provider}`);
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
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-homify-text">
              Rejoignez-nous et trouvez votre maison de rêve
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-btn text-red-600 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Prénom *" autoComplete="given-name" required className={authInputClass} />
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Nom *" autoComplete="family-name" required className={authInputClass} />
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Adresse email *" autoComplete="email" required className={authInputClass} />
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Téléphone (ex: 237612345678) *" autoComplete="tel" required className={authInputClass} />

              <select name="role" value={formData.role} onChange={handleChange} required className={authInputClass}>
                <option value="TENANT">Locataire</option>
                <option value="LANDLORD">Propriétaire</option>
              </select>

              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Mot de passe *" autoComplete="new-password" required className={`${authInputClass} pr-12`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-homify-muted hover:text-homify-text">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative">
                <input type={showConfirmPassword ? 'text' : 'password'} name="password_confirm" value={formData.password_confirm} onChange={handleChange} placeholder="Confirmer le mot de passe *" autoComplete="new-password" required className={`${authInputClass} pr-12`} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-homify-muted hover:text-homify-text">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} className="w-4 h-4 text-homify-primary border-homify-border rounded focus:ring-homify-primary/30 cursor-pointer" />
                  <span className="text-homify-muted group-hover:text-homify-primary transition-colors">Se souvenir de moi</span>
                </label>
                <Link to="/forgot-password" className="text-homify-primary font-medium hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>

              <button type="submit" disabled={loading} className="w-full h-14 bg-homify-primary hover:bg-homify-primary-light text-white rounded-btn font-semibold text-base transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-95 flex items-center justify-center gap-2">
                {loading ? (<><Loader2 className="w-5 h-5 animate-spin" />Inscription en cours...</>) : "S'inscrire"}
              </button>
            </form>

            <SocialButtons onSocial={handleSocialSignUp} mode="signup" />

            <p className="text-center text-sm text-homify-muted">
              Vous avez déjà un compte ?{' '}
              <Link to="/signin" className="text-homify-primary font-semibold hover:underline">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomifiSignUp;
