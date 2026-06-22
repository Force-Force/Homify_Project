import { API_ROUTES } from '../api/routes';
import { AmenityItem } from '../types/api';
import { apiFetch } from './apiClient';

export async function getAmenities(category?: string): Promise<AmenityItem[]> {
  const query = category ? `?category=${category}` : '';
  const data = await apiFetch<AmenityItem[] | { results: AmenityItem[] }>(
    `${API_ROUTES.amenities.list}${query}`,
  );
  return Array.isArray(data) ? data : data.results;
}
