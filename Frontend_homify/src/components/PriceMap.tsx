import { useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, Minus, Plus } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Hotel } from '../types';
import { cn } from '@/lib/utils';

const DEFAULT_CENTER: [number, number] = [3.848, 11.5021];

interface Props {
  properties: Hotel[];
  activeId: number | null;
  onMarkerClick: (id: number) => void;
  className?: string;
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) {
      map.setView(DEFAULT_CENTER, 13);
      return;
    }
    if (positions.length === 1) {
      map.setView(positions[0], 14);
      return;
    }
    map.fitBounds(L.latLngBounds(positions), { padding: [56, 56] });
  }, [positions, map]);

  return null;
}

function MapInstanceCapture({ onReady }: { onReady: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

function createPriceIcon(priceLabel: string, isSelected: boolean) {
  const bgColor = isSelected ? '#1B4332' : '#FFFFFF';
  const textColor = isSelected ? '#FFFFFF' : '#1B4332';
  const borderColor = isSelected ? '#1B4332' : '#E07A5F';
  const scale = isSelected ? 'scale(1.1)' : 'scale(1)';
  const shadow = isSelected
    ? '0 6px 16px rgba(27, 67, 50, 0.35)'
    : '0 3px 10px rgba(27, 67, 50, 0.18)';

  return L.divIcon({
    className: 'custom-price-marker',
    iconSize: [76, 30],
    iconAnchor: [38, 15],
    html: `
      <div style="
        background-color: ${bgColor};
        border: 2px solid ${borderColor};
        color: ${textColor};
        font-weight: 700;
        font-size: 11px;
        padding: 5px 10px;
        border-radius: 999px;
        box-shadow: ${shadow};
        text-align: center;
        white-space: nowrap;
        transition: all 0.2s ease;
        transform: ${scale};
        font-family: 'Plus Jakarta Sans', sans-serif;
        letter-spacing: -0.01em;
      ">
        ${priceLabel}
      </div>
    `,
  });
}

function formatPriceLabel(hotel: Hotel): string {
  if (hotel.displayPrice) {
    return hotel.displayPrice.replace(/\s*FCFA\s*/i, '').trim();
  }
  return `${hotel.price.toLocaleString('fr-FR')} F`;
}

export default function PriceMap({ properties, activeId, onMarkerClick, className }: Props) {
  const mapRef = useRef<L.Map | null>(null);

  const mappable = properties.filter(
    (p) => p.coordinates?.lat != null && p.coordinates?.lng != null
  );

  const positions = useMemo(
    () => mappable.map((p) => [p.coordinates!.lat, p.coordinates!.lng] as [number, number]),
    [mappable]
  );

  const markers = useMemo(
    () =>
      mappable.map((p) => {
        const { lat, lng } = p.coordinates!;
        const isSelected = activeId === p.id;

        return (
          <Marker
            key={p.id}
            position={[lat, lng]}
            icon={createPriceIcon(formatPriceLabel(p), isSelected)}
            eventHandlers={{ click: () => onMarkerClick(p.id) }}
            zIndexOffset={isSelected ? 1000 : 0}
          >
            <Popup closeButton={false} className="homify-map-popup">
              <div className="font-semibold text-sm text-homify-text leading-snug">{p.name}</div>
              <div className="flex items-center gap-1 text-xs text-homify-muted mt-1">
                <MapPin className="w-3 h-3 text-homify-accent shrink-0" />
                {p.location}
              </div>
              <div className="mt-2 text-xs font-bold text-homify-primary">
                {p.displayPrice || `${p.price.toLocaleString('fr-FR')} FCFA`}
                <span className="font-normal text-homify-muted"> /mois</span>
              </div>
            </Popup>
          </Marker>
        );
      }),
    [mappable, activeId, onMarkerClick]
  );

  return (
    <div
      className={cn(
        'flex flex-col h-full min-h-0 rounded-card border border-homify-border bg-homify-card shadow-card overflow-hidden',
        className
      )}
    >
      {/* En-tête */}
      <div className="flex-none flex items-center justify-between px-4 py-3 border-b border-homify-border bg-homify-surface/80">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-homify-primary/10">
            <MapPin className="h-4 w-4 text-homify-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-homify-text leading-none">Carte des annonces</p>
            <p className="text-[11px] text-homify-muted mt-0.5">
              {mappable.length} localisation{mappable.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-homify-muted bg-homify-card px-2.5 py-1 rounded-full border border-homify-border">
          Live
        </span>
      </div>

      {/* Carte */}
      <div className="relative flex-1 min-h-0 homify-map-container">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds positions={positions} />
          {markers}
          <MapInstanceCapture onReady={(map) => { mapRef.current = map; }} />
        </MapContainer>

        <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => mapRef.current?.zoomIn()}
            className="flex h-9 w-9 items-center justify-center rounded-btn bg-homify-card/95 backdrop-blur-sm border border-homify-border text-homify-primary shadow-card hover:bg-white hover:border-homify-primary/30 transition-colors"
            aria-label="Zoom avant"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => mapRef.current?.zoomOut()}
            className="flex h-9 w-9 items-center justify-center rounded-btn bg-homify-card/95 backdrop-blur-sm border border-homify-border text-homify-primary shadow-card hover:bg-white hover:border-homify-primary/30 transition-colors"
            aria-label="Zoom arrière"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
