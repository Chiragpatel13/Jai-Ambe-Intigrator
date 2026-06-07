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
      className={`admin-sidebar w-[17.5rem] flex flex-col h-screen fixed left-0 top-0 z-30 transform transition-transform duration-300 ease-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(251,191,36,0.08),transparent_50%)]" />

      {/* Brand */}
      <div className="h-[4.5rem] flex items-center gap-3 px-5 border-b border-white/[0.06] relative z-10">
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden w-8 h-8 rounded-lg border border-white/10 bg-white/5 text-slate-300 flex items-center justify-center hover:bg-white/10"
          aria-label="Close sidebar"
        >
          <X size={14} />
        </button>
        <div className="h-11 w-11 rounded-xl bg-white/95 border border-amber-400/20 flex items-center justify-center shrink-0 shadow-lg shadow-black/20 p-1">
          <img src="/logo_jayambe.png" alt="JayAmbe" className="h-8 w-auto object-contain" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-lg leading-none text-white tracking-tight truncate">JayAmbe</p>
          <p className="text-[10px] text-amber-400/90 font-semibold mt-1 tracking-[0.12em] uppercase">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto relative z-10">
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.18em] px-3 mb-3">Menu</p>
        {menuItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onClose}
              className={`relative flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold rounded-xl transition-all duration-200 group ${
                active
                  ? 'admin-nav-active text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  active
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'text-slate-500 group-hover:text-amber-300/80 group-hover:bg-white/[0.05]'
                }`}
              >
                <Icon size={16} strokeWidth={active ? 2.25 : 2} />
              </span>
              <span className="tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/[0.06] space-y-2 relative z-10">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0 shadow-md">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{adminUser?.username || 'Admin'}</p>
            <p className="text-[10px] text-slate-500 font-medium">Administrator</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20 transition-all"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
