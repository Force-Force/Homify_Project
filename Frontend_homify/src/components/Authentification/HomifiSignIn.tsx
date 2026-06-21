import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API_ROUTES } from '../../api/routes';
import AuthLayout from '../layout/AuthLayout';

const inputClass =
  'w-full h-12 border border-homify-border rounded-btn px-4 text-sm text-homify-text bg-homify-surface focus:outline-none focus:ring-2 focus:ring-homify-primary/20 focus:border-homify-primary/40 transition-all placeholder:text-homify-muted/60';

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

  return (
    <AuthLayout
      title="Bon retour !"
      subtitle="Connectez-vous pour continuer votre recherche"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-btn text-red-600 text-sm">
          {error}
        </div>
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
          className={inputClass}
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
            className={`${inputClass} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-homify-muted hover:text-homify-text transition-colors"
            aria-label={showPassword ? 'Masquer' : 'Afficher'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 rounded border-homify-border text-homify-primary focus:ring-homify-primary/30"
            />
            <span className="text-homify-muted">Se souvenir de moi</span>
          </label>
          <Link to="/forgot-password" className="text-homify-primary font-medium hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-homify-primary hover:bg-homify-primary-light text-white rounded-btn font-semibold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Connexion...
            </>
          ) : (
            'Se connecter'
          )}
        </button>
      </form>

      <p className="text-center text-sm text-homify-muted mt-6">
        Pas encore de compte ?{' '}
        <Link to="/signup" className="text-homify-accent font-semibold hover:underline">
          S'inscrire
        </Link>
      </p>
    </AuthLayout>
  );
};

export default HomifiSignIn;
