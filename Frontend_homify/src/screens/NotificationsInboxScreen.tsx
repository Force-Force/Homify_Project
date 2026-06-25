import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Loader2, CheckCheck, MessageSquare, Home, Shield, Info,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppNotification,
  getNotifications,
  getNotificationUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  notificationActionPath,
} from '@/services/notificationService';

const TYPE_ICONS: Record<string, typeof Bell> = {
  MESSAGE: MessageSquare,
  PROPERTY_APPROVED: Home,
  PROPERTY_REJECTED: Home,
  PROPERTY_PUBLISHED: Home,
  NEW_LISTING: Home,
  ACCOUNT: Shield,
  SYSTEM: Info,
};

function formatWhen(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'À l\'instant';
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH} h`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function NotificationsInboxScreen() {
  const navigate = useNavigate();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setItems(data.results);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleOpen = async (notification: AppNotification) => {
    if (!notification.is_read) {
      try {
        await markNotificationRead(notification.id);
        setItems((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)),
        );
      } catch {
        /* ignore */
      }
    }
    const path = notificationActionPath(notification);
    if (path) navigate(path);
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
      await getNotificationUnreadCount();
    } finally {
      setMarkingAll(false);
    }
  };

  const unread = items.filter((n) => !n.is_read).length;

  return (
    <div className="px-5 md:px-0 pt-2 pb-28 max-w-2xl mx-auto">
      <PageHeader greeting="Centre de notifications" title="Notifications" showNotifications={false} />

      {unread > 0 && (
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={markingAll}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-homify-primary hover:underline disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" />
            {markingAll ? '...' : 'Tout marquer comme lu'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-homify-primary animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-homify-card rounded-modal border border-homify-border p-8">
          <Bell className="w-10 h-10 text-homify-muted mx-auto mb-3 opacity-40" />
          <p className="font-semibold text-homify-text">Aucune notification</p>
          <p className="text-sm text-homify-muted mt-1">
            Messages, annonces et alertes apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="bg-homify-card rounded-modal border border-homify-border shadow-card overflow-hidden divide-y divide-homify-border">
          {items.map((notification) => {
            const Icon = TYPE_ICONS[notification.notification_type] ?? Bell;
            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleOpen(notification)}
                className={`w-full text-left p-4 flex gap-3 hover:bg-homify-surface/80 transition ${
                  !notification.is_read ? 'bg-homify-primary/[0.03]' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  notification.is_read ? 'bg-homify-surface' : 'bg-homify-primary/10'
                }`}>
                  <Icon className={`w-5 h-5 ${notification.is_read ? 'text-homify-muted' : 'text-homify-primary'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${notification.is_read ? 'text-homify-text' : 'text-homify-primary'}`}>
                      {notification.title}
                    </p>
                    {!notification.is_read && (
                      <span className="w-2 h-2 rounded-full bg-homify-accent shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-homify-muted mt-0.5 line-clamp-2">{notification.body}</p>
                  <p className="text-[10px] text-homify-muted mt-1.5">{formatWhen(notification.created_at)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
