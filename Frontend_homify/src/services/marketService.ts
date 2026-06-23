import { API_ROUTES } from '../api/routes';
import { ApiProperty, PaginatedResponse } from '../types/api';
import { apiFetch } from './apiClient';

export interface MarketStats {
  city: string;
  district: string | null;
  totalListings: number;
  avgRent: number;
  minRent: number;
  maxRent: number;
  avgSurface: number;
  furnishedCount: number;
  byType: Record<string, number>;
}

const TYPE_LABELS: Record<string, string> = {
  HOUSE: 'Maisons',
  APARTMENT: 'Appartements',
  STUDIO: 'Studios',
  ROOM: 'Chambres',
};

export { TYPE_LABELS };

export async function getMarketStats(city: string, district = ''): Promise<MarketStats> {
  const params = new URLSearchParams({ city, ordering: '-created_at' });
  if (district.trim()) params.set('district', district.trim());

  const listings: ApiProperty[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext && page <= 15) {
    const data = await apiFetch<PaginatedResponse>(
      `${API_ROUTES.properties.list}?${params.toString()}&page=${page}`,
    );
    listings.push(...data.results);
    hasNext = !!data.next;
    page += 1;
  }

  if (listings.length === 0) {
    return {
      city,
      district: district || null,
      totalListings: 0,
      avgRent: 0,
      minRent: 0,
      maxRent: 0,
      avgSurface: 0,
      furnishedCount: 0,
      byType: {},
    };
  }

  const rents = listings.map((p) => parseFloat(p.monthly_rent));
  const surfaces = listings.map((p) => p.surface);
  const byType: Record<string, number> = {};

  listings.forEach((p) => {
    byType[p.type] = (byType[p.type] ?? 0) + 1;
  });

  return {
    city,
    district: district || null,
    totalListings: listings.length,
    avgRent: Math.round(rents.reduce((a, b) => a + b, 0) / rents.length),
    minRent: Math.min(...rents),
    maxRent: Math.max(...rents),
    avgSurface: Math.round(surfaces.reduce((a, b) => a + b, 0) / surfaces.length),
    furnishedCount: listings.filter((p) => p.furnished).length,
    byType,
  };
}
