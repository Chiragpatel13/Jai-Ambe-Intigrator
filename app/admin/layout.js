'use client';

import { usePathname } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

export default function AdminRootLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  // Do not wrap login screen in admin layout/sidebar framework
  if (isLoginPage) {
    return (
      <div
        className="min-h-screen"
        style={{ background: 'radial-gradient(circle at top left, #dbeafe 0%, #f8fafc 45%, #eef2ff 100%)' }}
      >
        {children}
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
