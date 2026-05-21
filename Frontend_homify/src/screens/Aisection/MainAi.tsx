import React, { useState } from 'react';
import { Sparkles, Search, TrendingUp, Calculator, Headphones, ArrowLeft } from 'lucide-react';
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
  details: string;
};

const features: Feature[] = [
  {
    id: 1,
    icon: Search,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    title: 'Smart Property Search',
    description: 'Use AI to find properties that match your preferences and budget.',
    details:
      "Describe your ideal property (budget, city, number of rooms...) and the AI will instantly suggest the best matching listings from Homify's database."
  },
  {
    id: 2,
    icon: TrendingUp,
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    title: 'Market Analysis',
    description: 'Get real-time market insights, price trends, and investment opportunities in your area.',
    details:
      'Compare neighborhoods, see historical price evolution, and identify the best moments to rent or invest with AI-powered analytics.'
  },
  {
    id: 3,
    icon: Calculator,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    title: 'Mortgage Calculator',
    description: 'Calculate monthly payments, interest rates, and compare loan options to find the best mortgage solution.',
    details:
      'Simulate different repayment plans, down payments, and interest rates to understand exactly how much your project will cost per month.'
  },
  {
    id: 4,
    icon: Headphones,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    title: '24/7 Chat Support',
    description: 'Get instant answers to your questions and personalized guidance throughout the buying process.',
    details:
      'Talk with an intelligent assistant at any time to clarify documents, visits, contracts, and every step of your real-estate journey.'
  }
];

export default function MainAi() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  const handleOpenFeature = (feature: Feature) => {
    setSelectedFeature(feature);
  };

  const handleBackToMain = () => {
    setSelectedFeature(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 ">
      {/* Mobile & Desktop Container */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16 md:pb-4 sm:pb-8">


        {selectedFeature ? (
          <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl border border-gray-100 animate-in fade-in duration-300">
            <button
              onClick={handleBackToMain}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-800 mb-6 md:mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to AI Assistant
            </button>

            <div className="flex items-start gap-4 md:gap-6 mb-6 md:mb-8">
              <div className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 ${selectedFeature.iconBg} rounded-2xl flex items-center justify-center shadow-md`}>
                <selectedFeature.icon className={`w-8 h-8 md:w-10 md:h-10 ${selectedFeature.iconColor}`} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {selectedFeature.title}
                </h1>
                <p className="text-gray-600 text-sm md:text-base">
                  {selectedFeature.description}
                </p>
              </div>
            </div>

            {/* Feature-specific subpage content (external pages) */}
            {selectedFeature.id === 1 && <SmartPropertySearch />}
            {selectedFeature.id === 2 && <MarketAnalysis />}
            {selectedFeature.id === 3 && <MortageCalculator />}
            {selectedFeature.id === 4 && <ChatSupport />}
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="text-center mb-12 md:mb-16">
              <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-xl mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-white relative z-10" />
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                AI Assistant
              </h1>

              <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto px-4">
                Get personalized recommendations and instant answers
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <button
                    type="button"
                    key={feature.id}
                    onClick={() => handleOpenFeature(feature)}
                    className="text-left bg-white rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <div className="flex items-start gap-4 md:gap-5">
                      {/* Icon Container */}
                      <div className={`flex-shrink-0 w-14 h-14 md:w-16 md:h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center shadow-md`}>
                        <Icon className={`w-7 h-7 md:w-8 md:h-8 ${feature.iconColor}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 mb-12">
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}