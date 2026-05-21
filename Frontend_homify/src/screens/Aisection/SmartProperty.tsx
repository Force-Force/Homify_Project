import React, { useState, useEffect } from 'react';
import { Search, MapPin, Sparkles, ChevronDown, Bed, Bath, Home, X, ChevronLeft, ChevronRight, Loader } from 'lucide-react';

interface Property {
  id: number;
  images: string[];
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  location: string;
  status: 'Available' | 'Nearby';
  tags: string[];
  matchScore?: number;
}

const SmartPropertySearch = () => {
  const [minPrice, setMinPrice] = useState('250000');
  const [maxPrice, setMaxPrice] = useState('750000');
  const [minBeds, setMinBeds] = useState('2+');
  const [minBaths, setMinBaths] = useState('2+');
  const [location, setLocation] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [n8nWorkflowUrl] = useState('http://localhost:5678/webhook/property-search');

  // Get user's GPS location
  const getUserLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Reverse geocoding to get address from coordinates
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
          alert('Impossible de récupérer votre localisation. Veuillez vérifier vos paramètres.');
          setLocationLoading(false);
        }
      );
    } else {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.');
      setLocationLoading(false);
    }
  };

  // Geocode location name to coordinates
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
        alert('Localisation non trouvée. Veuillez essayer un autre nom.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Erreur lors de la recherche de localisation.');
    } finally {
      setLocationLoading(false);
    }
  };

  // Handle location input blur (when user finishes typing)
  const handleLocationBlur = () => {
    if (location && !userLocation) {
      geocodeLocation(location);
    }
  };

  // Format price in CFA
  const formatCFA = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Search properties via n8n workflow
  // Search properties via n8n workflow
  const handleSearch = async () => {
    // Si pas de coordonnées mais un lieu saisi, géocoder d'abord
    if (!userLocation && location) {
      await geocodeLocation(location);
      // Attendre un peu que les coordonnées soient définies
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!userLocation) {
      alert('Veuillez entrer une localisation valide.');
      return;
    }

    setLoading(true);
    setShowRecommendations(true);
    setProperties([]);

    // Timeout de 30 secondes
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setProperties([]);
      alert('Aucune maison trouvée. Veuillez réessayer avec des critères différents.');
    }, 30000);

    try {
      const response = await fetch(n8nWorkflowUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: location,
          userLocation: userLocation,
          minPrice: parseInt(minPrice),
          maxPrice: parseInt(maxPrice),
          minBeds: minBeds.replace('+', ''),
          minBaths: minBaths.replace('+', ''),
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }

      const data = await response.json();
      
      // Vérifier si des propriétés ont été trouvées
      if (!data.properties || data.properties.length === 0) {
        setLoading(false);
        setProperties([]);
        alert('Aucune maison trouvée. Veuillez réessayer avec des critères différents.');
        return;
      }
      
      // Transform the data from n8n workflow
      const transformedProperties: Property[] = data.properties.map((prop: any) => ({
        id: prop.id,
        images: prop.images || [],
        price: prop.price,
        beds: prop.beds,
        baths: prop.baths,
        sqft: prop.sqft,
        location: prop.location,
        status: prop.status || 'Available',
        tags: prop.tags || [],
        matchScore: prop.matchScore || Math.floor(Math.random() * 10) + 90
      }));

      setProperties(transformedProperties);
      setLoading(false);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error fetching properties:', error);
      setLoading(false);
      setProperties([]);
      alert("Connexion du serveur absente ou aucune maison trouvée");
    }
  };

  // Open property gallery
  const openGallery = (property: Property) => {
    if (property && property.images && property.images.length > 0) {
      setCurrentImageIndex(0);
      // Use setTimeout to ensure state is set after current render cycle
      setTimeout(() => {
        setSelectedProperty(property);
      }, 0);
    }
  };

  // Close gallery
  const closeGallery = () => {
    setSelectedProperty(null);
    setCurrentImageIndex(0);
  };

  // Navigate images
  const nextImage = () => {
    if (selectedProperty && selectedProperty.images && selectedProperty.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === selectedProperty.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProperty && selectedProperty.images && selectedProperty.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProperty.images.length - 1 : prev - 1
      );
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedProperty) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProperty]);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
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

          {/* Search Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Search className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Recherche Intelligente
          </h1>
          <p className="text-center text-gray-500 text-sm">
            Trouvez votre propriété idéale avec l'IA
          </p>
        </div>

        {/* Search Form */}
        <div className="px-4 py-6 space-y-4">
          {/* Location Input */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tapez un lieu (ex: Bastos, Yaoundé)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  geocodeLocation(location);
                }
              }}
              onBlur={handleLocationBlur}
              className="w-full pl-10 pr-24 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
              disabled={locationLoading}
            />
            <button
              onClick={getUserLocation}
              disabled={locationLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              title="Utiliser ma position GPS"
            >
              {locationLoading ? (
                <Loader className="w-4 h-4 text-purple-600 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4 text-purple-600" />
              )}
            </button>
            {userLocation && (
              <div className="absolute -bottom-5 left-0 text-xs text-green-600 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                Localisation détectée
              </div>
            )}
          </div>

          {/* Price Range in CFA */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="relative">
              <select
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-700"
              >
                <option value="">Prix Min</option>
                <option value="250000">250 000 FCFA</option>
                <option value="375000">375 000 FCFA</option>
                <option value="500000">500 000 FCFA</option>
                <option value="750000">750 000 FCFA</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-700"
              >
                <option value="">Prix Max</option>
                <option value="750000">750 000 FCFA</option>
                <option value="1000000">1 000 000 FCFA</option>
                <option value="1500000">1 500 000 FCFA</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Beds & Baths */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <select
                value={minBeds}
                onChange={(e) => setMinBeds(e.target.value)}
                className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-700"
              >
                <option>Chambres</option>
                <option>2+</option>
                <option>3+</option>
                <option>4+</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={minBaths}
                onChange={(e) => setMinBaths(e.target.value)}
                className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-700"
              >
                <option>Salles de bain</option>
                <option>2+</option>
                <option>3+</option>
                <option>4+</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={loading || locationLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            key="search-button"
          >
            <div className="flex items-center justify-center gap-2">
              {loading && (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Recherche en cours...</span>
                </>
              )}
              {!loading && (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Trouver avec l'IA</span>
                </>
              )}
            </div>
          </button>
        </div>

        {/* AI Recommendations - Below form */}
        {showRecommendations && (
          <div className="px-4 pb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Recommandations IA</h2>
                  <p className="text-xs text-gray-500">{properties.length} propriétés trouvées</p>
                </div>
              </div>
            </div>

            {/* Property Cards */}
            <div className="space-y-4">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all"
                >
                  {/* Property Image - Clickable */}
                  <div 
                    className="relative h-48 cursor-pointer group"
                    onClick={() => openGallery(property)}
                  >
                    <img
                      src={property.images[0]}
                      alt={property.location}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-3">
                        <Search className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full">
                      <span className={`text-xs font-semibold ${
                        property.status === 'Available' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {property.matchScore}% Compatible
                      </span>
                    </div>
                    {property.images.length > 1 && (
                      <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                        +{property.images.length - 1} photos
                      </div>
                    )}
                  </div>

                  {/* Property Details */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{formatCFA(property.price)}</h3>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        property.status === 'Available' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {property.status === 'Available' ? 'Disponible' : 'À proximité'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-gray-600 text-sm mb-3">
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span>{property.beds} ch</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        <span>{property.baths} sdb</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Home className="w-4 h-4" />
                        <span>{property.sqft} m²</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-3">{property.location}</p>

                    <div className="flex flex-wrap gap-2">
                      {property.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={`text-xs px-3 py-1 rounded-full ${
                            index === 0 
                              ? 'bg-blue-50 text-blue-700' 
                              : 'bg-orange-50 text-orange-700'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Gallery Modal - Rendered separately */}
      {selectedProperty && selectedProperty.images && selectedProperty.images.length > 0 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="relative w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 text-white">
              <div>
                <h3 className="font-bold text-lg">{selectedProperty.location}</h3>
                <p className="text-sm opacity-80">{formatCFA(selectedProperty.price)}</p>
              </div>
              <button
                onClick={closeGallery}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Image Display */}
            <div className="flex-1 flex items-center justify-center relative px-4">
              <button
                onClick={prevImage}
                className="absolute left-4 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors z-10"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              <img
                src={selectedProperty.images[currentImageIndex]}
                alt={`${selectedProperty.location} - Image ${currentImageIndex + 1}`}
                className="max-h-full max-w-full object-contain"
              />

              <button
                onClick={nextImage}
                className="absolute right-4 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors z-10"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Image Counter */}
            <div className="text-center text-white py-4">
              <p className="text-sm">
                {currentImageIndex + 1} / {selectedProperty.images.length}
              </p>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex gap-2 overflow-x-auto px-4 pb-4">
              {selectedProperty.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex 
                      ? 'border-purple-500 scale-110' 
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SmartPropertySearch;