'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Loader from './Loader';
import { Bell, ChevronRight, Menu, Search, X } from 'lucide-react';

const ROUTE_LABELS = {
  '/admin': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/categories': 'Categories',
  '/admin/inquiries': 'Inquiries',
  '/admin/analytics': 'Analytics',
  '/admin/settings': 'Settings',
};

export default function AdminLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (res.status === 401) {
          window.location.replace('/admin/login');
          return;
        }
        const data = await res.json();
        if (data.authenticated) {
          setAdminUser(data.user);
          setLoading(false);
        } else {
          window.location.replace('/admin/login');
        }
      } catch (err) {
        console.error('Session check error:', err);
        window.location.replace('/admin/login');
      }
    };
    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center admin-shell">
        <div className="text-center space-y-3">
          <Loader size="large" />
          <p className="text-sm font-medium text-slate-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const currentLabel = ROUTE_LABELS[pathname] || 'Dashboard';

  return (
    <div className="min-h-screen admin-shell text-slate-900 relative overflow-x-hidden">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-20 lg:hidden"
        />
      )}

      <Sidebar
        adminUser={adminUser}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="min-h-screen flex flex-col lg:pl-[17.5rem] relative z-10 w-full min-w-0">
        <header className="admin-header h-[3.75rem] sm:h-16 flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="lg:hidden w-9 h-9 shrink-0 rounded-xl border border-slate-200/90 bg-white text-slate-600 flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <X size={17} /> : <Menu size={17} />}
            </button>

            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-slate-400 font-medium shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Admin
              </span>
              <ChevronRight size={14} className="text-slate-300 hidden sm:inline shrink-0" />
              <span className="font-semibold text-slate-800 truncate tracking-tight">{currentLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-2.5 h-10 px-4 rounded-xl border border-slate-200/90 bg-white/80 text-slate-400 min-w-56 shadow-sm">
              <Search size={14} className="text-slate-400" />
              <span className="text-xs font-medium">Search admin…</span>
            </div>

            <button
              type="button"
              className="relative w-9 h-9 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors shadow-sm"
            >
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-500 ring-2 ring-white" />
            </button>

            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200/90">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold text-white bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700/50 shadow-sm">
                {adminUser?.username?.substring(0, 2).toUpperCase() || 'AD'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-slate-800 leading-none tracking-tight">
                  {adminUser?.username || 'Admin'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Store Manager</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow px-4 sm:px-6 lg:px-8 py-5 sm:py-7 w-full min-w-0">
          <div className="max-w-[88rem] mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
