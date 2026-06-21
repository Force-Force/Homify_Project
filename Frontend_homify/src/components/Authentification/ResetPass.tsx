import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound } from 'lucide-react';
import Carosel from './Carosel';
import MobileCarousel from './MobileCarossel';

const ResetPass = () => {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-homify-surface">
      <Carosel />

      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-2">
            <MobileCarousel />
          </div>

          <div className="bg-homify-card rounded-modal shadow-card p-8 border border-homify-border text-center">
            <div className="w-14 h-14 bg-homify-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-7 h-7 text-homify-primary" />
            </div>
            <h2 className="text-xl font-bold text-homify-text mb-2">Réinitialiser le mot de passe</h2>
            <p className="text-homify-muted text-sm mb-6">
              Cette fonctionnalité sera bientôt disponible. Utilisez le lien reçu par email.
            </p>
            <Link
              to="/signin"
              className="inline-flex items-center gap-2 text-homify-primary font-semibold hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPass;
