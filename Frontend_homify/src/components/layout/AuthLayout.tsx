import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import Aurora from '@/components/ui/Aurora/Aurora';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  backTo = '/',
  backLabel = 'Retour à l\'accueil',
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-homify-surface">
      {/* Left — Aurora hero (desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-end p-12">
        <div className="absolute inset-0">
          <Aurora colorStops={['#1B4332', '#40916C', '#E07A5F']} amplitude={1.0} blend={0.5} />
          <div className="absolute inset-0 bg-gradient-to-t from-homify-primary/80 via-homify-primary/20 to-transparent" />
        </div>
        <div className="relative z-10 text-white max-w-md">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Home className="h-5 w-5" />
            </div>
            <span className="text-2xl font-extrabold">Homify</span>
          </div>
          <h2 className="text-3xl font-extrabold leading-snug mb-3">
            Votre prochain logement vous attend
          </h2>
          <p className="text-white/75 text-sm leading-relaxed">
            Rejoignez des milliers d'utilisateurs qui trouvent leur maison, studio ou appartement au Cameroun.
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-md">
          <Link
            to={backTo}
            className="inline-flex items-center gap-1.5 text-homify-muted hover:text-homify-primary text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-homify-primary text-white">
              <Home className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold text-homify-primary">Homify</span>
          </div>

          <div className="bg-homify-card rounded-modal shadow-card border border-homify-border p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-homify-text mb-1">{title}</h2>
            {subtitle && <p className="text-sm text-homify-muted mb-6">{subtitle}</p>}
            {!subtitle && <div className="mb-6" />}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
