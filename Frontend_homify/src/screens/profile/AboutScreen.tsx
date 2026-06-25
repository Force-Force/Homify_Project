import { ExternalLink, Mail, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SettingsLayout, SettingsPanel } from '@/components/settings/SettingsLayout';

export default function AboutScreen() {
  return (
    <SettingsLayout title="À propos" subtitle="Homify — location immobilière au Cameroun.">
      <SettingsPanel className="mb-6 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-homify-primary flex items-center justify-center mb-4">
          <span className="text-2xl font-extrabold text-white">H</span>
        </div>
        <h2 className="text-lg font-bold text-homify-text">Homify</h2>
        <p className="text-sm text-homify-muted mt-1">Version 1.0.0</p>
        <p className="text-xs text-homify-muted mt-3 leading-relaxed">
          Plateforme de location à Yaoundé, Douala et dans tout le Cameroun.
          Trouvez un logement, analysez le marché et échangez en toute confiance.
        </p>
      </SettingsPanel>

      <SettingsPanel>
        <h3 className="font-bold text-homify-text mb-4">Support</h3>
        <ul className="space-y-3 text-sm">
          <li>
            <Link to="/assist" className="flex items-center gap-2 text-homify-primary hover:underline">
              <ExternalLink className="w-4 h-4" />
              Assistant et FAQ intégrée
            </Link>
          </li>
          <li className="flex items-center gap-2 text-homify-muted">
            <Mail className="w-4 h-4 shrink-0" />
            contact@homify.cm
          </li>
          <li className="flex items-start gap-2 text-homify-muted">
            <Shield className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Vos données sont protégées. Les annonces sont modérées avant publication.
            </span>
          </li>
        </ul>
      </SettingsPanel>
    </SettingsLayout>
  );
}
