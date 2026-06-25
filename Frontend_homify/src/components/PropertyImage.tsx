// Fichier: src/components/PropertyImage.tsx
import { useState } from 'react';
import { Home } from 'lucide-react';

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
      <div className={`flex flex-col items-center justify-center bg-homify-border/30 text-homify-muted ${className}`}>
        <div className="bg-homify-card p-3 rounded-full mb-2 shadow-sm">
            <Home className="w-6 h-6 text-homify-muted/60" />
        </div>
        <span className="text-xs font-medium text-homify-muted">Image indisponible</span>
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
