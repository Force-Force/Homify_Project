import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, MessageSquare, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { getConversations, getUnreadCount, markThreadRead } from '@/services/messageService';
import { ConversationThread } from '@/types/api';
import { PropertyImage } from '@/components/PropertyImage';

function formatWhen(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function MessagesScreen() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [filtered, setFiltered] = useState<ConversationThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [totalUnread, setTotalUnread] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [conversations, unread] = await Promise.all([
        getConversations(),
        getUnreadCount(),
      ]);
      setThreads(conversations);
      setFiltered(conversations);
      setTotalUnread(unread);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setFiltered(threads);
      return;
    }
    setFiltered(
      threads.filter((t) => {
        const title = t.property_detail?.title?.toLowerCase() ?? '';
        const contact = (t.contact.full_name ?? `${t.contact.first_name} ${t.contact.last_name}`).toLowerCase();
        const preview = t.last_message.content.toLowerCase();
        return title.includes(q) || contact.includes(q) || preview.includes(q);
      }),
    );
  }, [query, threads]);

  const openThread = async (thread: ConversationThread) => {
    if (thread.unread_count > 0) {
      try {
        await markThreadRead(thread.property_id);
        setThreads((prev) =>
          prev.map((t) =>
            t.property_id === thread.property_id ? { ...t, unread_count: 0 } : t,
          ),
        );
        setTotalUnread((n) => Math.max(0, n - thread.unread_count));
      } catch {
        /* ignore */
      }
    }
    navigate(`/property/${thread.property_id}/chat`);
  };

  return (
    <div className="px-5 md:px-0 pt-2 pb-28 max-w-2xl mx-auto">
      <PageHeader
        greeting="Messagerie intégrée"
        title="Messages"
        subtitle={totalUnread > 0 ? `${totalUnread} non lu(s)` : 'Vos conversations par annonce'}
        showNotifications={false}
      />

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-homify-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une annonce ou un contact..."
          className="w-full pl-11 pr-4 py-3.5 bg-homify-card border border-homify-border rounded-btn text-sm text-homify-text outline-none focus:ring-2 focus:ring-homify-primary/20"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-homify-primary animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-homify-card rounded-modal border border-homify-border p-8">
          <MessageSquare className="w-12 h-12 text-homify-muted/40 mx-auto mb-4" />
          <p className="font-medium text-homify-text mb-2">
            {query ? 'Aucun résultat' : 'Aucune conversation'}
          </p>
          <p className="text-sm text-homify-muted mb-6">
            {query
              ? 'Essayez un autre mot-clé.'
              : 'Contactez un propriétaire depuis une annonce pour démarrer un échange.'}
          </p>
          {!query && (
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="text-sm font-semibold text-homify-primary hover:underline"
            >
              Parcourir les annonces
            </button>
          )}
        </div>
      ) : (
        <div className="bg-homify-card rounded-modal border border-homify-border shadow-card overflow-hidden divide-y divide-homify-border">
          {filtered.map((thread) => {
            const title = thread.property_detail?.title ?? `Annonce #${thread.property_id}`;
            const contact =
              thread.contact.full_name ?? `${thread.contact.first_name} ${thread.contact.last_name}`;
            const photoUrl =
              thread.property_detail?.primary_photo?.thumbnail_url
              ?? thread.property_detail?.primary_photo?.url;

            return (
              <button
                key={thread.property_id}
                type="button"
                onClick={() => openThread(thread)}
                className={`w-full text-left p-4 flex gap-3 hover:bg-homify-surface/80 transition ${
                  thread.unread_count > 0 ? 'bg-homify-accent/[0.04]' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-homify-surface border border-homify-border">
                  <PropertyImage src={photoUrl} alt={title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm truncate ${thread.unread_count > 0 ? 'font-bold text-homify-text' : 'font-semibold text-homify-text'}`}>
                      {title}
                    </p>
                    <span className="text-[10px] text-homify-muted shrink-0">
                      {formatWhen(thread.updated_at)}
                    </span>
                  </div>
                  <p className="text-xs text-homify-muted truncate">{contact}</p>
                  <p className={`text-xs mt-1 truncate ${thread.unread_count > 0 ? 'text-homify-text font-medium' : 'text-homify-muted'}`}>
                    {thread.last_message.content}
                  </p>
                </div>
                {thread.unread_count > 0 && (
                  <span className="shrink-0 min-w-[20px] h-5 px-1.5 bg-homify-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center self-center">
                    {thread.unread_count > 9 ? '9+' : thread.unread_count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
