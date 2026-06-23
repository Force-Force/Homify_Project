import { useEffect, useState } from 'react';
import { ArrowLeft, Send, Loader2, Trash2 } from 'lucide-react';
import { getPropertyById } from '../services/propertyService';
import { getThread, sendMessage, markAsRead, deleteMessage } from '../services/messageService';
import { ApiMessage } from '../types/api';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/services/apiClient';

interface ChatProps {
  propertyId: number;
  onBack: () => void;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatScreen({ propertyId, onBack }: ChatProps) {
  const { user } = useAuth();
  const [propertyName, setPropertyName] = useState('');
  const [landlordName, setLandlordName] = useState('Propriétaire');
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [property, thread] = await Promise.all([
          getPropertyById(propertyId),
          getThread(propertyId),
        ]);
        setPropertyName(property.name);
        setLandlordName(property.landlord?.name ?? 'Propriétaire');
        setMessages(thread);
        thread
          .filter((m) => !m.is_read && m.recipient.id === user?.id)
          .forEach((m) => { markAsRead(m.id).catch(() => {}); });
      } catch {
        setError('Impossible de charger la conversation.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [propertyId, user?.id]);

  const handleDelete = async (messageId: number) => {
    if (!window.confirm('Supprimer ce message ?')) return;
    try {
      await deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Suppression impossible.');
    }
  };

  const handleSend = async () => {
    const content = inputText.trim();
    if (content.length < 20) {
      setError('Le message doit contenir au moins 20 caractères.');
      return;
    }

    setSending(true);
    setError(null);
    try {
      const msg = await sendMessage({
        property_id: propertyId,
        subject: messages.length ? `Re: ${propertyName}` : `Contact — ${propertyName}`,
        content,
      });
      setMessages((prev) => [...prev, msg]);
      setInputText('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Envoi impossible.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 text-homify-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-homify-surface md:ml-64">
      <div className="px-4 py-3 border-b border-homify-border flex items-center gap-3 bg-homify-card shadow-sm z-10">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-homify-surface rounded-full transition">
          <ArrowLeft className="w-5 h-5 text-homify-text" />
        </button>
        <div>
          <h2 className="font-bold text-homify-text text-sm">{landlordName}</h2>
          <p className="text-xs text-homify-muted truncate max-w-[240px]">{propertyName}</p>
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-3 p-3 bg-red-50 text-red-600 text-sm rounded-btn border border-red-100">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-homify-muted py-8">
            Démarrez la conversation avec le propriétaire.
          </p>
        )}
        {messages.map((msg) => {
          const isSender = msg.sender.id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isSender ? 'justify-end' : 'justify-start'} group`}>
              <div
                className={`relative max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                  isSender
                    ? 'bg-homify-primary text-white rounded-br-sm'
                    : 'bg-homify-card text-homify-text rounded-bl-sm border border-homify-border shadow-sm'
                }`}
              >
                <p>{msg.content}</p>
                <div className={`flex items-center justify-between gap-2 mt-1 ${isSender ? 'text-white/70' : 'text-homify-muted'}`}>
                  <p className="text-[10px]">{formatTime(msg.sent_at)}</p>
                  {isSender && (
                    <button
                      type="button"
                      onClick={() => handleDelete(msg.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-200 transition"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-homify-card border-t border-homify-border flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Écrivez votre message (min. 20 car.)..."
          className="flex-1 bg-homify-surface text-homify-text rounded-full px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-homify-primary/20 border border-homify-border"
          onKeyDown={(e) => e.key === 'Enter' && !sending && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={sending}
          className="bg-homify-accent text-white p-3 rounded-full hover:bg-homify-accent-hover transition shadow-sm disabled:opacity-50"
        >
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
