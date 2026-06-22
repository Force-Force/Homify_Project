import React, { useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ExternalLink, MapPin, Minus, Plus } from 'lucide-react';

interface MapProps {
  lat: number;
  lng: number;
  address: string;
}

function MapInstanceCapture({ onReady }: { onReady: (map: L.Map) => void }) {
  const map = useMap();
  React.useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

export const PropertyMap = ({ lat, lng, address }: MapProps) => {
  const mapRef = useRef<L.Map | null>(null);

  const openExternalMap = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="mt-6 rounded-card border border-homify-border bg-homify-card shadow-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-homify-border bg-homify-surface/80">
        <div className="flex h-7 w-7 items-center justify-center rounded-btn bg-homify-primary/10">
          <MapPin className="h-3.5 w-3.5 text-homify-primary" />
        </div>
        <p className="text-sm font-semibold text-homify-text">Localisation</p>
      </div>

      <div className="h-[220px] w-full relative homify-map-container">
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          scrollWheelZoom={false}
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <CircleMarker
            center={[lat, lng]}
            pathOptions={{ color: '#1B4332', fillColor: '#E07A5F', fillOpacity: 0.9, weight: 2 }}
            radius={10}
          >
            <Popup closeButton={false}>{address}</Popup>
          </CircleMarker>
          <MapInstanceCapture onReady={(map) => { mapRef.current = map; }} />
        </MapContainer>

        <div className="absolute bottom-3 right-3 z-[400] flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => mapRef.current?.zoomIn()}
            className="flex h-8 w-8 items-center justify-center rounded-btn bg-homify-card/95 backdrop-blur-sm border border-homify-border text-homify-primary shadow-card hover:bg-white transition-colors"
            aria-label="Zoom avant"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => mapRef.current?.zoomOut()}
            className="flex h-8 w-8 items-center justify-center rounded-btn bg-homify-card/95 backdrop-blur-sm border border-homify-border text-homify-primary shadow-card hover:bg-white transition-colors"
            aria-label="Zoom arrière"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          onClick={openExternalMap}
          className="absolute bottom-3 left-3 z-[400] bg-homify-card/95 backdrop-blur-sm text-homify-primary text-xs font-bold py-2 px-3 rounded-btn shadow-card border border-homify-border flex items-center gap-1.5 hover:bg-white transition"
        >
          <ExternalLink className="w-3 h-3" />
          Ouvrir GPS
        </button>
      </div>
    </div>
  );
};
