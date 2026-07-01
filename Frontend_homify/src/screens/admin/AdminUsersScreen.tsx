import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Users, Ban, UserCheck } from 'lucide-react';
import {
  getAdminUsers,
  suspendUser,
  activateUser,
  AdminUser,
} from '@/services/adminService';
import { ApiError } from '@/services/apiClient';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';

export default function AdminUsersScreen() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await getAdminUsers());
    } catch {
      setError(t('admin.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggleUser = async (u: AdminUser) => {
    setActionId(u.id);
    try {
      if (u.status === 'SUSPENDED' || !u.is_active) {
        await activateUser(u.id);
      } else {
        await suspendUser(u.id);
      }
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('admin.users.actionError'));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-homify-text">{t('admin.users.title')}</h1>
        <p className="text-sm text-homify-muted mt-1">{t('admin.users.subtitle')}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-btn text-sm border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-homify-primary animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <AdminEmptyState icon={Users} text={t('admin.users.empty')} />
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="bg-homify-card rounded-card border border-homify-border p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-homify-text truncate">{u.full_name || u.email}</p>
                <p className="text-xs text-homify-muted">{u.email} · {u.role}</p>
                <p className="text-xs text-homify-muted mt-0.5">
                  {u.status} · {u.properties_count ?? 0} {t('admin.users.listings')}
                </p>
              </div>
              {u.role !== 'ADMIN' && (
                <button
                  type="button"
                  disabled={actionId === u.id}
                  onClick={() => handleToggleUser(u)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-btn text-xs font-semibold disabled:opacity-50 ${
                    u.status === 'SUSPENDED' || !u.is_active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-600 border border-red-200'
                  }`}
                >
                  {u.status === 'SUSPENDED' || !u.is_active ? (
                    <><UserCheck className="w-3.5 h-3.5" /> {t('admin.users.activate')}</>
                  ) : (
                    <><Ban className="w-3.5 h-3.5" /> {t('admin.users.suspend')}</>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
