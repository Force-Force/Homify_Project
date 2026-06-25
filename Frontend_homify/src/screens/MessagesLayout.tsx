import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Outlet } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConversationList } from '@/components/messaging/ConversationList';
import { MessagesLayoutContext } from '@/context/MessagesLayoutContext';
import { getConversations, getUnreadCount, markThreadRead } from '@/services/messageService';
import { ConversationThread } from '@/types/api';

const XL_BREAKPOINT = 1280;

export default function MessagesLayout() {
  const navigate = useNavigate();
  const { propertyId: propertyIdParam } = useParams();
  const activePropertyId = propertyIdParam ? Number(propertyIdParam) : null;

  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [filtered, setFiltered] = useState<ConversationThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [totalUnread, setTotalUnread] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  useEffect(() => {
    const syncSidebar = () => {
      if (typeof window === 'undefined') return;
      const isDesktop = window.innerWidth >= 768;
      const isWide = window.innerWidth >= XL_BREAKPOINT;
      if (!isDesktop) {
        setSidebarCollapsed(false);
        return;
      }
      if (activePropertyId && !isWide) {
        setSidebarCollapsed(true);
      } else if (!activePropertyId) {
        setSidebarCollapsed(false);
      }
    };

    syncSidebar();
    window.addEventListener('resize', syncSidebar);
    return () => window.removeEventListener('resize', syncSidebar);
  }, [activePropertyId]);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

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
    navigate(`/messages/${thread.property_id}`);
  };

  const showMobileChat = Boolean(activePropertyId);

  return (
    <MessagesLayoutContext.Provider
      value={{
        sidebarCollapsed,
        toggleSidebar,
        setSidebarCollapsed,
        refreshConversations: load,
      }}
    >
      <div className="flex flex-col md:flex-row h-full min-h-0 md:h-screen">
        <aside
          className={cn(
            'flex-col shrink-0 min-h-0 md:border-r border-homify-border bg-homify-card md:bg-homify-surface transition-[width] duration-300 ease-out overflow-hidden',
            showMobileChat ? 'hidden md:flex' : 'flex',
            'w-full',
            sidebarCollapsed ? 'md:w-[76px]' : 'md:w-[320px] xl:w-[380px]',
          )}
        >
          <ConversationList
            threads={threads}
            filtered={filtered}
            loading={loading}
            query={query}
            totalUnread={totalUnread}
            activePropertyId={activePropertyId}
            collapsed={sidebarCollapsed}
            onQueryChange={setQuery}
            onSelect={openThread}
            onBrowse={() => navigate('/home')}
            onToggleCollapse={toggleSidebar}
          />
        </aside>

        <section
          className={cn(
            'flex-1 flex-col min-w-0 min-h-0 bg-homify-surface',
            showMobileChat ? 'flex' : 'hidden md:flex',
          )}
        >
          {activePropertyId ? (
            <Outlet />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-homify-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-homify-primary" />
              </div>
              <h2 className="text-lg font-bold text-homify-text mb-2">Sélectionnez une conversation</h2>
              <p className="text-sm text-homify-muted max-w-sm">
                Choisissez un fil dans la liste pour afficher les messages, ou contactez un propriétaire depuis une annonce.
              </p>
            </div>
          )}
        </section>
      </div>
    </MessagesLayoutContext.Provider>
  );
}
