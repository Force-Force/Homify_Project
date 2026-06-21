import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API_ROUTES } from '../../api/routes';
import AuthLayout from '../layout/AuthLayout';

const inputClass =
  'w-full h-12 border border-homify-border rounded-btn px-4 text-sm text-homify-text bg-homify-surface focus:outline-none focus:ring-2 focus:ring-homify-primary/20 focus:border-homify-primary/40 transition-all placeholder:text-homify-muted/60';

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

  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Rejoignez Homify et trouvez votre logement idéal"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-btn text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="Prénom *"
            autoComplete="given-name"
            required
            className={inputClass}
          />
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Nom *"
            autoComplete="family-name"
            required
            className={inputClass}
          />
        </div>

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Adresse email *"
          autoComplete="email"
          required
          className={inputClass}
        />

        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Téléphone (ex: 237612345678) *"
          autoComplete="tel"
          required
          className={inputClass}
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          className={inputClass}
        >
          <option value="TENANT">Locataire</option>
          <option value="LANDLORD">Propriétaire</option>
        </select>

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Mot de passe *"
            autoComplete="new-password"
            required
            className={`${inputClass} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-homify-muted hover:text-homify-text"
            aria-label="Afficher le mot de passe"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="password_confirm"
            value={formData.password_confirm}
            onChange={handleChange}
            placeholder="Confirmer le mot de passe *"
            autoComplete="new-password"
            required
            className={`${inputClass} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-homify-muted hover:text-homify-text"
            aria-label="Afficher la confirmation"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-homify-accent hover:bg-homify-accent-hover text-white rounded-btn font-semibold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Inscription...
            </>
          ) : (
            "S'inscrire"
          )}
        </button>
      </form>

      <p className="text-center text-sm text-homify-muted mt-6">
        Déjà un compte ?{' '}
        <Link to="/signin" className="text-homify-primary font-semibold hover:underline">
          Se connecter
        </Link>
      </p>
    </AuthLayout>
  );
};

export default HomifiSignUp;
