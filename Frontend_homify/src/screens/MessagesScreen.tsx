import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, MessageSquare, Mail, MailOpen, Send } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { getInbox, getSent, markAsRead } from '@/services/messageService';
import { ApiMessage } from '@/types/api';

type Tab = 'inbox' | 'sent';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function MessageList({
  messages,
  tab,
  onOpen,
}: {
  messages: ApiMessage[];
  tab: Tab;
  onOpen: (msg: ApiMessage) => void;
}) {
  if (messages.length === 0) {
    return (
      <div className="text-center py-16 bg-homify-card rounded-modal border border-homify-border p-8">
        <MessageSquare className="w-12 h-12 text-homify-muted/40 mx-auto mb-4" />
        <p className="font-medium text-homify-text mb-2">Aucun message</p>
        <p className="text-sm text-homify-muted">
          {tab === 'inbox' ? 'Vos messages reçus apparaîtront ici.' : 'Vos messages envoyés apparaîtront ici.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      {messages.map((msg) => {
        const propertyTitle = msg.property_detail?.title ?? `Annonce #${msg.property}`;
        const contact =
          tab === 'inbox'
            ? msg.sender.full_name ?? `${msg.sender.first_name} ${msg.sender.last_name}`
            : msg.recipient.full_name ?? `${msg.recipient.first_name} ${msg.recipient.last_name}`;

        return (
          <button
            key={msg.id}
            type="button"
            onClick={() => onOpen(msg)}
            className={`w-full text-left bg-homify-card rounded-card border p-4 transition hover:border-homify-primary/30 hover:shadow-sm ${
              tab === 'inbox' && !msg.is_read
                ? 'border-homify-accent/40 bg-homify-accent/5'
                : 'border-homify-border'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full shrink-0 ${
                tab === 'inbox' && !msg.is_read ? 'bg-homify-accent/15' : 'bg-homify-surface'
              }`}>
                {tab === 'inbox' && !msg.is_read ? (
                  <Mail className="w-4 h-4 text-homify-accent" />
                ) : tab === 'sent' ? (
                  <Send className="w-4 h-4 text-homify-muted" />
                ) : (
                  <MailOpen className="w-4 h-4 text-homify-muted" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2 mb-0.5">
                  <p className="font-semibold text-homify-text truncate">{propertyTitle}</p>
                  <span className="text-[10px] text-homify-muted shrink-0">{formatDate(msg.sent_at)}</span>
                </div>
                <p className="text-xs text-homify-muted mb-1">
                  {tab === 'inbox' ? 'De' : 'À'} : {contact}
                </p>
                <p className="text-sm font-medium text-homify-text truncate">{msg.subject}</p>
                <p className="text-xs text-homify-muted truncate mt-0.5">{msg.content}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function MessagesScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('inbox');
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setMessages(tab === 'inbox' ? await getInbox() : await getSent());
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const openThread = async (msg: ApiMessage) => {
    if (tab === 'inbox' && !msg.is_read) {
      try {
        await markAsRead(msg.id);
      } catch {
        /* ignore */
      }
    }
    navigate(`/property/${msg.property}/chat`);
  };

  return (
    <div className="px-5 md:px-0 pt-2 pb-28">
      <PageHeader greeting="Messagerie" title="Messages" showNotifications={false} />

      <div className="flex gap-2 mb-6 max-w-2xl mx-auto">
        {(['inbox', 'sent'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-btn text-sm font-semibold transition ${
              tab === t
                ? 'bg-homify-primary text-white'
                : 'bg-homify-card border border-homify-border text-homify-muted'
            }`}
          >
            {t === 'inbox' ? 'Reçus' : 'Envoyés'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-homify-primary animate-spin" />
        </div>
      ) : (
        <MessageList messages={messages} tab={tab} onOpen={openThread} />
      )}
    </div>
  );
}
