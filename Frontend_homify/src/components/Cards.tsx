import React from 'react';
import { Heart, Star, MapPin, Bath, BedDouble, Maximize2, BadgeCheck } from 'lucide-react';
import { Hotel } from '../types';
import { PropertyImage } from './PropertyImage';
import SpotlightCard from '@/components/ui/SpotlightCard/SpotlightCard';

interface CardProps {
  hotel: Hotel;
  onClick: () => void;
}

interface RecommendedCardProps extends CardProps {
  isFavorite?: boolean;
  onFavoriteToggle?: (e: React.MouseEvent) => void;
}

export const RecommendedCard = ({
  hotel,
  onClick,
  isFavorite = false,
  onFavoriteToggle,
}: RecommendedCardProps) => (
  <SpotlightCard
    onClick={onClick}
    className="w-full p-0 group"
    spotlightColor="rgba(224, 122, 95, 0.12)"
  >
    <div className="relative mb-0 overflow-hidden h-44">
      <PropertyImage
        src={hotel.imageUrl}
        alt={hotel.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onFavoriteToggle?.(e);
        }}
        className="absolute top-2.5 right-2.5 bg-homify-card/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm hover:text-homify-accent transition-colors z-10"
        aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <Heart
          className={`w-4 h-4 ${isFavorite ? 'fill-homify-accent text-homify-accent' : 'text-homify-muted'}`}
        />
      </button>
      {hotel.type && (
        <span className="absolute top-2.5 left-2.5 bg-homify-primary/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full z-10">
          {hotel.type}
        </span>
      )}
      {hotel.isBoosted && (
        <span className="absolute top-2.5 right-12 bg-homify-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm">
          Boost
        </span>
      )}
      {hotel.landlordVerified && (
        <span className="absolute bottom-2.5 left-2.5 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 inline-flex items-center gap-1">
          <BadgeCheck className="w-3 h-3" /> Vérifié
        </span>
      )}
    </div>

    <div className="p-3.5">
      <div className="flex justify-between items-start mb-1.5 gap-2">
        <h3 className="font-semibold text-homify-text text-[15px] leading-snug truncate">{hotel.name}</h3>
        {hotel.rating > 0 && (
          <div className="flex items-center gap-0.5 shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-homify-muted">{hotel.rating}</span>
          </div>
        )}
      </div>
      <div className="flex items-center text-homify-muted text-xs mb-2.5">
        <MapPin className="w-3 h-3 mr-1 shrink-0 text-homify-accent" />
        <span className="truncate">{hotel.location}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-bold text-homify-primary text-lg">
          {hotel.displayPrice || `${hotel.price} FCFA`}
        </span>
        <span className="text-[11px] text-homify-muted">/mois</span>
      </div>
    </div>
  </SpotlightCard>
);

interface FavoriteCardProps extends CardProps {
  onRemove?: () => void;
}

export const FavoriteCard = ({ hotel, onClick, onRemove }: FavoriteCardProps) => (
  <SpotlightCard
    onClick={onClick}
    className="mb-6 p-0 group"
    spotlightColor="rgba(224, 122, 95, 0.1)"
  >
    <div className="relative h-56 overflow-hidden">
      <PropertyImage
        src={hotel.imageUrl}
        alt={hotel.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove?.();
        }}
        className="absolute top-4 right-4 bg-homify-card/30 backdrop-blur-sm p-2 rounded-full z-10 hover:bg-homify-card/50 transition"
        aria-label="Retirer des favoris"
      >
        <Heart className="w-5 h-5 text-homify-accent fill-homify-accent" />
      </button>
      <div className="absolute bottom-4 left-4 bg-homify-primary/85 backdrop-blur-md px-3 py-1.5 rounded-btn z-10">
        <span className="text-white font-bold text-sm">
          {hotel.displayPrice || `${hotel.price} FCFA`}
        </span>
        <span className="text-white/70 text-[10px] ml-1">/mois</span>
      </div>
    </div>

    <div className="p-4">
      <h3 className="text-lg font-bold text-homify-text mb-1">{hotel.name}</h3>
      <p className="text-homify-muted text-sm mb-3 flex items-center gap-1">
        <MapPin className="w-3.5 h-3.5 text-homify-accent" /> {hotel.location}
      </p>
      <div className="flex gap-5 text-homify-muted text-xs font-medium">
        <span className="flex items-center gap-1.5">
          <BedDouble className="w-4 h-4 text-homify-primary/50" /> {hotel.amenities?.beds ?? 0} ch.
        </span>
        <span className="flex items-center gap-1.5">
          <Bath className="w-4 h-4 text-homify-primary/50" /> {hotel.amenities?.baths ?? 1} sdb
        </span>
        {hotel.amenities?.sqft && (
          <span className="flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-homify-primary/50" /> {hotel.amenities.sqft} m²
          </span>
        )}
      </div>
    </div>
  </SpotlightCard>
);
