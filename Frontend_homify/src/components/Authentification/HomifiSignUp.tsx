import React, { useState } from 'react';
import { Home, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Carosel from './Carosel';
import MobileCarousel from './MobileCarossel';
import { API_ROUTES } from '../../api/routes';
import axios from 'axios';

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
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone || !formData.password || !formData.role) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(API_ROUTES.auth.register, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm,
        phone: formData.phone,
        role: formData.role
      });
      
      console.log('Register endpoint:', API_ROUTES.auth.register);
      console.log('Response:', response);
      
      console.log('Form submitted:', formData);
      alert('Inscription réussie!');
      
      // Handle success - redirect or show success message
      // if (response.data.success) {
      //   window.location.href = '/dashboard';
      // }
      
    } catch (err) {
      setError(err?.response?.data?.message || 'Échec de l\'inscription. Veuillez réessayer.');
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSocialSignUp = async (provider) => {
    try {
      // Axios integration for social sign up
      const response = await axios.post(API_ROUTES.auth.social, {
        provider: provider
      });
      console.log('Social sign up response:', response);
      alert(`${provider} sign up initiated`);
    } catch (err) {
      setError(`${provider} sign up failed`);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      alert('Veuillez entrer votre email d\'abord');
      return;
    }
    try {
      // Axios integration for password reset
       const response = await axios.post(API_ROUTES.auth.forgotPassword, {
         email: formData.email
       });
       console.log('Forgot password response:', response);
      alert('Lien de réinitialisation envoyé!');
    } catch (err) {
      setError('Échec de l\'envoi du lien');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-2">
      {/* Left Side - Hero Section (Desktop Only) */}
      <Carosel/>

      {/* Right Side - Form Section */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden mb-8 text-center">
          <MobileCarousel/>
          </div>

          {/* Desktop Back Button */}
          <button 
            onClick={() => window.history.back()} 
            className="hidden lg:flex items-center gap-2 text-gray-700 mb-6 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">retour au site</span>
          </button>

          {/* Form Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-purple-100">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-900">
              Rejoignez-nous et trouvez votre maison de rêve
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name Input */}
              <div>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Prénom *"
                  autoComplete="given-name"
                  required
                  className="w-full h-14 border border-gray-300 rounded-xl px-4 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Last Name Input */}
              <div>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Nom *"
                  autoComplete="family-name"
                  required
                  className="w-full h-14 border border-gray-300 rounded-xl px-4 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Email Input */}
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Adresse email *"
                  autoComplete="email"
                  required
                  className="w-full h-14 border border-gray-300 rounded-xl px-4 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Phone Input */}
              <div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Téléphone (ex: 237612345678) *"
                  autoComplete="tel"
                  required
                  className="w-full h-14 border border-gray-300 rounded-xl px-4 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Role Selection */}
              <div>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full h-14 border border-gray-300 rounded-xl px-4 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent transition-all"
                >
                  <option value="TENANT">🏠 Locataire</option>
                  <option value="LANDLORD">🏢 Propriétaire</option>
                </select>
              </div>

              {/* Password Input */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mot de passe *"
                  autoComplete="new-password"
                  required
                  className="w-full h-14 border border-gray-300 rounded-xl px-4 pr-12 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Confirm Password Input */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  placeholder="Confirmer le mot de passe *"
                  autoComplete="new-password"
                  required
                  className="w-full h-14 border border-gray-300 rounded-xl px-4 pr-12 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-700 border-gray-300 rounded focus:ring-2 focus:ring-purple-700 cursor-pointer"
                  />
                  <span className="text-gray-700 group-hover:text-purple-700 transition-colors">Se souvenir de moi</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-gray-700 hover:text-purple-700 transition-colors font-medium"
                >
                  Mot de passe oublié?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-[#011753] hover:bg-purple-800 text-white rounded-xl font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-95"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Inscription en cours...
                  </span>
                ) : "S'inscrire"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-grow h-px bg-gray-300" />
              <span className="mx-3 text-sm text-gray-500">ou s'inscrire avec</span>
              <div className="flex-grow h-px bg-gray-300" />
            </div>

            {/* Social Sign Up */}
            <div className="flex justify-center gap-4 mb-6">
              <button 
                type="button"
                onClick={() => handleSocialSignUp('Facebook')} 
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95"
                aria-label="S'inscrire avec Facebook"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button 
                type="button"
                onClick={() => handleSocialSignUp('Google')} 
                className="w-12 h-12 rounded-full bg-white hover:bg-gray-50 border border-gray-300 flex items-center justify-center transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95"
                aria-label="S'inscrire avec Google"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
              <button 
                type="button"
                onClick={() => handleSocialSignUp('Apple')} 
                className="w-12 h-12 rounded-full bg-black hover:bg-gray-800 flex items-center justify-center transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95"
                aria-label="S'inscrire avec Apple"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              </button>
            </div>

            {/* Sign In Link */}
            <p className="text-center text-sm text-gray-700">
              Vous avez déjà un compte?{" "}
              <a href="/signin" className="text-[#011753] font-semibold hover:underline transition-colors">
                Se connecter
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomifiSignUp;