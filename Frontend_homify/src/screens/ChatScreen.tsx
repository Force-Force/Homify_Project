import { useEffect, useState, useRef, useCallback } from 'react';
import { ArrowLeft, Send, Loader2, Trash2, ExternalLink, PanelLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPropertyById } from '../services/propertyService';
import { getThread, sendMessage, markThreadRead, deleteMessage } from '../services/messageService';
import { ApiMessage } from '../types/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/services/apiClient';
import { PropertyImage } from '@/components/PropertyImage';
import { useMessagesLayout } from '@/context/MessagesLayoutContext';

interface ChatProps {
  propertyId: number;
  onBack?: () => void;
  embedded?: boolean;
}

const POLL_MS = 12_000;
const MIN_CHARS = 20;

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function groupByDay(messages: ApiMessage[]) {
  const groups: { label: string; items: ApiMessage[] }[] = [];
  let currentLabel = '';

  for (const msg of messages) {
    const label = formatDateLabel(msg.sent_at);
    if (label !== currentLabel) {
      currentLabel = label;
      groups.push({ label, items: [msg] });
    } else {
      groups[groups.length - 1].items.push(msg);
    }
  }
  return groups;
}

export default function ChatScreen({ propertyId, onBack, embedded = false }: ChatProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const messagesLayout = useMessagesLayout();
  const [propertyName, setPropertyName] = useState('');
  const [propertyPhoto, setPropertyPhoto] = useState<string | null>(null);
  const [contactName, setContactName] = useState('');
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const resolveContact = useCallback((thread: ApiMessage[]) => {
    if (!user || thread.length === 0) return 'Conversation';
    const other = thread.find((m) => m.sender.id !== user.id);
    if (other) {
      const u = other.sender.id !== user.id ? other.sender : other.recipient;
      return u.full_name ?? `${u.first_name} ${u.last_name}`;
    }
    const last = thread[thread.length - 1];
    const u = last.sender.id === user.id ? last.recipient : last.sender;
    return u.full_name ?? `${u.first_name} ${u.last_name}`;
  }, [user]);

  const loadThread = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [property, thread] = await Promise.all([
        getPropertyById(propertyId),
        getThread(propertyId),
      ]);
      setPropertyName(property.name);
      setPropertyPhoto(property.imageUrl || null);
      setMessages(thread);
      setContactName(resolveContact(thread));
      await markThreadRead(propertyId).catch(() => {});
      if (!silent) setError(null);
    } catch {
      if (!silent) setError('Impossible de charger la conversation.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [propertyId, resolveContact]);

  useEffect(() => {
    loadThread();
  }, [loadThread]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const id = window.setInterval(() => loadThread(true), POLL_MS);
    return () => window.clearInterval(id);
  }, [loadThread]);

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
    if (content.length < MIN_CHARS) {
      setError(`Le message doit contenir au moins ${MIN_CHARS} caractères.`);
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
      if (msg?.sender?.id != null && msg.sent_at) {
        setMessages((prev) => [...prev, msg]);
      } else {
        await loadThread(true);
      }
      setInputText('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Envoi impossible.');
    } finally {
      setSending(false);
    }
  };

  const charCount = inputText.trim().length;
  const groups = groupByDay(messages);

  if (loading) {
    return (
      <div className={`flex justify-center items-center bg-homify-surface ${embedded ? 'h-full min-h-[280px]' : 'h-screen'}`}>
        <Loader2 className="w-8 h-8 text-homify-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-homify-surface ${embedded ? 'h-full min-h-0' : 'h-screen'}`}>
      <div className="px-4 py-3 border-b border-homify-border flex items-center gap-3 bg-homify-card shadow-sm z-10 shrink-0">
        {embedded && messagesLayout?.sidebarCollapsed && (
          <button
            type="button"
            onClick={messagesLayout.toggleSidebar}
            className="hidden md:flex p-2 -ml-1 hover:bg-homify-surface rounded-full transition text-homify-muted hover:text-homify-primary"
            aria-label="Afficher la liste des conversations"
            title="Afficher la liste"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        )}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className={`p-2 -ml-2 hover:bg-homify-surface rounded-full transition ${embedded ? 'md:hidden' : ''}`}
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5 text-homify-text" />
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate(`/property/${propertyId}`)}
          className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-homify-border"
        >
          <PropertyImage src={propertyPhoto} alt={propertyName} className="w-full h-full object-cover" />
        </button>
        <button type="button" onClick={() => navigate(`/property/${propertyId}`)} className="flex-1 min-w-0 text-left">
          <h2 className="font-bold text-homify-text text-sm truncate">{contactName}</h2>
          <p className="text-xs text-homify-muted truncate flex items-center gap-1">
            {propertyName}
            <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
          </p>
        </button>
      </div>

      {error && (
        <div className="mx-4 mt-3 p-3 bg-red-50 text-red-600 text-sm rounded-btn border border-red-100">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 px-4">
            <p className="text-sm text-homify-muted mb-4">
              Démarrez la conversation avec le propriétaire de cette annonce.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'Bonjour, cette annonce est-elle toujours disponible ?',
                'Bonjour, puis-je visiter le logement cette semaine ?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setInputText(suggestion)}
                  className="text-xs px-3 py-2 rounded-full border border-homify-border bg-homify-card text-homify-muted hover:border-homify-primary/30 hover:text-homify-primary transition"
                >
                  {suggestion.slice(0, 42)}…
                </button>
              ))}
            </div>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.label}>
            <p className="text-center text-[10px] uppercase tracking-wider text-homify-muted mb-3">
              {group.label}
            </p>
            <div className="space-y-3">
              {group.items.map((msg) => {
                if (!msg.sender?.id || !msg.sent_at) return null;
                const isSender = msg.sender.id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isSender ? 'justify-end' : 'justify-start'} group`}>
                    <div
                      className={`relative max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                        isSender
                          ? 'bg-homify-primary text-white rounded-br-sm'
                          : 'bg-homify-card text-homify-text rounded-bl-sm border border-homify-border shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
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
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 bg-homify-card border-t border-homify-border shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('messages.inputPlaceholder')}
            className="flex-1 homify-field-compact rounded-full px-4 py-3"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !sending) {
                e.preventDefault();
                void handleSend();
              }
            }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || charCount < MIN_CHARS}
            className="bg-homify-accent text-white p-3 rounded-full hover:bg-homify-accent-hover transition shadow-sm disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <p className={`text-[10px] mt-1.5 px-2 ${charCount >= MIN_CHARS ? 'text-homify-muted' : 'text-homify-accent'}`}>
          {t('messages.minChars', { count: charCount, min: MIN_CHARS })}
        </p>
      </div>
    </div>
  );
}
