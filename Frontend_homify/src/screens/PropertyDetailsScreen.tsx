import { useEffect, useState } from 'react';
import {
  ArrowLeft, Share2, Heart, MapPin, Bath, BedDouble, Maximize2,
  MessageCircle, MessageSquare, Loader2, Eye, Flag,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Hotel } from '../types';
import { PropertyImage } from '../components/PropertyImage';
import { PropertyMap } from '../components/PropertyMap';
import { RecommendedCard } from '../components/Cards';
import { getPropertyById, getSimilarProperties } from '../services/propertyService';
import { createReport, ReportReason } from '../services/reportService';
import { useFavorites } from '@/context/FavoritesContext';
import { ApiError } from '@/services/apiClient';

interface DetailsProps {
  propertyId: number;
  onBack: () => void;
  onOpenChat: () => void;
}

const TABS = ['À propos', 'Galerie', 'Équipements'] as const;

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'FRAUD', label: 'Fraude ou arnaque' },
  { value: 'INAPPROPRIATE', label: 'Contenu inapproprié' },
  { value: 'DUPLICATE', label: 'Annonce en doublon' },
  { value: 'OTHER', label: 'Autre' },
];

export default function PropertyDetailsScreen({ propertyId, onBack, onOpenChat }: DetailsProps) {
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [similar, setSimilar] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('À propos');
  const [showModal, setShowModal] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>('FRAUD');
  const [reportDescription, setReportDescription] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportMessage, setReportMessage] = useState<string | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getPropertyById(propertyId),
      getSimilarProperties(propertyId).catch(() => [] as Hotel[]),
    ])
      .then(([detail, similarList]) => {
        setHotel(detail);
        setSimilar(similarList);
        setError(null);
      })
      .catch(() => setError('Impossible de charger cette annonce.'))
      .finally(() => setLoading(false));
  }, [propertyId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-homify-primary animate-spin" />
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{error ?? 'Annonce introuvable.'}</p>
        <button onClick={onBack} className="text-homify-primary font-semibold hover:underline">
          Retour
        </button>
      </div>
    );
  }

  const favorited = isFavorite(hotel.id);
  const priceDisplay = hotel.displayPrice || `${hotel.price.toLocaleString('fr-FR')} FCFA`;
  const whatsappPhone = hotel.landlord?.phone?.replace(/\D/g, '');

  const handleWhatsApp = () => {
    if (!whatsappPhone) return;
    const message = `Bonjour, je suis intéressé(e) par : ${hotel.name}`;
    window.open(`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`, '_blank');
    setShowModal(false);
  };

  const handleInternalChat = () => {
    setShowModal(false);
    onOpenChat();
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/property/${hotel.id}`;
    if (navigator.share) {
      await navigator.share({ title: hotel.name, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert('Lien copié dans le presse-papier.');
    }
  };

  const handleReport = async () => {
    if (reportDescription.trim().length < 20) {
      setReportMessage('La description doit contenir au moins 20 caractères.');
      return;
    }
    setReportLoading(true);
    setReportMessage(null);
    try {
      await createReport({
        property: hotel.id,
        reason: reportReason,
        description: reportDescription.trim(),
      });
      setReportMessage('Signalement envoyé. Merci pour votre vigilance.');
      setTimeout(() => {
        setShowReport(false);
        setReportDescription('');
        setReportMessage(null);
      }, 2000);
    } catch (err) {
      setReportMessage(err instanceof ApiError ? err.message : 'Envoi impossible.');
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-homify-surface pb-24 md:pb-8">
      <div className="md:grid md:grid-cols-2 md:gap-8">
        <div className="relative h-[380px] md:h-[500px] md:rounded-modal overflow-hidden">
          <PropertyImage src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover" />

          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pt-10 md:pt-4 z-10">
            <button
              onClick={onBack}
              className="bg-homify-primary/70 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-homify-primary transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowReport(true)}
                className="bg-black/30 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-black/50 transition"
                aria-label="Signaler"
              >
                <Flag className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="bg-black/30 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-black/50 transition"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleFavorite(hotel.id)}
                className="bg-black/30 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-black/50 transition"
              >
                <Heart className={`w-4 h-4 ${favorited ? 'fill-homify-accent text-homify-accent' : ''}`} />
              </button>
            </div>
          </div>

          {hotel.type && (
            <span className="absolute bottom-4 left-4 bg-homify-primary/90 text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
              {hotel.type}
            </span>
          )}
        </div>

        <div className="px-5 pt-6 md:px-0 md:pt-0">
          <div className="flex justify-between items-start mb-1">
            <h1 className="text-2xl font-bold text-homify-text pr-4">{hotel.name}</h1>
            {hotel.viewCount !== undefined && (
              <div className="flex items-center gap-1 shrink-0 mt-1 text-homify-muted text-sm">
                <Eye className="w-4 h-4" />
                {hotel.viewCount}
              </div>
            )}
          </div>

          <p className="text-homify-muted text-sm mb-2 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-homify-accent shrink-0" />
            {hotel.location}
          </p>

          {hotel.landlord && (
            <p className="text-sm text-homify-muted mb-6">
              Propriétaire : <span className="font-medium text-homify-text">{hotel.landlord.name}</span>
              {hotel.landlord.maskedPhone && (
                <span className="ml-2">· {hotel.landlord.maskedPhone}</span>
              )}
            </p>
          )}

          <div className="flex border-b border-homify-border mb-6">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 pr-5 text-sm font-semibold transition-colors relative ${
                  activeTab === tab ? 'text-homify-primary' : 'text-homify-muted'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-homify-accent rounded-full" />
                )}
              </button>
            ))}
          </div>

          {activeTab === 'À propos' && (
            <>
              <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { icon: BedDouble, label: `${hotel.amenities?.beds ?? 0} ch.` },
                  { icon: Bath, label: `${hotel.amenities?.baths ?? 0} sdb` },
                  { icon: Maximize2, label: `${hotel.amenities?.sqft ?? '—'} m²` },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-2 min-w-[64px]">
                    <div className="p-3 bg-homify-surface rounded-btn text-homify-primary border border-homify-border">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-homify-muted">{label}</span>
                  </div>
                ))}
              </div>

              <h3 className="font-bold text-homify-text mb-2">Description</h3>
              <p className="text-homify-muted text-sm leading-relaxed mb-6">
                {hotel.description || 'Aucune description disponible.'}
              </p>

              {hotel.coordinates && (
                <div className="mb-8">
                  <h3 className="font-bold text-homify-text mb-3">Localisation</h3>
                  <PropertyMap lat={hotel.coordinates.lat} lng={hotel.coordinates.lng} address={hotel.location} />
                </div>
              )}
            </>
          )}

          {activeTab === 'Galerie' && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {(hotel.photos?.length ? hotel.photos : [{ id: 0, url: hotel.imageUrl }]).map((photo) => (
                <PropertyImage
                  key={photo.id}
                  src={photo.url}
                  alt={hotel.name}
                  className="w-full h-40 object-cover rounded-card"
                />
              ))}
            </div>
          )}

          {activeTab === 'Équipements' && (
            <div className="flex flex-wrap gap-2 mb-6">
              {hotel.amenities?.items?.length ? (
                hotel.amenities.items.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 bg-homify-surface border border-homify-border rounded-full text-sm text-homify-text"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <p className="text-sm text-homify-muted">Aucun équipement renseigné.</p>
              )}
            </div>
          )}

          <div className="hidden md:flex justify-between items-center pt-6 border-t border-homify-border">
            <div>
              <span className="text-sm text-homify-muted">Loyer mensuel</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-homify-primary">{priceDisplay}</span>
                <span className="text-sm text-homify-muted">/mois</span>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-homify-accent text-white px-8 py-3 rounded-btn font-bold hover:bg-homify-accent-hover transition shadow-sm"
            >
              Contacter
            </button>
          </div>

          {similar.length > 0 && (
            <div className="mt-8 pt-6 border-t border-homify-border">
              <h3 className="font-bold text-homify-text mb-4">Annonces similaires</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {similar.slice(0, 4).map((item) => (
                  <RecommendedCard
                    key={item.id}
                    hotel={{ ...item, isFavorite: isFavorite(item.id) }}
                    onClick={() => navigate(`/property/${item.id}`)}
                    isFavorite={isFavorite(item.id)}
                    onFavoriteToggle={() => toggleFavorite(item.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-homify-card border-t border-homify-border p-4 md:hidden z-20 flex justify-between items-center shadow-dock">
        <div>
          <span className="text-xs text-homify-muted block">Loyer mensuel</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-homify-primary">{priceDisplay}</span>
            <span className="text-xs text-homify-muted">/mois</span>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-homify-accent text-white px-6 py-3 rounded-btn font-bold shadow-sm hover:bg-homify-accent-hover transition"
        >
          Contacter
        </button>
      </div>

      {showReport && (
        <div className="fixed inset-0 z-modal flex items-end md:items-center justify-center bg-homify-text/40 backdrop-blur-sm">
          <div className="bg-homify-card w-full md:w-[440px] rounded-t-modal md:rounded-modal p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-homify-text mb-4">Signaler cette annonce</h3>
            {reportMessage && (
              <p className={`text-sm mb-3 ${reportMessage.includes('envoyé') ? 'text-emerald-600' : 'text-red-600'}`}>
                {reportMessage}
              </p>
            )}
            <select
              className="w-full p-3 mb-3 bg-homify-surface rounded-btn border border-homify-border text-sm"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value as ReportReason)}
            >
              {REPORT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <textarea
              className="w-full p-3 mb-4 bg-homify-surface rounded-btn border border-homify-border text-sm min-h-[100px]"
              placeholder="Décrivez le problème (min. 20 caractères)..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowReport(false)}
                className="flex-1 py-3 rounded-btn border border-homify-border text-homify-muted font-medium"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleReport}
                disabled={reportLoading}
                className="flex-1 py-3 rounded-btn bg-red-600 text-white font-semibold disabled:opacity-50"
              >
                {reportLoading ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-modal flex items-end md:items-center justify-center bg-homify-text/40 backdrop-blur-sm">
          <div className="bg-homify-card w-full md:w-[400px] rounded-t-modal md:rounded-modal p-6 shadow-2xl">
            <div className="w-10 h-1 bg-homify-border rounded-full mx-auto mb-5 md:hidden" />
            <h3 className="text-xl font-bold text-homify-text mb-1 text-center">Contacter le propriétaire</h3>
            <p className="text-homify-muted text-center mb-6 text-sm">Comment souhaitez-vous entrer en contact ?</p>

            <div className="space-y-3">
              {whatsappPhone && (
                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-green-50 text-green-700 rounded-btn font-semibold hover:bg-green-100 transition border border-green-200"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </button>
              )}
              <button
                onClick={handleInternalChat}
                className="w-full flex items-center justify-center gap-3 p-4 bg-homify-primary/10 text-homify-primary rounded-btn font-semibold hover:bg-homify-primary/20 transition border border-homify-primary/20"
              >
                <MessageSquare className="w-5 h-5" />
                Chat intégré
              </button>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-4 p-3 text-homify-muted font-medium hover:text-homify-text transition"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
