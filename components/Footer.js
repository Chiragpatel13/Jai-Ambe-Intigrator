'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, MessageCircle, Boxes, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Footer() {
  const [settings, setSettings] = useState({
    shopName: 'Jai Ambe Intigrator',
    phone: '+91 98765 43210',
    whatsapp: '919890254321',
    address: 'Boisar, Palghar, Maharashtra',
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

  const trackWhatsApp = () => {
    try {
      if (typeof window !== 'undefined') {
        window.gtag?.('event', 'whatsapp_click', {
          event_category: 'engagement',
          event_label: 'footer_whatsapp',
        });
      }
    } catch (e) {}
  };

  return (
    <footer className="bg-zinc-100 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 transition-colors duration-300 mt-12 w-full">
      <div className="w-full px-4 sm:px-10 lg:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-xl bg-[#2b7fff] text-blue-50 flex justify-center items-center">
                <Boxes className="size-5" />
              </div>
              <span className="font-bold text-base leading-6 text-zinc-900 dark:text-white">
                {settings.shopName}
              </span>
            </div>
            <p className="text-[#71717b] dark:text-zinc-400 text-sm leading-5">
              Trusted new & used products at the best prices in Boisar, Palghar.
            </p>
            <div className="flex gap-2">
              <a
                href="#"
                className="size-9 transition-colors rounded-full bg-white dark:bg-zinc-900 text-[#71717b] border border-zinc-200 dark:border-zinc-800 flex justify-center items-center hover:bg-zinc-50"
              >
                <Globe className="size-4" />
              </a>
              <a
                href="#"
                className="size-9 transition-colors rounded-full bg-white dark:bg-zinc-900 text-[#71717b] border border-zinc-200 dark:border-zinc-800 flex justify-center items-center hover:bg-zinc-50"
              >
                <Globe className="size-4" />
              </a>
              {settings.whatsapp && (
                <a
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={trackWhatsApp}
                  className="size-9 transition-colors rounded-full bg-white dark:bg-zinc-900 text-green-600 border border-zinc-200 dark:border-zinc-800 flex justify-center items-center hover:bg-zinc-50"
                >
                  <MessageCircle className="size-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links Col */}
          <div className="flex flex-col gap-3">
            <p className="font-bold text-sm leading-5 text-zinc-900 dark:text-white">Quick Links</p>
            <Link href="/" className="transition-colors text-[#71717b] dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white text-sm leading-5">
              Home
            </Link>
            <Link href="/products" className="transition-colors text-[#71717b] dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white text-sm leading-5">
              Products
            </Link>
            <Link href="/categories" className="transition-colors text-[#71717b] dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white text-sm leading-5">
              Categories
            </Link>
            <Link href="/gallery" className="transition-colors text-[#71717b] dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white text-sm leading-5">
              Gallery
            </Link>
            <Link href="/about" className="transition-colors text-[#71717b] dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white text-sm leading-5">
              About
            </Link>
            <Link href="/contact" className="transition-colors text-[#71717b] dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white text-sm leading-5">
              Contact
            </Link>
          </div>

          {/* Contact Info Col */}
          <div className="flex flex-col gap-3">
            <p className="font-bold text-sm leading-5 text-zinc-900 dark:text-white">Contact Info</p>
            <p className="text-[#71717b] dark:text-zinc-400 text-sm leading-5 flex items-start gap-2">
              <MapPin className="size-4 text-[#2b7fff] mt-0.5 shrink-0" />
              <span>{settings.address}</span>
            </p>
            {settings.phone && (
              <p className="text-[#71717b] dark:text-zinc-400 text-sm leading-5 flex items-center gap-2">
                <Phone className="size-4 text-[#2b7fff] shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:underline">{settings.phone}</a>
              </p>
            )}
            {settings.whatsapp && (
              <p className="text-[#71717b] dark:text-zinc-400 text-sm leading-5 flex items-center gap-2">
                <MessageCircle className="size-4 text-green-600 shrink-0" />
                <span>WhatsApp: {settings.phone || `+${settings.whatsapp}`}</span>
              </p>
            )}
          </div>

          {/* Get In Touch Col */}
          <div className="flex flex-col gap-3">
            <p className="font-bold text-sm leading-5 text-zinc-900 dark:text-white">Get In Touch</p>
            <p className="text-[#71717b] dark:text-zinc-400 text-sm leading-5">
              Have a question? Reach out and we'll help you find the perfect product.
            </p>
            {settings.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={trackWhatsApp}
                className="inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-lg bg-green-600 hover:bg-green-700 text-white gap-1.5 w-fit px-4 py-2 text-sm h-9 cursor-pointer"
              >
                <MessageCircle className="size-4" />
                Chat Now
              </a>
            )}
          </div>

        </div>

        {/* Footer bottom details */}
        <div className="text-center text-[#71717b] dark:text-zinc-500 text-xs leading-4 border-t border-zinc-200 dark:border-zinc-800 mt-8 pt-6">
          &copy; {new Date().getFullYear()} {settings.shopName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
