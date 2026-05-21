import React, { useState, useEffect } from 'react';
import { Calculator, ChevronDown, Loader, TrendingUp, AlertCircle } from 'lucide-react';

interface MortgageResult {
  monthlyPayment: number;
  principalInterest: number;
  propertyTax: number;
  insurance: number;
  totalInterest: number;
  totalAmount: number;
  currentMarketRate: number;
  recommendation: string;
}

const MortgageCalculator = () => {
  const [homePrice, setHomePrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState('30');
  const [result, setResult] = useState<MortgageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [n8nWorkflowUrl] = useState('http://localhost:5678/webhook/mortgage-calculator');
  const [useMarketRate, setUseMarketRate] = useState(true);

  const formatCurrency = (value: string) => {
    const num = value.replace(/,/g, '').replace(/\D/g, '');
    if (!num) return '';
    return parseInt(num).toLocaleString();
  };

  const handleHomePrice = (value: string) => {
    const formatted = formatCurrency(value);
    setHomePrice(formatted);
  };

  const handleDownPayment = (value: string) => {
    const formatted = formatCurrency(value);
    setDownPayment(formatted);
  };

  const calculateMortgage = async () => {
    const price = parseFloat(homePrice.replace(/,/g, '')) || 0;
    const down = parseFloat(downPayment.replace(/,/g, '')) || 0;
    const rate = useMarketRate ? 0 : parseFloat(interestRate) || 0;
    const years = parseInt(loanTerm);

    if (price <= 0) {
      setErrorMessage('Veuillez entrer un prix de maison valide.');
      return;
    }

    if (down >= price) {
      setErrorMessage('L\'acompte ne peut pas être supérieur ou égal au prix de la maison.');
      return;
    }

    if (!useMarketRate && rate <= 0) {
      setErrorMessage('Veuillez entrer un taux d\'intérêt valide.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    // Timeout de 30 secondes
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setErrorMessage('Le serveur ne répond pas. Veuillez réessayer.');
    }, 30000);

    try {
      const response = await fetch(n8nWorkflowUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          homePrice: price,
          downPayment: down,
          interestRate: useMarketRate ? null : rate,
          loanTerm: years,
          useMarketRate: useMarketRate,
          currency: 'XAF'
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to calculate mortgage');
      }

      const data = await response.json();

      if (!data || !data.monthlyPayment) {
        setErrorMessage('Impossible de calculer l\'hypothèque. Veuillez vérifier vos données.');
        setLoading(false);
        return;
      }

      setResult({
        monthlyPayment: data.monthlyPayment,
        principalInterest: data.principalInterest,
        propertyTax: data.propertyTax,
        insurance: data.insurance,
        totalInterest: data.totalInterest,
        totalAmount: data.totalAmount,
        currentMarketRate: data.currentMarketRate || rate,
        recommendation: data.recommendation || ''
      });
      setLoading(false);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error calculating mortgage:', error);
      setLoading(false);
      setErrorMessage('Connexion du serveur absente. Calcul local utilisé.');
      
      // Fallback: calcul local
      calculateLocalMortgage(price, down, rate || 6.5, years);
    }
  };

  // Calcul local de secours
  const calculateLocalMortgage = (price: number, down: number, rate: number, years: number) => {
    const principal = price - down;
    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = years * 12;

    const monthlyPI =
      principal *
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const propertyTax = (price * 0.012) / 12;
    const insurance = (price * 0.005) / 12;
    const totalMonthly = monthlyPI + propertyTax + insurance;
    const totalInterest = (monthlyPI * numberOfPayments) - principal;
    const totalAmount = totalMonthly * numberOfPayments;

    setResult({
      monthlyPayment: totalMonthly,
      principalInterest: monthlyPI,
      propertyTax: propertyTax,
      insurance: insurance,
      totalInterest: totalInterest,
      totalAmount: totalAmount,
      currentMarketRate: rate,
      recommendation: 'Calcul basé sur des estimations locales.'
    });
  };

  const formatCFA = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white pt-4 pb-6 px-4 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
            <Calculator className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Calculateur Hypothécaire IA
        </h1>
        <p className="text-center text-gray-500 text-sm">
          Calculez vos paiements selon le marché actuel
        </p>
      </div>

      {/* Calculator Form */}
      <div className="px-4 py-6 space-y-5">
        {/* Home Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Prix de la Maison
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
              FCFA
            </span>
            <input
              type="text"
              placeholder="50,000,000"
              value={homePrice}
              onChange={(e) => handleHomePrice(e.target.value)}
              className="w-full pl-16 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Down Payment */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Acompte Initial
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
              FCFA
            </span>
            <input
              type="text"
              placeholder="10,000,000"
              value={downPayment}
              onChange={(e) => handleDownPayment(e.target.value)}
              className="w-full pl-16 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Market Rate Toggle */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="marketRate"
              checked={useMarketRate}
              onChange={(e) => setUseMarketRate(e.target.checked)}
              className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-200"
            />
            <div className="flex-1">
              <label htmlFor="marketRate" className="font-semibold text-gray-900 text-sm cursor-pointer flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Utiliser le taux du marché actuel
              </label>
              <p className="text-xs text-gray-600 mt-1">
                L'IA récupèrera automatiquement les meilleurs taux disponibles
              </p>
            </div>
          </div>
        </div>

        {/* Interest Rate & Loan Term */}
        <div className="grid grid-cols-2 gap-4">
          {/* Interest Rate */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Taux d'Intérêt
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="6.5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                disabled={useMarketRate}
                className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-400"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                %
              </span>
            </div>
          </div>

          {/* Loan Term */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Durée du Prêt
            </label>
            <div className="relative">
              <select
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700"
              >
                <option value="10">10 ans</option>
                <option value="15">15 ans</option>
                <option value="20">20 ans</option>
                <option value="25">25 ans</option>
                <option value="30">30 ans</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculateMortgage}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Calcul en cours...</span>
            </>
          ) : (
            <>
              <Calculator className="w-5 h-5" />
              <span>Calculer le Paiement</span>
            </>
          )}
        </button>

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 text-sm mb-1">Erreur</h3>
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="px-4 animate-in fade-in slide-in-from-bottom duration-500">
          {/* Monthly Payment Card */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 shadow-lg mb-4 text-white">
            <p className="text-sm opacity-90 mb-2">Paiement Mensuel</p>
            <p className="text-4xl font-bold mb-1">
              {formatCFA(result.monthlyPayment)}
            </p>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <TrendingUp className="w-4 h-4" />
              <span>Taux actuel: {result.currentMarketRate.toFixed(2)}%</span>
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
            <h3 className="font-bold text-gray-900 mb-4">Détails du Paiement</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm text-gray-600">Principal & Intérêts</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCFA(result.principalInterest)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm text-gray-600">Taxe Foncière</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCFA(result.propertyTax)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm text-gray-600">Assurance</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCFA(result.insurance)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-semibold text-gray-900">Total Mensuel</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCFA(result.monthlyPayment)}
                </span>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
            <h3 className="font-bold text-gray-900 mb-4">Résumé Total</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Intérêts Totaux</span>
                <span className="text-sm font-semibold text-orange-600">
                  {formatCFA(result.totalInterest)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Montant Total à Payer</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCFA(result.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* AI Recommendation */}
          {result.recommendation && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
              <p className="text-xs text-green-900 font-medium mb-2 flex items-center gap-2">
                <span className="text-lg">💡</span> Recommandation IA
              </p>
              <p className="text-sm text-green-800">
                {result.recommendation}
              </p>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-from-bottom {
          from { transform: translateY(20px); }
          to { transform: translateY(0); }
        }
        .animate-in {
          animation: fade-in 0.3s ease-out, slide-in-from-bottom 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MortgageCalculator;