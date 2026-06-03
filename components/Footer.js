'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Mail, MapPin, Clock, ExternalLink } from 'lucide-react';

export default function Footer() {
  const [settings, setSettings] = useState({
    shopName: 'Jai Ambe Intigrator',
    phone: '+91 98902 54321',
    whatsapp: '919890254321',
    address: 'Shop No. 12, Ostwal Empire, Near Boisar Railway Station, Boisar East, Palghar, Maharashtra - 401501',
    workingHours: 'Monday - Saturday: 10:00 AM - 8:30 PM, Sunday: Closed',
  });
  const pathname = usePathname();

  // Hide footer on admin dashboard paths
  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch((err) => console.error('Error fetching settings in footer:', err));
  }, []);

  if (isAdmin) return null;

  return (
    <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              {settings.shopName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              Trusted New & Refurbished Products at Best Prices. We specialize in Laptops, CCTV Systems, Printers, Networking Setup, and Custom Desktop PC Integration.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                Boisar, Palghar, MH
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li className="pt-2 border-t border-gray-100 dark:border-gray-900">
                <Link href="/admin" className="text-xs text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors">
                  Admin Panel <ExternalLink size={10} />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Store Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex gap-2 text-sm text-gray-500 dark:text-gray-400">
                <MapPin size={18} className="flex-shrink-0 text-blue-500" />
                <span className="line-clamp-3">{settings.address}</span>
              </li>
              {settings.phone && (
                <li className="flex gap-2 items-center text-sm text-gray-500 dark:text-gray-400">
                  <Phone size={16} className="text-blue-500" />
                  <a href={`tel:${settings.phone}`} className="hover:text-blue-600 transition-colors">
                    {settings.phone}
                  </a>
                </li>
              )}
              <li className="flex gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock size={16} className="flex-shrink-0 text-blue-500 mt-0.5" />
                <span>{settings.workingHours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} {settings.shopName}. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Powered by high-performance integrations.
          </p>
        </div>
      </div>
    </footer>
  );
}
