import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  Flag,
  Users,
  Receipt,
  ArrowLeft,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { to: '/admin', labelKey: 'admin.nav.dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/properties', labelKey: 'admin.nav.properties', icon: Building2 },
  { to: '/admin/kyc', labelKey: 'admin.nav.kyc', icon: ShieldCheck },
  { to: '/admin/reports', labelKey: 'admin.nav.reports', icon: Flag },
  { to: '/admin/users', labelKey: 'admin.nav.users', icon: Users },
  { to: '/admin/billing', labelKey: 'admin.nav.billing', icon: Receipt },
] as const;

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <>
      <div className="px-4 py-6 border-b border-homify-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-homify-primary/10">
            <Shield className="w-5 h-5 text-homify-primary" />
          </div>
          <div>
            <p className="font-bold text-homify-text leading-tight">Homify Admin</p>
            <p className="text-[11px] text-homify-muted truncate max-w-[160px]">{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, labelKey, icon: Icon, ...rest }) => (
          <NavLink
            key={to}
            to={to}
            end={'end' in rest ? rest.end : false}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium transition',
                isActive
                  ? 'bg-homify-primary text-white shadow-sm'
                  : 'text-homify-muted hover:bg-homify-surface hover:text-homify-text',
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {t(labelKey)}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-homify-border">
        <Link
          to="/home"
          onClick={onNavigate}
          className="flex items-center gap-2 px-3 py-2.5 rounded-btn text-sm font-medium text-homify-muted hover:bg-homify-surface hover:text-homify-primary transition"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('admin.backToApp')}
        </Link>
      </div>
    </>
  );
}

export default function AdminLayout() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-homify-surface flex">
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:border-homify-border lg:bg-homify-card">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            className="absolute inset-0 bg-homify-text/40"
            onClick={() => setMobileOpen(false)}
            aria-label={t('admin.closeMenu')}
          />
          <aside className="relative w-72 max-w-[85vw] h-full bg-homify-card flex flex-col shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-btn text-homify-muted hover:bg-homify-surface"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b border-homify-border bg-homify-card/95 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-btn text-homify-muted hover:bg-homify-surface"
            aria-label={t('admin.openMenu')}
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-homify-text">Homify Admin</span>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
