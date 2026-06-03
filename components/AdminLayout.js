'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Loader from './Loader';

export default function AdminLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Session validation
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.status === 401) {
          router.push('/admin/login');
          return;
        }
        const data = await res.json();
        if (data.authenticated) {
          setAdminUser(data.user);
          setLoading(false);
        } else {
          router.push('/admin/login');
        }
      } catch (err) {
        console.error('Session check error:', err);
        router.push('/admin/login');
      }
    };

    checkSession();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader size="large" />
          <p className="text-sm font-semibold text-gray-500">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex text-gray-900">
      {/* Admin Sidebar */}
      <Sidebar />

      {/* Main Workspace */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-20">
          <h2 className="font-bold text-gray-800 text-base">Control Panel</h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              {adminUser?.username?.substring(0, 1).toUpperCase() || 'A'}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-gray-800">{adminUser?.username || 'Admin'}</p>
              <p className="text-[10px] text-gray-400 font-medium">Administrator</p>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-grow p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
