// Fichier: src/components/PropertyMap.tsx
import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // IMPORTANT : Import du CSS de la carte
import { ExternalLink } from 'lucide-react';

interface MapProps {
  lat: number;
  lng: number;
  address: string;
}

export const PropertyMap = ({ lat, lng, address }: MapProps) => {
  // Fonction pour ouvrir Google Maps / Waze
  const openExternalMap = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 mt-6">
      <div className="h-[200px] w-full relative z-0"> {/* z-0 pour ne pas passer sur le modal */}
        <MapContainer 
          center={[lat, lng]} 
          zoom={15} 
          scrollWheelZoom={false} // On désactive le zoom molette pour ne pas gêner le scroll de la page
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <CircleMarker 
            center={[lat, lng]} 
            pathOptions={{ color: '#1e3a8a', fillColor: '#1e3a8a', fillOpacity: 0.8 }} 
            radius={10}
          >
            <Popup>{address}</Popup>
          </CircleMarker>
        </MapContainer>
        
        {/* Bouton flottant pour ouvrir Google Maps */}
        <button 
            onClick={openExternalMap}
            className="absolute bottom-3 right-3 z-[400] bg-white text-blue-900 text-xs font-bold py-2 px-3 rounded-lg shadow-md flex items-center gap-1 hover:bg-gray-50 transition"
        >
            <ExternalLink className="w-3 h-3" />
            Ouvrir GPS
        </button>
      </div>
    </div>
  );
};