'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Laptop,
  FolderTree,
  MailWarning,
  Settings as SettingsIcon,
  BarChart3,
  LogOut,
  X,
} from 'lucide-react';

export default function Sidebar({ adminUser, isOpen = false, onClose = () => {} }) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Products', path: '/admin/products', icon: Laptop },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Inquiries', path: '/admin/inquiries', icon: MailWarning },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: SettingsIcon },
  ];

  const handleLogout = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      try {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          router.push('/admin/login');
          router.refresh();
        }
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
  };

  const isActive = (item) =>
    item.exact ? pathname === item.path : pathname.startsWith(item.path);

  const initials = adminUser?.username?.substring(0, 2).toUpperCase() || 'AD';

  return (
    <aside
      className={`w-72 flex flex-col h-screen fixed left-0 top-0 z-30 transform transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{
        background: 'linear-gradient(165deg, #050b1e 0%, #0b1738 38%, #111f49 100%)',
        borderRight: '1px solid rgba(125,211,252,0.18)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 15% 10%, rgba(34,211,238,0.14) 0%, transparent 38%), radial-gradient(circle at 85% 85%, rgba(59,130,246,0.15) 0%, transparent 44%)',
        }}
      />

      {/* Logo */}
      <div className="h-16 sm:h-20 flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 border-b border-cyan-900/30 relative z-10">
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden w-8 h-8 rounded-lg border border-cyan-800/60 bg-cyan-950/30 text-slate-300 flex items-center justify-center"
          aria-label="Close sidebar"
        >
          <X size={14} />
        </button>
        <div className="relative h-11 w-11 rounded-2xl bg-cyan-500/15 border border-cyan-300/30 flex items-center justify-center shrink-0 shadow-[0_0_18px_rgba(34,211,238,0.22)]">
          <img
            src="/logo_jayambe.png"
            alt="JayAmbe Integrators"
            className="h-8 w-auto object-contain shrink-0"
          />
        </div>
        <div className="min-w-0">
          <p className="font-black text-xl sm:text-[1.7rem] leading-none truncate text-white">JayAmbe</p>
          <p className="text-[11px] text-cyan-300/90 font-semibold mt-1 truncate tracking-wide">Integrators Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto relative z-10">
        <p className="text-[10px] font-extrabold text-cyan-300/55 uppercase tracking-[0.16em] px-3 mb-3">
          Navigation
        </p>
        {menuItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onClose}
              className={`relative flex items-center gap-3 px-3 py-3 text-sm font-bold rounded-2xl transition-all duration-200 group ${
                active
                  ? 'text-white'
                  : 'text-slate-200/75 hover:text-white hover:bg-white/6'
              }`}
              style={
                active
                  ? {
                      background:
                        'linear-gradient(90deg, rgba(34,211,238,0.3) 0%, rgba(37,99,235,0.26) 100%)',
                      boxShadow: 'inset 3px 0 0 #67e8f9, 0 8px 22px rgba(37,99,235,0.24)',
                    }
                  : {}
              }
            >
              <span
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  active
                    ? 'bg-white/15 border border-white/20'
                    : 'bg-transparent border border-white/10 group-hover:bg-white/10 group-hover:border-white/20'
                }`}
              >
                <Icon
                  size={16}
                  className={active ? 'text-cyan-200' : 'text-slate-400 group-hover:text-cyan-200 transition-colors'}
                />
              </span>
              <span>{item.name}</span>
              {active && (
                <span
                  className="ml-auto w-2 h-2 rounded-full bg-cyan-200"
                  style={{ boxShadow: '0 0 10px #67e8f9' }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer — user chip + logout only */}
      <div className="p-4 border-t border-cyan-900/30 space-y-2 relative z-10">
        <div className="flex items-center gap-2.5 px-3 py-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #2563eb)' }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">
              {adminUser?.username || 'Admin'}
            </p>
            <p className="text-[10px] text-slate-300/70 font-semibold">Administrator</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-rose-300/95 hover:bg-rose-900/35 hover:text-rose-200 rounded-xl border border-transparent hover:border-rose-400/20 transition-colors"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
