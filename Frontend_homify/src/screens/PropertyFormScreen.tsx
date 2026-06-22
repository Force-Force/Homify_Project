import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import { getAmenities } from '@/services/amenityService';
import {
  createProperty,
  uploadPropertyPhotos,
  submitPropertyForReview,
  PropertyFormPayload,
} from '@/services/propertyService';
import { AmenityItem } from '@/types/api';
import { ApiError } from '@/services/apiClient';

const PROPERTY_TYPES = [
  { value: 'APARTMENT', label: 'Appartement' },
  { value: 'HOUSE', label: 'Maison' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'ROOM', label: 'Chambre' },
];

const inputClass =
  'w-full p-3 bg-homify-surface rounded-btn border border-homify-border outline-none focus:ring-2 focus:ring-homify-primary/20 text-sm';

export default function PropertyFormScreen() {
  const navigate = useNavigate();
  const [amenities, setAmenities] = useState<AmenityItem[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'APARTMENT',
    surface: '45',
    number_of_rooms: '2',
    number_of_bedrooms: '1',
    number_of_bathrooms: '1',
    furnished: true,
    monthly_rent: '350000',
    charges: '25000',
    charges_included: false,
    deposit: '700000',
    agency_fees: '0',
    street_address: '',
    city: 'Yaoundé',
    postal_code: '00237',
    district: '',
    amenity_ids: [] as number[],
  });

  useEffect(() => {
    getAmenities().then(setAmenities).catch(() => setAmenities([]));
  }, []);

  const toggleAmenity = (id: number) => {
    setForm((prev) => ({
      ...prev,
      amenity_ids: prev.amenity_ids.includes(id)
        ? prev.amenity_ids.filter((x) => x !== id)
        : [...prev.amenity_ids, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (photos.length < 3) {
      setError('Ajoutez au moins 3 photos (JPG/PNG, max 5 Mo chacune).');
      return;
    }
    if (form.description.length < 50) {
      setError('La description doit contenir au moins 50 caractères.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload: PropertyFormPayload = {
      title: form.title,
      description: form.description,
      type: form.type,
      surface: parseFloat(form.surface),
      number_of_rooms: parseInt(form.number_of_rooms, 10),
      number_of_bedrooms: parseInt(form.number_of_bedrooms, 10),
      number_of_bathrooms: parseInt(form.number_of_bathrooms, 10),
      furnished: form.furnished,
      monthly_rent: form.monthly_rent,
      charges: form.charges,
      charges_included: form.charges_included,
      deposit: form.deposit,
      agency_fees: form.agency_fees,
      address: {
        street_address: form.street_address,
        city: form.city,
        postal_code: form.postal_code,
        district: form.district,
      },
      amenity_ids: form.amenity_ids,
    };

    try {
      const { id } = await createProperty(payload);
      await uploadPropertyPhotos(id, photos);
      await submitPropertyForReview(id);
      navigate('/my-properties');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur lors de la création.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-5 md:px-0 pt-2 pb-28 max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-homify-muted hover:text-homify-primary mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <h1 className="text-2xl font-bold text-homify-text mb-6">Nouvelle annonce</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-btn text-sm border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 bg-homify-card p-6 rounded-modal border border-homify-border">
        <div>
          <label className="block text-sm font-semibold mb-1.5">Titre</label>
          <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Description</label>
          <textarea
            className={`${inputClass} min-h-[100px]`}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            minLength={50}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Type</label>
            <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Surface (m²)</label>
            <input type="number" className={inputClass} value={form.surface} onChange={(e) => setForm({ ...form, surface: e.target.value })} required />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(['number_of_rooms', 'number_of_bedrooms', 'number_of_bathrooms'] as const).map((key) => (
            <div key={key}>
              <label className="block text-xs font-semibold mb-1.5 capitalize">{key.replace(/_/g, ' ')}</label>
              <input type="number" min={0} className={inputClass} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Loyer mensuel (FCFA)</label>
            <input className={inputClass} value={form.monthly_rent} onChange={(e) => setForm({ ...form, monthly_rent: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Charges (FCFA)</label>
            <input className={inputClass} value={form.charges} onChange={(e) => setForm({ ...form, charges: e.target.value })} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.furnished} onChange={(e) => setForm({ ...form, furnished: e.target.checked })} />
          Meublé
        </label>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Adresse</label>
          <input className={`${inputClass} mb-2`} placeholder="Rue" value={form.street_address} onChange={(e) => setForm({ ...form, street_address: e.target.value })} required />
          <div className="grid grid-cols-2 gap-2">
            <input className={inputClass} placeholder="Quartier" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            <input className={inputClass} placeholder="Ville" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          </div>
        </div>

        {amenities.length > 0 && (
          <div>
            <label className="block text-sm font-semibold mb-2">Équipements</label>
            <div className="flex flex-wrap gap-2">
              {amenities.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleAmenity(a.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    form.amenity_ids.includes(a.id)
                      ? 'bg-homify-primary text-white border-homify-primary'
                      : 'bg-homify-surface text-homify-muted border-homify-border'
                  }`}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold mb-2">Photos (min. 3)</label>
          <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-homify-border rounded-card cursor-pointer hover:border-homify-primary/40 transition">
            <Upload className="w-5 h-5 text-homify-muted" />
            <span className="text-sm text-homify-muted">{photos.length} photo(s) sélectionnée(s)</span>
            <input
              type="file"
              accept="image/jpeg,image/png"
              multiple
              className="hidden"
              onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-homify-accent text-white font-bold py-3.5 rounded-btn flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Publier pour modération
        </button>
      </form>
    </div>
  );
}
