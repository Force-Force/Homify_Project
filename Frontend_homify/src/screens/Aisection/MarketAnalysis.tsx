import React, { useState } from 'react';
import { TrendingUp, Search, MapPin, Sparkles, Calendar, Home, ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';

interface MarketData {
  location: string;
  medianPrice: string;
  priceChange: number;
  daysOnMarket: number;
  marketChange: number;
  inventoryLevel: number;
  trendData: number[];
  predictions?: {
    marketTrend: string;
    bestTimeToBuy: string;
    highDemandAreas: string;
  };
  dataSource?: string;
  listingsAnalyzed?: number;
}

const MarketAnalysis = () => {
  const [location, setLocation] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  
  const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/market-analysis';

  const getUserLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then(res => res.json())
            .then(data => {
              if (data.display_name) {
                setLocation(data.display_name);
              } else {
                setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
              }
              setLocationLoading(false);
            })
            .catch(err => {
              console.error('Geocoding error:', err);
              setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
              setLocationLoading(false);
            });
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Impossible de récupérer votre localisation. Veuillez vérifier vos paramètres.');
          setLocationLoading(false);
        }
      );
    } else {
      setError('La géolocalisation n\'est pas supportée par votre navigateur.');
      setLocationLoading(false);
    }
  };

  const geocodeLocation = async (locationName: string) => {
    if (!locationName.trim()) return;
    
    setLocationLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setUserLocation({ lat: parseFloat(lat), lng: parseFloat(lon) });
        setLocation(display_name);
      } else {
        setError('Localisation non trouvée. Veuillez essayer un autre nom.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setError('Erreur lors de la recherche de localisation.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!location.trim()) {
      setError('Veuillez entrer une localisation');
      return;
    }

    if (!userLocation) {
      await geocodeLocation(location);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setLoading(true);
    setError('');
    setShowAnalysis(false);
    setMarketData(null);

    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError('Le serveur ne répond pas. Veuillez réessayer.');
    }, 30000);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: location.trim(),
          coordinates: userLocation,
          timestamp: new Date().toISOString()
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const marketInfo = Array.isArray(data) ? data[0] : data;
      
      if (!marketInfo || marketInfo.error) {
        setError(marketInfo?.message || 'Aucune donnée disponible pour cette localisation.');
        setLoading(false);
        return;
      }

      if (!marketInfo.location || !marketInfo.medianPrice) {
        setError('Données invalides reçues du serveur.');
        setLoading(false);
        return;
      }

      const analyzedData = analyzeMarketData(marketInfo);
      setMarketData(analyzedData);
      setShowAnalysis(true);
      setLoading(false);
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Error fetching market data:', err);
      setLoading(false);
      setError('Impossible de se connecter au service d\'analyse du marché.');
    }
  };

  const analyzeMarketData = (rawData: any): MarketData => {
    const priceChange = rawData.priceChange || 0;
    const marketChange = rawData.marketChange || 0;
    const inventoryLevel = rawData.inventoryLevel || 0;
    const daysOnMarket = rawData.daysOnMarket || 0;
    
    let marketTrendAnalysis = '';
    if (priceChange > 3) {
      marketTrendAnalysis = `Le marché est en forte croissance avec une augmentation de ${priceChange}% des prix. C'est un marché de vendeurs avec une demande élevée.`;
    } else if (priceChange > 0) {
      marketTrendAnalysis = `Le marché connaît une croissance modérée de ${priceChange}%. Les conditions sont équilibrées entre acheteurs et vendeurs.`;
    } else if (priceChange < -3) {
      marketTrendAnalysis = `Le marché est en baisse avec une diminution de ${Math.abs(priceChange)}% des prix. C'est un marché d'acheteurs avec de bonnes opportunités.`;
    } else {
      marketTrendAnalysis = `Le marché est stable avec un changement de ${priceChange}%. Les conditions sont favorables pour négocier.`;
    }

    let bestTimeToBuyAnalysis = '';
    if (daysOnMarket > 45) {
      bestTimeToBuyAnalysis = `Les propriétés restent ${daysOnMarket} jours sur le marché, indiquant un bon pouvoir de négociation pour les acheteurs.`;
    } else if (daysOnMarket < 20) {
      bestTimeToBuyAnalysis = `Avec seulement ${daysOnMarket} jours sur le marché, la concurrence est forte. Agissez rapidement.`;
    } else {
      bestTimeToBuyAnalysis = `Le délai moyen de ${daysOnMarket} jours sur le marché offre un équilibre.`;
    }

    let highDemandAnalysis = '';
    if (inventoryLevel < 30) {
      highDemandAnalysis = `L'inventaire est bas (${inventoryLevel}%), indiquant une forte demande. Les quartiers centraux sont particulièrement prisés.`;
    } else if (inventoryLevel > 70) {
      highDemandAnalysis = `L'inventaire est élevé (${inventoryLevel}%), offrant plus de choix aux acheteurs.`;
    } else {
      highDemandAnalysis = `L'inventaire est modéré (${inventoryLevel}%). Les zones près des commodités restent les plus demandées.`;
    }

    const trendData = rawData.trendData || [];
    let trendDirection = '';
    if (trendData.length >= 6) {
      const recent = trendData.slice(-3);
      const older = trendData.slice(0, 3);
      const recentAvg = recent.reduce((a: number, b: number) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a: number, b: number) => a + b, 0) / older.length;
      
      if (recentAvg > olderAvg * 1.1) {
        trendDirection = ' La tendance récente montre une accélération de la croissance.';
      } else if (recentAvg < olderAvg * 0.9) {
        trendDirection = ' La tendance récente montre un ralentissement du marché.';
      }
    }

    return {
      location: rawData.location,
      medianPrice: rawData.medianPrice,
      priceChange: priceChange,
      daysOnMarket: daysOnMarket,
      marketChange: marketChange,
      inventoryLevel: inventoryLevel,
      trendData: trendData,
      predictions: {
        marketTrend: marketTrendAnalysis + trendDirection,
        bestTimeToBuy: bestTimeToBuyAnalysis,
        highDemandAreas: highDemandAnalysis
      },
      dataSource: rawData.dataSource || 'analyzed',
      listingsAnalyzed: rawData.listingsAnalyzed
    };
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatCFA = (value: string) => {
    if (value.includes('FCFA') || value.includes('XAF')) {
      return value;
    }
    const numValue = parseFloat(value.replace(/[^0-9.]/g, ''));
    if (!isNaN(numValue)) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XAF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(numValue);
    }
    return value;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white pt-4 pb-6 px-4 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <button 
            type="button"
            onClick={(e) => e.preventDefault()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={(e) => e.preventDefault()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button 
              type="button"
              onClick={(e) => e.preventDefault()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Analyse du Marché
        </h1>
        <p className="text-center text-gray-500 text-sm">
          Analyses immobilières alimentées par l'IA
        </p>
      </div>

      <div className="px-4 py-6">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Entrez une ville ou un code postal"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading || locationLoading}
            className="w-full pl-10 pr-24 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              getUserLocation();
            }}
            disabled={locationLoading || loading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Utiliser ma position GPS"
          >
            {locationLoading ? (
              <svg className="w-4 h-4 text-green-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <MapPin className="w-4 h-4 text-green-600" />
            )}
          </button>
        </div>
        
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          disabled={loading || locationLoading}
          className="w-full mt-3 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Analyse en cours...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Analyser le Marché</span>
            </>
          )}
        </button>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {showAnalysis && marketData && (
        <div className="px-4 space-y-4 animate-in fade-in slide-in-from-bottom duration-500">
          <div className="bg-white rounded-2xl p-4 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {marketData.location}
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                <p className="text-xs text-gray-600 mb-1">Prix Médian</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {formatCFA(marketData.medianPrice)}
                </p>
                <div className="flex items-center gap-1">
                  {marketData.priceChange >= 0 ? (
                    <>
                      <ArrowUp className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-600 font-semibold">
                        + {marketData.priceChange}%
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="w-3 h-3 text-red-600" />
                      <span className="text-xs text-red-600 font-semibold">
                        {marketData.priceChange}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                <p className="text-xs text-gray-600 mb-1">Jours sur le Marché</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {marketData.daysOnMarket}
                </p>
                <div className="flex items-center gap-1">
                  {marketData.marketChange >= 0 ? (
                    <>
                      <ArrowUp className="w-3 h-3 text-purple-600" />
                      <span className="text-xs text-purple-600 font-semibold">
                        + {marketData.marketChange}%
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="w-3 h-3 text-purple-600" />
                      <span className="text-xs text-purple-600 font-semibold">
                        {marketData.marketChange}%
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Tendance des Prix</p>
              <div className="relative h-24 flex items-end justify-between gap-1">
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 rounded-full"></div>
                
                {marketData.trendData && marketData.trendData.length > 0 ? (
                  marketData.trendData.map((value, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all hover:opacity-80"
                      style={{ height: `${Math.max(value, 5)}%` }}
                    ></div>
                  ))
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
                    Pas de données disponibles
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>Jan</span>
                <span>Août</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold text-gray-700">Niveau d'Inventaire</p>
                <span className="text-sm font-bold text-gray-900">{marketData.inventoryLevel}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(Math.max(marketData.inventoryLevel, 0), 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {marketData.predictions && (
            <div className="bg-white rounded-2xl p-4 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Prédictions IA</h3>
              </div>
              
              <div className="space-y-3">
                {marketData.predictions.marketTrend && (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        Tendance du Marché
                      </p>
                      <p className="text-xs text-gray-600">
                        {marketData.predictions.marketTrend}
                      </p>
                    </div>
                  </div>
                )}

                {marketData.predictions.bestTimeToBuy && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        Meilleur Moment pour Acheter
                      </p>
                      <p className="text-xs text-gray-600">
                        {marketData.predictions.bestTimeToBuy}
                      </p>
                    </div>
                  </div>
                )}

                {marketData.predictions.highDemandAreas && (
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Home className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        Zones à Forte Demande
                      </p>
                      <p className="text-xs text-gray-600">
                        {marketData.predictions.highDemandAreas}
                      </p>
                    </div>
                  </div>
                )}
              </div>
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default MarketAnalysis;