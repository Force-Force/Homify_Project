import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Bot, Heart, MapPin, Shield, ArrowRight, Home } from 'lucide-react';
import Aurora from '@/components/ui/Aurora/Aurora';

const FEATURES = [
  {
    icon: Search,
    title: 'Recherche intelligente',
    description: 'Filtrez par ville, budget et type de bien en quelques clics.',
  },
  {
    icon: Bot,
    title: 'Assistant IA',
    description: 'Analyse de marché, calcul de loyer et recommandations personnalisées.',
  },
  {
    icon: Heart,
    title: 'Favoris synchronisés',
    description: 'Sauvegardez vos annonces préférées et retrouvez-les partout.',
  },
];

const STATS = [
  { value: '500+', label: 'Annonces actives' },
  { value: 'Yaoundé', label: 'Douala & environs' },
  { value: '24/7', label: 'Assistant disponible' },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-homify-surface">
      {/* Aurora background */}
      <div className="absolute inset-0 z-0">
        <Aurora
          colorStops={['#1B4332', '#40916C', '#E07A5F']}
          amplitude={1.1}
          blend={0.55}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-homify-surface/30 via-homify-surface/70 to-homify-surface" />
      </div>

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-homify-primary text-white">
            <Home className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-homify-primary">Homify</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            to="/signin"
            className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-homify-primary hover:text-homify-primary-light transition-colors"
          >
            Se connecter
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 rounded-btn bg-homify-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-homify-accent-hover transition-colors"
          >
            S'inscrire
            <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10">
        <section className="mx-auto max-w-5xl px-6 pt-12 pb-20 text-center md:pt-20 md:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-homify-primary/20 bg-white/70 px-3 py-1 text-xs font-semibold text-homify-primary backdrop-blur-sm mb-6">
              <MapPin className="h-3.5 w-3.5 text-homify-accent" />
              Location immobilière au Cameroun
            </span>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-homify-text md:text-6xl md:leading-[1.1]">
              Trouvez votre{' '}
              <span className="text-homify-primary">chez-vous</span>
              <br className="hidden sm:block" />
              en toute simplicité
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base text-homify-muted md:text-lg leading-relaxed">
              Studios, appartements et maisons à Yaoundé, Douala et partout au Cameroun.
              Recherchez, comparez et contactez les propriétaires en quelques minutes.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/signup"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-btn bg-homify-primary px-8 py-3.5 text-base font-bold text-white shadow-md hover:bg-homify-primary-light transition-all hover:-translate-y-0.5"
              >
                Commencer gratuitement
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/signin"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-btn border border-homify-border bg-white/80 px-8 py-3.5 text-base font-semibold text-homify-primary backdrop-blur-sm hover:bg-white transition-all"
              >
                J'ai déjà un compte
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto"
          >
            {STATS.map(({ value, label }) => (
              <div key={label} className="rounded-card bg-white/70 backdrop-blur-sm border border-homify-border/60 px-3 py-4">
                <p className="text-lg font-extrabold text-homify-primary md:text-xl">{value}</p>
                <p className="text-[11px] text-homify-muted mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Features */}
        <section className="relative z-10 bg-white/60 backdrop-blur-md border-t border-homify-border/50 py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-homify-text md:text-3xl">
                Tout ce dont vous avez besoin
              </h2>
              <p className="mt-2 text-homify-muted text-sm md:text-base">
                Une plateforme complète pour locataires et propriétaires
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, description }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="rounded-card border border-homify-border bg-homify-card p-6 shadow-card hover:shadow-card-hover transition-shadow"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-homify-primary/10">
                    <Icon className="h-5 w-5 text-homify-primary" />
                  </div>
                  <h3 className="font-bold text-homify-text mb-1.5">{title}</h3>
                  <p className="text-sm text-homify-muted leading-relaxed">{description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust banner */}
        <section className="relative z-10 py-14 px-6">
          <div className="mx-auto max-w-3xl rounded-modal bg-homify-primary p-8 md:p-10 text-center text-white shadow-lg">
            <Shield className="h-8 w-8 mx-auto mb-4 text-homify-accent" />
            <h2 className="text-xl font-bold md:text-2xl mb-2">
              Propriétaires & locataires, on vous accompagne
            </h2>
            <p className="text-white/75 text-sm md:text-base mb-6 max-w-md mx-auto">
              Inscrivez-vous en tant que locataire ou propriétaire et publiez ou consultez des annonces dès aujourd'hui.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-btn bg-homify-accent px-6 py-3 font-bold text-white hover:bg-homify-accent-hover transition-colors"
            >
              Créer mon compte
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-homify-border/50 py-6 text-center text-xs text-homify-muted">
        © {new Date().getFullYear()} Homify — Location immobilière au Cameroun
      </footer>
    </div>
  );
}
