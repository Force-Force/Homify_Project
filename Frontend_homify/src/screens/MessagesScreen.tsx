import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, MessageSquare, Mail, MailOpen } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { getInbox, markAsRead } from '@/services/messageService';
import { ApiMessage } from '@/types/api';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MessagesScreen() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getInbox();
      setMessages(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openThread = async (msg: ApiMessage) => {
    if (!msg.is_read) {
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
      <PageHeader greeting="Messagerie" title="Messages reçus" showNotifications={false} />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-homify-primary animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16 bg-homify-card rounded-modal border border-homify-border p-8">
          <MessageSquare className="w-12 h-12 text-homify-muted/40 mx-auto mb-4" />
          <p className="font-medium text-homify-text mb-2">Aucun message</p>
          <p className="text-sm text-homify-muted">
            Les messages des locataires ou propriétaires apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-w-2xl mx-auto">
          {messages.map((msg) => {
            const propertyTitle = msg.property_detail?.title ?? `Annonce #${msg.property}`;
            const senderName =
              msg.sender.full_name ?? `${msg.sender.first_name} ${msg.sender.last_name}`;

            return (
              <button
                key={msg.id}
                type="button"
                onClick={() => openThread(msg)}
                className={`w-full text-left bg-homify-card rounded-card border p-4 transition hover:border-homify-primary/30 hover:shadow-sm ${
                  msg.is_read ? 'border-homify-border' : 'border-homify-accent/40 bg-homify-accent/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full shrink-0 ${msg.is_read ? 'bg-homify-surface' : 'bg-homify-accent/15'}`}>
                    {msg.is_read ? (
                      <MailOpen className="w-4 h-4 text-homify-muted" />
                    ) : (
                      <Mail className="w-4 h-4 text-homify-accent" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2 mb-0.5">
                      <p className="font-semibold text-homify-text truncate">{propertyTitle}</p>
                      <span className="text-[10px] text-homify-muted shrink-0">{formatDate(msg.sent_at)}</span>
                    </div>
                    <p className="text-xs text-homify-muted mb-1">De : {senderName}</p>
                    <p className="text-sm font-medium text-homify-text truncate">{msg.subject}</p>
                    <p className="text-xs text-homify-muted truncate mt-0.5">{msg.content}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
