import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Bot, Heart, MapPin, Shield, ArrowRight, Home,
  ChevronLeft, ChevronRight, Building2, Users, Star, CheckCircle,
  MessageCircle, TrendingUp, Key,
} from 'lucide-react';
import Aurora from '@/components/ui/Aurora/Aurora';
import { CAROUSEL_IMAGES } from '@/components/Authentification/carouselData';

const FEATURES = [
  { icon: Search, title: 'Recherche intelligente', description: 'Filtrez par ville, quartier, budget et type de bien en quelques clics.' },
  { icon: Bot, title: 'Assistant IA', description: 'Analyse de marché, calcul de loyer et recommandations personnalisées.' },
  { icon: Heart, title: 'Favoris synchronisés', description: 'Sauvegardez vos annonces préférées et retrouvez-les partout.' },
  { icon: MessageCircle, title: 'Messagerie intégrée', description: 'Contactez directement les propriétaires depuis la plateforme.' },
  { icon: TrendingUp, title: 'Analyse de marché', description: 'Comparez les prix du marché et trouvez la meilleure offre.' },
  { icon: Shield, title: 'Annonces vérifiées', description: 'Des logements publiés par des propriétaires identifiés.' },
];

const STEPS = [
  { num: '01', title: 'Créez votre compte', desc: 'Inscrivez-vous gratuitement en tant que locataire ou propriétaire.' },
  { num: '02', title: 'Explorez les annonces', desc: 'Parcourez studios, appartements et maisons près de chez vous.' },
  { num: '03', title: 'Contactez & visitez', desc: 'Échangez avec le propriétaire et planifiez votre visite.' },
  { num: '04', title: 'Emménagez sereinement', desc: 'Trouvez votre chez-vous et finalisez votre location.' },
];

const PROPERTY_TYPES = [
  { label: 'Studios', emoji: '🏢', desc: 'Idéal pour étudiants et jeunes actifs' },
  { label: 'Appartements', emoji: '🏠', desc: '2 à 4 pièces en ville ou en banlieue' },
  { label: 'Maisons', emoji: '🏡', desc: 'Espaces familiaux avec jardin' },
  { label: 'Chambres', emoji: '🛏️', desc: 'Colocation et chambres meublées' },
];

const TESTIMONIALS = [
  { name: 'Marie N.', city: 'Yaoundé', text: 'J\'ai trouvé mon studio en 3 jours grâce à Homify. L\'interface est simple et les filtres très pratiques.', rating: 5 },
  { name: 'Jean-Paul M.', city: 'Douala', text: 'En tant que propriétaire, publier mon annonce a pris moins de 10 minutes. Très satisfait !', rating: 5 },
  { name: 'Aïcha B.', city: 'Yaoundé', text: 'L\'assistant IA m\'a aidée à estimer le loyer de mon futur appartement. Super outil.', rating: 4 },
];

const FAQ = [
  { q: 'Homify est-il gratuit ?', a: 'Oui, l\'inscription et la consultation des annonces sont entièrement gratuites pour les locataires.' },
  { q: 'Dans quelles villes êtes-vous disponibles ?', a: 'Nous couvrons principalement Yaoundé et Douala, avec une expansion progressive vers d\'autres villes du Cameroun.' },
  { q: 'Comment publier une annonce ?', a: 'Créez un compte propriétaire, remplissez les détails de votre bien et publiez en quelques minutes.' },
  { q: 'Puis-je contacter un propriétaire directement ?', a: 'Oui, via notre messagerie intégrée une fois connecté à votre compte.' },
];

const STATS = [
  { value: '500+', label: 'Annonces actives' },
  { value: '2 000+', label: 'Utilisateurs' },
  { value: 'Yaoundé & Douala', label: 'Villes couvertes' },
  { value: '24/7', label: 'Assistant IA' },
];

function LandingHeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % CAROUSEL_IMAGES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[85vh] lg:min-h-screen overflow-hidden">
      {CAROUSEL_IMAGES.map((image, index) => (
        <div
          key={index}
          className="absolute inset-0 transition-opacity duration-1000 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(27,67,50,0.55), rgba(27,67,50,0.7)), url('${image.url}')`,
            opacity: currentSlide === index ? 1 : 0,
            zIndex: currentSlide === index ? 1 : 0,
          }}
        />
      ))}

      <div className="absolute inset-0 z-[2]">
        <Aurora colorStops={['#1B4332', '#40916C', '#E07A5F']} amplitude={0.6} blend={0.4} />
        <div className="absolute inset-0 bg-homify-primary/30" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] lg:min-h-screen px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm mb-6">
            <MapPin className="h-3.5 w-3.5 text-homify-accent" />
            Location immobilière au Cameroun
          </span>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-white max-w-4xl mx-auto">
            {CAROUSEL_IMAGES[currentSlide].title}
          </h1>

          <p className="mt-5 text-white/80 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Studios, appartements et maisons à Yaoundé, Douala et partout au Cameroun.
            La plateforme qui simplifie votre recherche de logement.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/signup" className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-btn bg-homify-accent px-8 py-4 text-base font-bold text-white shadow-lg hover:bg-homify-accent-hover transition-all hover:-translate-y-0.5">
              Commencer gratuitement <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/signin" className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-btn border border-white/40 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-all">
              Se connecter
            </Link>
          </div>
        </motion.div>

        {/* Carousel controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <button onClick={() => setCurrentSlide((p) => (p - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length)} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2.5 transition-all" aria-label="Précédent">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex gap-2">
            {CAROUSEL_IMAGES.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2 rounded-full transition-all ${currentSlide === i ? 'w-8 bg-white' : 'w-2 bg-white/50'}`} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
          <button onClick={() => setCurrentSlide((p) => (p + 1) % CAROUSEL_IMAGES.length)} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2.5 transition-all" aria-label="Suivant">
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-homify-surface">
      {/* Nav fixe */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 bg-homify-primary/90 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
            <Home className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-white">Homify</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link to="/signin" className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-white/90 hover:text-white transition-colors">Se connecter</Link>
          <Link to="/signup" className="inline-flex items-center gap-1.5 rounded-btn bg-homify-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-homify-accent-hover transition-colors">
            S'inscrire <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      <LandingHeroCarousel />

      {/* Stats */}
      <section className="py-12 px-6 bg-homify-card border-b border-homify-border">
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl md:text-3xl font-extrabold text-homify-primary">{value}</p>
              <p className="text-xs md:text-sm text-homify-muted mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Types de biens */}
      <section className="py-16 md:py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-homify-text">Tous types de logements</h2>
            <p className="mt-2 text-homify-muted">Du studio à la maison familiale</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PROPERTY_TYPES.map(({ label, emoji, desc }) => (
              <div key={label} className="rounded-card border border-homify-border bg-homify-card p-5 text-center shadow-card hover:shadow-card-hover transition-shadow">
                <span className="text-3xl">{emoji}</span>
                <h3 className="font-bold text-homify-text mt-3 mb-1">{label}</h3>
                <p className="text-xs text-homify-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-16 md:py-24 px-6 bg-homify-primary text-white">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Comment ça marche ?</h2>
            <p className="mt-2 text-white/70">Quatre étapes pour trouver votre logement</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="rounded-card bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <span className="text-3xl font-extrabold text-homify-accent">{num}</span>
                <h3 className="font-bold text-lg mt-3 mb-2">{title}</h3>
                <p className="text-sm text-white/75 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-homify-text">Tout ce dont vous avez besoin</h2>
            <p className="mt-2 text-homify-muted">Une plateforme complète pour locataires et propriétaires</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-card border border-homify-border bg-homify-card p-6 shadow-card hover:shadow-card-hover transition-shadow">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-homify-primary/10">
                  <Icon className="h-5 w-5 text-homify-primary" />
                </div>
                <h3 className="font-bold text-homify-text mb-1.5">{title}</h3>
                <p className="text-sm text-homify-muted leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locataires / Propriétaires */}
      <section className="py-16 md:py-24 px-6 bg-white border-y border-homify-border">
        <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-8">
          <div className="rounded-modal bg-homify-surface border border-homify-border p-8">
            <Users className="h-8 w-8 text-homify-primary mb-4" />
            <h3 className="text-xl font-bold text-homify-text mb-3">Pour les locataires</h3>
            <ul className="space-y-3">
              {['Recherche avancée par ville et budget', 'Assistant IA pour vous guider', 'Favoris et alertes personnalisées', 'Contact direct avec les propriétaires'].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-homify-muted">
                  <CheckCircle className="h-4 w-4 text-homify-accent shrink-0 mt-0.5" />{item}
                </li>
              ))}
            </ul>
            <Link to="/signup" className="mt-6 inline-flex items-center gap-2 text-homify-primary font-semibold hover:underline">
              Créer un compte locataire <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-modal bg-homify-primary text-white p-8">
            <Key className="h-8 w-8 text-homify-accent mb-4" />
            <h3 className="text-xl font-bold mb-3">Pour les propriétaires</h3>
            <ul className="space-y-3">
              {['Publiez vos annonces en quelques minutes', 'Gérez vos biens depuis un tableau de bord', 'Recevez des demandes qualifiées', 'Analyse de marché pour fixer votre loyer'].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-white/80">
                  <CheckCircle className="h-4 w-4 text-homify-accent shrink-0 mt-0.5" />{item}
                </li>
              ))}
            </ul>
            <Link to="/signup" className="mt-6 inline-flex items-center gap-2 text-homify-accent font-semibold hover:underline">
              Publier une annonce <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-16 md:py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-homify-text">Ils nous font confiance</h2>
            <p className="mt-2 text-homify-muted">Ce que disent nos utilisateurs</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, city, text, rating }) => (
              <div key={name} className="rounded-card border border-homify-border bg-homify-card p-6 shadow-card">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-homify-muted leading-relaxed mb-4">"{text}"</p>
                <p className="font-semibold text-homify-text text-sm">{name}</p>
                <p className="text-xs text-homify-muted">{city}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 px-6 bg-homify-surface border-t border-homify-border">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-homify-text">Questions fréquentes</h2>
          </div>
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="rounded-card border border-homify-border bg-homify-card p-5">
                <h3 className="font-semibold text-homify-text mb-2">{q}</h3>
                <p className="text-sm text-homify-muted leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-3xl rounded-modal bg-homify-primary p-10 md:p-14 text-center text-white shadow-lg">
          <Building2 className="h-10 w-10 mx-auto mb-4 text-homify-accent" />
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Prêt à trouver votre chez-vous ?</h2>
          <p className="text-white/75 mb-8 max-w-md mx-auto">
            Rejoignez Homify gratuitement et commencez votre recherche dès maintenant.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup" className="inline-flex items-center justify-center gap-2 rounded-btn bg-homify-accent px-8 py-3.5 font-bold text-white hover:bg-homify-accent-hover transition-colors">
              Créer mon compte <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/signin" className="inline-flex items-center justify-center gap-2 rounded-btn border border-white/30 px-8 py-3.5 font-semibold text-white hover:bg-white/10 transition-colors">
              J'ai déjà un compte
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-homify-border py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-homify-primary">
            <Home className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-homify-primary">Homify</span>
        </div>
        <p className="text-xs text-homify-muted">© {new Date().getFullYear()} Homify — Location immobilière au Cameroun</p>
        <div className="flex justify-center gap-6 mt-4 text-xs text-homify-muted">
          <Link to="/signup" className="hover:text-homify-primary transition-colors">S'inscrire</Link>
          <Link to="/signin" className="hover:text-homify-primary transition-colors">Se connecter</Link>
        </div>
      </footer>
    </div>
  );
}
