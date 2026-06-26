import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Eye, EyeOff, Loader2, Mail } from 'lucide-react';
import { login } from '../../services/authService';
import { ApiError } from '../../services/apiClient';
import Carosel from './Carosel';
import MobileCarousel from './MobileCarossel';
import { SocialButtons, authInputClass } from './SocialButtons';

const HomifiSignIn = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailNotVerified, setEmailNotVerified] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setEmailNotVerified(false);
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      window.location.href = '/home';
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'email_not_verified') {
          setEmailNotVerified(true);
          setError(t('auth.emailNotVerified'));
        } else {
          setError(err.message || t('auth.wrongCredentials'));
        }
      } else {
        setError(t('auth.loginError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSocialSignIn = () => {
    setError(t('auth.socialSoon'));
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
            className="inline-flex items-center gap-2 text-homify-muted hover:text-homify-primary mb-6 text-sm font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('auth.back')}
          </Link>

          <div className="bg-homify-card rounded-modal shadow-card p-8 border border-homify-border">
            <h2 className="text-2xl font-bold text-homify-text mb-1">{t('auth.welcomeBack')}</h2>
            <p className="text-homify-muted text-sm mb-6">{t('auth.signInSubtitle')}</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-btn text-sm border border-red-100">
                {error}
                {emailNotVerified && formData.email && (
                  <Link
                    to={`/verify-pending?email=${encodeURIComponent(formData.email)}`}
                    className="mt-2 flex items-center gap-1.5 text-homify-primary font-medium hover:underline"
                  >
                    <Mail className="w-4 h-4" />
                    {t('auth.resendVerification')}
                  </Link>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-homify-text mb-1.5">{t('auth.email')}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={authInputClass}
                  placeholder="vous@exemple.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-homify-text mb-1.5">{t('auth.password')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={authInputClass}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-homify-muted hover:text-homify-primary"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-homify-muted cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="rounded border-homify-border text-homify-primary focus:ring-homify-primary/20"
                  />
                  {t('auth.rememberMe')}
                </label>
                <Link to="/forgot-password" className="text-homify-primary font-medium hover:underline">
                  {t('auth.forgotPassword')}
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-homify-primary text-white font-bold py-3 rounded-btn hover:bg-homify-primary-light transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? t('auth.signingIn') : t('auth.signIn')}
              </button>
            </form>

            <SocialButtons onSocial={handleSocialSignIn} />

            <p className="text-center text-sm text-homify-muted mt-6">
              {t('auth.noAccount')}{' '}
              <Link to="/signup" className="text-homify-primary font-semibold hover:underline">
                {t('auth.signUp')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomifiSignIn;
