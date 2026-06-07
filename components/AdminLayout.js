'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Loader from './Loader';
import { Bell, ChevronRight, Menu, Search, X } from 'lucide-react';

const ROUTE_LABELS = {
  '/admin': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/categories': 'Categories',
  '/admin/inquiries': 'Inquiries',
  '/admin/settings': 'Settings',
};

export default function AdminLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (res.status === 401) {
          // Full reload ensures the cleared cookie (set by auth/me) is flushed
          // before the proxy evaluates the next request.
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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)' }}
      >
        <div className="text-center space-y-4">
          <Loader size="large" />
          <p className="text-sm font-semibold text-slate-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Build breadcrumb
  const segments = pathname.split('/').filter(Boolean);
  const currentLabel = ROUTE_LABELS[pathname] || segments[segments.length - 1] || 'Dashboard';

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-gray-900 relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute top-20 right-0 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />
      </div>

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/45 backdrop-blur-[2px] z-20 lg:hidden"
        />
      )}

      <Sidebar
        adminUser={adminUser}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="min-h-screen flex flex-col lg:pl-72 relative z-10 w-full min-w-0">
        <header className="h-14 sm:h-16 bg-white/85 backdrop-blur border-b border-slate-200/80 flex items-center justify-between gap-2 px-3 sm:px-6 lg:px-8 sticky top-0 z-20 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="lg:hidden w-9 h-9 shrink-0 rounded-xl border border-slate-200 bg-white text-slate-600 flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <X size={17} /> : <Menu size={17} />}
            </button>

            <div className="flex items-center gap-1.5 text-xs sm:text-sm min-w-0">
              <span className="text-slate-400 font-medium hidden sm:inline shrink-0">Admin</span>
              <ChevronRight size={14} className="text-slate-300 hidden sm:inline shrink-0" />
              <span className="font-bold text-slate-800 truncate">{currentLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-2 h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-400 min-w-60">
              <Search size={14} />
              <span className="text-xs font-medium">Quick search...</span>
            </div>

            <button className="relative w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            </button>

            <div className="flex items-center gap-2 sm:gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white"
                style={{ background: 'linear-gradient(135deg, #0891b2, #2563eb)' }}
              >
                {adminUser?.username?.substring(0, 2).toUpperCase() || 'AD'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-none">
                  {adminUser?.username || 'Admin'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow p-3 sm:p-6 lg:p-8 w-full min-w-0">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
