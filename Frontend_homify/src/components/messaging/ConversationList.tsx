import { Loader2, MessageSquare, Search, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
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

interface ConversationListProps {
  threads: ConversationThread[];
  filtered: ConversationThread[];
  loading: boolean;
  query: string;
  totalUnread: number;
  activePropertyId?: number | null;
  collapsed?: boolean;
  onQueryChange: (value: string) => void;
  onSelect: (thread: ConversationThread) => void;
  onBrowse?: () => void;
  onToggleCollapse?: () => void;
}

export function ConversationList({
  threads,
  filtered,
  loading,
  query,
  totalUnread,
  activePropertyId,
  collapsed = false,
  onQueryChange,
  onSelect,
  onBrowse,
  onToggleCollapse,
}: ConversationListProps) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className={`shrink-0 border-b border-homify-border bg-homify-card ${collapsed ? 'px-2 py-3' : 'px-5 py-4 md:px-4'}`}>
        {!collapsed && (
          <>
            <div className="md:hidden mb-3">
              <p className="text-homify-muted text-[10px] font-medium uppercase tracking-wider">Messagerie</p>
              <h1 className="text-xl font-bold text-homify-text">Messages</h1>
              <p className="text-xs text-homify-muted mt-0.5">
                {totalUnread > 0 ? `${totalUnread} non lu(s)` : 'Vos conversations par annonce'}
              </p>
            </div>
            <div className="hidden md:flex items-start justify-between gap-2 mb-3">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-homify-text">Messages</h2>
                <p className="text-xs text-homify-muted">
                  {totalUnread > 0 ? `${totalUnread} non lu(s)` : `${threads.length} conversation(s)`}
                </p>
              </div>
              {onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="p-2 rounded-btn border border-homify-border text-homify-muted hover:text-homify-primary hover:border-homify-primary/30 transition shrink-0"
                  aria-label="Réduire la liste"
                  title="Réduire la liste"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-homify-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-10 pr-3 py-2.5 bg-homify-surface border border-homify-border rounded-btn text-sm text-homify-text outline-none focus:ring-2 focus:ring-homify-primary/20"
              />
            </div>
          </>
        )}

        {collapsed && (
          <div className="hidden md:flex flex-col items-center gap-2">
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="p-2 rounded-btn border border-homify-border text-homify-muted hover:text-homify-primary hover:border-homify-primary/30 transition"
                aria-label="Agrandir la liste"
                title="Agrandir la liste"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}
            {totalUnread > 0 && (
              <span className="min-w-[22px] h-[22px] px-1 bg-homify-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 text-homify-primary animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          !collapsed && (
            <div className="text-center py-12 px-6 m-4 bg-homify-card rounded-modal border border-homify-border">
              <MessageSquare className="w-10 h-10 text-homify-muted/40 mx-auto mb-3" />
              <p className="font-medium text-homify-text mb-1">
                {query ? 'Aucun résultat' : 'Aucune conversation'}
              </p>
              <p className="text-sm text-homify-muted mb-4">
                {query
                  ? 'Essayez un autre mot-clé.'
                  : 'Contactez un propriétaire depuis une annonce.'}
              </p>
              {!query && onBrowse && (
                <button
                  type="button"
                  onClick={onBrowse}
                  className="text-sm font-semibold text-homify-primary hover:underline"
                >
                  Parcourir les annonces
                </button>
              )}
            </div>
          )
        ) : (
          <div className={collapsed ? 'flex flex-col items-center gap-1 py-2' : 'divide-y divide-homify-border'}>
            {filtered.map((thread) => {
              const title = thread.property_detail?.title ?? `Annonce #${thread.property_id}`;
              const contact =
                thread.contact.full_name ?? `${thread.contact.first_name} ${thread.contact.last_name}`;
              const photoUrl =
                thread.property_detail?.primary_photo?.thumbnail_url
                ?? thread.property_detail?.primary_photo?.url;
              const isActive = activePropertyId === thread.property_id;

              if (collapsed) {
                return (
                  <button
                    key={thread.property_id}
                    type="button"
                    onClick={() => onSelect(thread)}
                    title={`${title} — ${contact}`}
                    className={`relative p-1 rounded-xl transition ${
                      isActive ? 'ring-2 ring-homify-primary ring-offset-2 ring-offset-homify-surface' : 'hover:opacity-80'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-homify-surface border border-homify-border">
                      <PropertyImage src={photoUrl} alt={title} className="w-full h-full object-cover" />
                    </div>
                    {thread.unread_count > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-homify-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {thread.unread_count > 9 ? '9+' : thread.unread_count}
                      </span>
                    )}
                  </button>
                );
              }

              return (
                <button
                  key={thread.property_id}
                  type="button"
                  onClick={() => onSelect(thread)}
                  className={`w-full text-left p-4 flex gap-3 transition ${
                    isActive
                      ? 'bg-homify-primary/10 border-l-4 border-l-homify-primary'
                      : 'hover:bg-homify-surface/80 border-l-4 border-l-transparent'
                  } ${thread.unread_count > 0 && !isActive ? 'bg-homify-accent/[0.04]' : ''}`}
                >
                  <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-homify-surface border border-homify-border">
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
    </div>
  );
}
