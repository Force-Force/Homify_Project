// Fichier: src/components/PropertyImage.tsx
import React, { useState } from 'react';
import { ImageOff, Home } from 'lucide-react';

interface Props {
  src?: string | null;
  alt: string;
  className?: string;
}

export const PropertyImage = ({ src, alt, className = "" }: Props) => {
  const [hasError, setHasError] = useState(false);

  // Si pas d'URL ou si erreur de chargement
  if (!src || hasError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
        <div className="bg-white p-3 rounded-full mb-2 shadow-sm">
            {/* On affiche une petite maison pour rester dans le thème */}
            <Home className="w-6 h-6 text-gray-300" />
        </div>
        <span className="text-xs font-medium text-gray-400">Image indisponible</span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      onError={() => setHasError(true)} // Si le lien est cassé, on passe en mode erreur
    />
  );
};
