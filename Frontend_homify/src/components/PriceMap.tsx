import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Hotel } from '../types';

const DEFAULT_CENTER: [number, number] = [3.848, 11.5021];

interface Props {
  properties: Hotel[];
  activeId: number | null;
  onMarkerClick: (id: number) => void;
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
    map.fitBounds(L.latLngBounds(positions), { padding: [48, 48] });
  }, [positions, map]);

  return null;
}

function createPriceIcon(priceLabel: string, isSelected: boolean) {
  const bgColor = isSelected ? '#1B4332' : '#FFFFFF';
  const textColor = isSelected ? '#FFFFFF' : '#1B4332';
  const borderColor = isSelected ? '#1B4332' : '#E07A5F';
  const scale = isSelected ? 'scale(1.12)' : 'scale(1)';

  return L.divIcon({
    className: 'custom-price-marker',
    iconSize: [72, 28],
    iconAnchor: [36, 14],
    html: `
      <div style="
        background-color: ${bgColor};
        border: 1.5px solid ${borderColor};
        color: ${textColor};
        font-weight: 700;
        font-size: 11px;
        padding: 4px 8px;
        border-radius: 20px;
        box-shadow: 0 3px 8px rgba(27, 67, 50, 0.25);
        text-align: center;
        white-space: nowrap;
        transition: all 0.2s ease;
        transform: ${scale};
        font-family: 'Plus Jakarta Sans', sans-serif;
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

export default function PriceMap({ properties, activeId, onMarkerClick }: Props) {
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
            <Popup closeButton={false}>
              <div className="font-semibold text-sm text-homify-text">{p.name}</div>
              <div className="text-xs text-homify-muted mt-0.5">{p.location}</div>
            </Popup>
          </Marker>
        );
      }),
    [mappable, activeId, onMarkerClick]
  );

  return (
    <div className="w-full h-full min-h-[280px] bg-homify-surface overflow-hidden md:rounded-card md:border md:border-homify-border">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds positions={positions} />
        {markers}
      </MapContainer>
    </div>
  );
}
