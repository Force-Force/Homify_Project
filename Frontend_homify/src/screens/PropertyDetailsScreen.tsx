import { useState } from 'react';
import {
  ArrowLeft, Share2, Heart, Star, MapPin, Bath, BedDouble, Maximize2,
  MessageCircle, MessageSquare, Utensils,
} from 'lucide-react';
import { Hotel } from '../types';
import { PropertyImage } from '../components/PropertyImage';
import { PropertyMap } from '../components/PropertyMap';

interface DetailsProps {
  hotel: Hotel;
  onBack: () => void;
  onBookNow: () => void;
}

const TABS = ['À propos', 'Galerie', 'Avis'] as const;

export default function PropertyDetailsScreen({ hotel, onBack, onBookNow }: DetailsProps) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('À propos');
  const [showModal, setShowModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(hotel.isFavorite);

  const priceDisplay = hotel.displayPrice || `${hotel.price.toLocaleString()} FCFA`;

  const handleWhatsApp = () => {
    const phoneNumber = '237600000000';
    const message = `Bonjour, je suis intéressé(e) par : ${hotel.name}`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    setShowModal(false);
  };

  const handleInternalChat = () => {
    setShowModal(false);
    onBookNow();
  };

  return (
    <div className="min-h-screen bg-homify-surface pb-24 md:pb-8">
      <div className="md:max-w-6xl md:mx-auto md:p-6 md:grid md:grid-cols-2 md:gap-8">
        <div className="relative h-[380px] md:h-[500px] md:rounded-modal overflow-hidden">
          <PropertyImage src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover" />

          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pt-10 md:pt-4 z-10">
            <button
              onClick={onBack}
              className="bg-homify-primary/70 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-homify-primary transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              <button className="bg-black/30 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-black/50 transition">
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="bg-black/30 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-black/50 transition"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-homify-accent text-homify-accent' : ''}`} />
              </button>
            </div>
          </div>

          {hotel.type && (
            <span className="absolute bottom-4 left-4 bg-homify-primary/90 text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
              {hotel.type}
            </span>
          )}
        </div>

        <div className="px-5 pt-6 md:px-0 md:pt-0">
          <div className="flex justify-between items-start mb-1">
            <h1 className="text-2xl font-bold text-homify-text pr-4">{hotel.name}</h1>
            <div className="flex items-center gap-1 shrink-0 mt-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-medium text-homify-muted">{hotel.rating}</span>
            </div>
          </div>

          <p className="text-homify-muted text-sm mb-6 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-homify-accent shrink-0" />
            {hotel.location}
          </p>

          <div className="flex border-b border-homify-border mb-6">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 pr-5 text-sm font-semibold transition-colors relative ${
                  activeTab === tab ? 'text-homify-primary' : 'text-homify-muted'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-homify-accent rounded-full" />
                )}
              </button>
            ))}
          </div>

          {activeTab === 'À propos' && (
            <>
              <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { icon: BedDouble, label: `${hotel.amenities?.beds ?? 0} ch.` },
                  { icon: Bath, label: `${hotel.amenities?.baths ?? 1} sdb` },
                  { icon: Maximize2, label: `${hotel.amenities?.sqft ?? '—'} m²` },
                  { icon: Utensils, label: `${hotel.amenities?.kitchen ?? 1} cuisine` },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-2 min-w-[64px]">
                    <div className="p-3 bg-homify-surface rounded-btn text-homify-primary border border-homify-border">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-homify-muted">{label}</span>
                  </div>
                ))}
              </div>

              <h3 className="font-bold text-homify-text mb-2">Description</h3>
              <p className="text-homify-muted text-sm leading-relaxed mb-6">
                {hotel.description || 'Aucune description disponible.'}
              </p>

              {hotel.coordinates && (
                <div className="mb-8">
                  <h3 className="font-bold text-homify-text mb-3">Localisation</h3>
                  <PropertyMap lat={hotel.coordinates.lat} lng={hotel.coordinates.lng} address={hotel.location} />
                  <p className="text-xs text-homify-muted mt-2">
                    Le marqueur indique la zone approximative du bien.
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'Galerie' && (
            <div className="rounded-card overflow-hidden mb-6">
              <PropertyImage src={hotel.imageUrl} alt={hotel.name} className="w-full h-56 object-cover" />
              <p className="text-sm text-homify-muted p-4 bg-homify-card border border-t-0 border-homify-border rounded-b-card">
                Photo principale de l'annonce.
              </p>
            </div>
          )}

          {activeTab === 'Avis' && (
            <div className="bg-homify-card border border-homify-border rounded-card p-6 text-center mb-6">
              <Star className="w-8 h-8 text-amber-400 fill-amber-400 mx-auto mb-2" />
              <p className="font-bold text-homify-text text-lg">{hotel.rating} / 5</p>
              <p className="text-sm text-homify-muted mt-1">Avis à venir prochainement.</p>
            </div>
          )}

          <div className="hidden md:flex justify-between items-center pt-6 border-t border-homify-border">
            <div>
              <span className="text-sm text-homify-muted">Loyer mensuel</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-homify-primary">{priceDisplay}</span>
                <span className="text-sm text-homify-muted">/mois</span>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-homify-accent text-white px-8 py-3 rounded-btn font-bold hover:bg-homify-accent-hover transition shadow-sm"
            >
              Contacter
            </button>
          </div>
        </div>
      </div>

      {/* Barre mobile */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-homify-card border-t border-homify-border p-4 md:hidden z-20 flex justify-between items-center shadow-dock">
        <div>
          <span className="text-xs text-homify-muted block">Loyer mensuel</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-homify-primary">{priceDisplay}</span>
            <span className="text-xs text-homify-muted">/mois</span>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-homify-accent text-white px-6 py-3 rounded-btn font-bold shadow-sm hover:bg-homify-accent-hover transition"
        >
          Contacter
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-homify-text/40 backdrop-blur-sm">
          <div className="bg-homify-card w-full md:w-[400px] rounded-t-modal md:rounded-modal p-6 shadow-2xl">
            <div className="w-10 h-1 bg-homify-border rounded-full mx-auto mb-5 md:hidden" />
            <h3 className="text-xl font-bold text-homify-text mb-1 text-center">Contacter le propriétaire</h3>
            <p className="text-homify-muted text-center mb-6 text-sm">Comment souhaitez-vous entrer en contact ?</p>

            <div className="space-y-3">
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-3 p-4 bg-green-50 text-green-700 rounded-btn font-semibold hover:bg-green-100 transition border border-green-200"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </button>
              <button
                onClick={handleInternalChat}
                className="w-full flex items-center justify-center gap-3 p-4 bg-homify-primary/10 text-homify-primary rounded-btn font-semibold hover:bg-homify-primary/20 transition border border-homify-primary/20"
              >
                <MessageSquare className="w-5 h-5" />
                Chat intégré
              </button>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-4 p-3 text-homify-muted font-medium hover:text-homify-text transition"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
