import { useState } from 'react';
import { Sparkles, Search, TrendingUp, Calculator, Headphones, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import SmartPropertySearch from './SmartProperty';
import MarketAnalysis from './MarketAnalysis';
import MortageCalculator from './MortageCalculator';
import ChatSupport from './ChatSupport';

type Feature = {
  id: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    id: 1,
    icon: Search,
    iconBg: 'bg-homify-primary/10',
    iconColor: 'text-homify-primary',
    title: 'Recherche intelligente',
    description: 'L\'IA trouve les biens qui correspondent à vos critères et votre budget.',
  },
  {
    id: 2,
    icon: TrendingUp,
    iconBg: 'bg-homify-accent/10',
    iconColor: 'text-homify-accent',
    title: 'Analyse de marché',
    description: 'Tendances des prix, quartiers prometteurs et opportunités d\'investissement.',
  },
  {
    id: 3,
    icon: Calculator,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    title: 'Calculateur de loyer',
    description: 'Simulez vos mensualités et comparez différentes options de financement.',
  },
  {
    id: 4,
    icon: Headphones,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    title: 'Support 24/7',
    description: 'Obtenez des réponses instantanées à toutes vos questions immobilières.',
  },
];

export default function MainAi() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  if (selectedFeature) {
    return (
      <div className="px-5 md:px-0 pt-2 pb-28">
        <div className="max-w-4xl mx-auto bg-homify-card rounded-modal p-6 md:p-8 shadow-card border border-homify-border">
          <button
            onClick={() => setSelectedFeature(null)}
            className="inline-flex items-center gap-2 text-sm font-medium text-homify-muted hover:text-homify-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'assistant
          </button>

          <div className="flex items-start gap-4 mb-6">
            <div className={`shrink-0 w-14 h-14 ${selectedFeature.iconBg} rounded-xl flex items-center justify-center`}>
              <selectedFeature.icon className={`w-7 h-7 ${selectedFeature.iconColor}`} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-homify-text mb-1">{selectedFeature.title}</h1>
              <p className="text-homify-muted text-sm">{selectedFeature.description}</p>
            </div>
          </div>

          {selectedFeature.id === 1 && <SmartPropertySearch />}
          {selectedFeature.id === 2 && <MarketAnalysis />}
          {selectedFeature.id === 3 && <MortageCalculator />}
          {selectedFeature.id === 4 && <ChatSupport />}
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 md:px-0 pt-2 pb-28">
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-homify-primary rounded-2xl shadow-card mb-5"
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-homify-text mb-2">Assistant IA</h1>
        <p className="text-homify-muted text-sm max-w-md mx-auto">
          Recommandations personnalisées et réponses instantanées pour votre recherche immobilière.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.button
              key={feature.id}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => setSelectedFeature(feature)}
              className="text-left bg-homify-card rounded-card p-5 shadow-card border border-homify-border hover:shadow-card-hover hover:border-homify-primary/20 transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-homify-primary/20"
            >
              <div className="flex items-start gap-4">
                <div className={`shrink-0 w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-bold text-homify-text mb-1">{feature.title}</h3>
                  <p className="text-homify-muted text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
