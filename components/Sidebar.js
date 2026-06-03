'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Laptop,
  FolderTree,
  MailWarning,
  Settings as SettingsIcon,
  LogOut,
  ArrowLeft,
  Image,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Laptop },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Inquiries', path: '/admin/inquiries', icon: MailWarning },
    { name: 'Gallery', path: '/admin/gallery', icon: Image },
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

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Sidebar Header */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Ambe Admin
        </span>
      </div>

      {/* Sidebar Menu Items */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-450 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-800 space-y-1.5">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Public Site</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
