import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Upload, X, MapPin } from 'lucide-react';
import { getAmenities } from '@/services/amenityService';
import {
  createProperty,
  updateProperty,
  uploadPropertyPhotos,
  submitPropertyForReview,
  getPropertyDetailRaw,
  deletePropertyPhoto,
  PropertyFormPayload,
} from '@/services/propertyService';
import { AmenityItem } from '@/types/api';
import { ApiError } from '@/services/apiClient';
import { PropertyImage } from '@/components/PropertyImage';
import { inputClassCompact, textareaClass, selectClass } from '@/lib/formStyles';

const PROPERTY_TYPES = [
  { value: 'APARTMENT', label: 'Appartement' },
  { value: 'HOUSE', label: 'Maison' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'ROOM', label: 'Chambre' },
];

export default function PropertyFormScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editId = id ? Number(id) : null;
  const isEdit = editId !== null && !Number.isNaN(editId);

  const [amenities, setAmenities] = useState<AmenityItem[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<{ id: number; url: string }[]>([]);
  const [status, setStatus] = useState<string>('DRAFT');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(isEdit);
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
    latitude: null as number | null,
    longitude: null as number | null,
    amenity_ids: [] as number[],
  });
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    getAmenities().then(setAmenities).catch(() => setAmenities([]));
  }, []);

  useEffect(() => {
    if (!isEdit || !editId) return;
    setInitialLoading(true);
    getPropertyDetailRaw(editId)
      .then((detail) => {
        if (!['DRAFT', 'REJECTED'].includes(detail.status)) {
          setError('Seules les annonces en brouillon ou rejetées peuvent être modifiées.');
          return;
        }
        setStatus(detail.status);
        setRejectionReason(detail.rejection_reason ?? null);
        setExistingPhotos(detail.photos.map((p) => ({ id: p.id, url: p.url })));
        setForm({
          title: detail.title,
          description: detail.description,
          type: detail.type,
          surface: String(detail.surface),
          number_of_rooms: String(detail.number_of_rooms),
          number_of_bedrooms: String(detail.number_of_bedrooms),
          number_of_bathrooms: String(detail.number_of_bathrooms),
          furnished: detail.furnished,
          monthly_rent: detail.monthly_rent,
          charges: detail.charges ?? '0',
          charges_included: detail.charges_included,
          deposit: detail.deposit ?? '0',
          agency_fees: detail.agency_fees ?? '0',
          street_address: detail.address.street_address,
          city: detail.address.city,
          postal_code: detail.address.postal_code,
          district: detail.address.district,
          latitude: detail.address.latitude ?? null,
          longitude: detail.address.longitude ?? null,
          amenity_ids: detail.amenities.map((a) => a.id),
        });
      })
      .catch(() => setError('Impossible de charger l\'annonce.'))
      .finally(() => setInitialLoading(false));
  }, [isEdit, editId]);

  const toggleAmenity = (amenityId: number) => {
    setForm((prev) => ({
      ...prev,
      amenity_ids: prev.amenity_ids.includes(amenityId)
        ? prev.amenity_ids.filter((x) => x !== amenityId)
        : [...prev.amenity_ids, amenityId],
    }));
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!editId || !window.confirm('Supprimer cette photo ?')) return;
    try {
      await deletePropertyPhoto(editId, photoId);
      setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Suppression impossible.');
    }
  };

  const handleUseLocation = () => {
    if (!('geolocation' in navigator)) {
      setError('Géolocalisation non supportée.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        setGeoLoading(false);
      },
      () => {
        setError('Impossible d\'obtenir votre position.');
        setGeoLoading(false);
      },
    );
  };

  const buildPayload = (): PropertyFormPayload => ({
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
      latitude: form.latitude,
      longitude: form.longitude,
    },
    amenity_ids: form.amenity_ids,
  });

  const handleSubmit = async (e: React.FormEvent, submitReview = false) => {
    e.preventDefault();
    const totalPhotos = existingPhotos.length + photos.length;
    if (totalPhotos < 3) {
      setError('Au moins 3 photos sont requises (existantes + nouvelles).');
      return;
    }
    if (form.description.length < 50) {
      setError('La description doit contenir au moins 50 caractères.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let propertyId = editId;
      if (isEdit && propertyId) {
        await updateProperty(propertyId, buildPayload());
        if (photos.length > 0) {
          await uploadPropertyPhotos(propertyId, photos);
        }
        if (submitReview) {
          await submitPropertyForReview(propertyId);
        }
      } else {
        const created = await createProperty(buildPayload());
        propertyId = created.id;
        await uploadPropertyPhotos(propertyId, photos);
        await submitPropertyForReview(propertyId);
      }
      navigate('/my-properties');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur lors de l\'enregistrement.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 text-homify-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 md:px-0 pt-2 pb-28 max-w-2xl mx-auto">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-homify-muted hover:text-homify-primary mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <h1 className="text-2xl font-bold text-homify-text mb-6">
        {isEdit ? 'Modifier l\'annonce' : 'Nouvelle annonce'}
      </h1>

      {rejectionReason && (
        <div className="mb-4 p-3 bg-amber-50 text-amber-800 rounded-btn text-sm border border-amber-200">
          <strong>Motif de rejet :</strong> {rejectionReason}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-btn text-sm border border-red-100">
          {error}
        </div>
      )}

      <form
        onSubmit={(e) => handleSubmit(e, !isEdit)}
        className="space-y-5 bg-homify-card p-6 rounded-modal border border-homify-border"
      >
        <div>
          <label className="block text-sm font-semibold mb-1.5">Titre</label>
          <input className={inputClassCompact} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Description</label>
          <textarea
            className={textareaClass}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            minLength={50}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Type</label>
            <select className={selectClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Surface (m²)</label>
            <input type="number" className={inputClassCompact} value={form.surface} onChange={(e) => setForm({ ...form, surface: e.target.value })} required />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(['number_of_rooms', 'number_of_bedrooms', 'number_of_bathrooms'] as const).map((key) => (
            <div key={key}>
              <label className="block text-xs font-semibold mb-1.5 capitalize">{key.replace(/_/g, ' ')}</label>
              <input type="number" min={0} className={inputClassCompact} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Loyer mensuel (FCFA)</label>
            <input className={inputClassCompact} value={form.monthly_rent} onChange={(e) => setForm({ ...form, monthly_rent: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Charges (FCFA)</label>
            <input className={inputClassCompact} value={form.charges} onChange={(e) => setForm({ ...form, charges: e.target.value })} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.furnished} onChange={(e) => setForm({ ...form, furnished: e.target.checked })} />
          Meublé
        </label>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Adresse</label>
          <input className={`${inputClassCompact} mb-2`} placeholder="Rue" value={form.street_address} onChange={(e) => setForm({ ...form, street_address: e.target.value })} required />
          <div className="grid grid-cols-2 gap-2">
            <input className={inputClassCompact} placeholder="Quartier" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            <input className={inputClassCompact} placeholder="Ville" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          </div>
          <button
            type="button"
            onClick={handleUseLocation}
            disabled={geoLoading}
            className="mt-2 flex items-center gap-2 text-sm font-medium text-homify-primary hover:underline disabled:opacity-50"
          >
            {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            {form.latitude != null
              ? `Position enregistrée (${form.latitude.toFixed(4)}, ${form.longitude?.toFixed(4)})`
              : 'Utiliser ma position GPS'}
          </button>
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
          <label className="block text-sm font-semibold mb-2">
            Photos ({existingPhotos.length + photos.length} au total, min. 3)
          </label>
          {existingPhotos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {existingPhotos.map((p) => (
                <div key={p.id} className="relative group">
                  <PropertyImage src={p.url} alt="" className="w-full h-20 object-cover rounded-btn" />
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(p.id)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                    aria-label="Supprimer la photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-homify-border rounded-card cursor-pointer hover:border-homify-primary/40 transition">
            <Upload className="w-5 h-5 text-homify-muted" />
            <span className="text-sm text-homify-muted">{photos.length} nouvelle(s) photo(s)</span>
            <input
              type="file"
              accept="image/jpeg,image/png"
              multiple
              className="hidden"
              onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
            />
          </label>
        </div>

        {isEdit ? (
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-homify-primary text-white font-bold py-3.5 rounded-btn flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Enregistrer
            </button>
            {(status === 'DRAFT' || status === 'REJECTED') && (
              <button
                type="button"
                disabled={loading}
                onClick={(e) => handleSubmit(e, true)}
                className="flex-1 bg-homify-accent text-white font-bold py-3.5 rounded-btn disabled:opacity-50"
              >
                Soumettre
              </button>
            )}
          </div>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-homify-accent text-white font-bold py-3.5 rounded-btn flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Publier pour modération
          </button>
        )}
      </form>
    </div>
  );
}
