'use client';

import { usePathname } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

export default function AdminRootLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  // Do not wrap login screen in admin layout/sidebar framework
  if (isLoginPage) {
    return <div className="min-h-screen bg-gray-55">{children}</div>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
