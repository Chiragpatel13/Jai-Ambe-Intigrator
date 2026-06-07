'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { useLiveSync } from '@/hooks/useLiveSync';
import {
  Menu,
  X,
  Sun,
  Moon,
  Search,
  MessageCircle,
  Boxes,
  Home,
  ShoppingBag,
  Grid,
  Info,
  Mail,
  Image,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    shopName: 'JAYAMBE INTEGRATORS',
    phone: '+91 8879430925',
    whatsapp: '918879430925',
  });
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  // Don't show public navbar on admin pages
  const isAdmin = pathname?.startsWith('/admin');

  const fetchSettings = () => {
    fetch(`/api/settings?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch((err) => console.error('Error fetching settings in navbar:', err));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useLiveSync(fetchSettings, ['settings'], 12000);

  if (isAdmin) return null;

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Products', path: '/products', icon: ShoppingBag },
    { name: 'Categories', path: '/categories', icon: Grid },
    { name: 'Gallery', path: '/gallery', icon: Image },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: Mail },
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const trackWhatsApp = () => {
    try {
      if (typeof window !== 'undefined') {
        window.gtag?.('event', 'whatsapp_click', {
          event_category: 'engagement',
          event_label: 'navbar_whatsapp',
        });
      }
    } catch (e) {}
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-zinc-950/70 border-b border-zinc-200 dark:border-zinc-800 w-full transition-colors duration-300">
      <div className="w-full flex px-4 sm:px-10 lg:px-16 justify-between items-center h-16">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2">
          <div className="size-9 shadow-md rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex justify-center items-center overflow-hidden p-0.5">
            <img src="/logo_jayambe.png" alt="Jayambe Logo" className="size-full object-contain" />
          </div>
          <div className="leading-none flex flex-col">
            <span className="font-bold text-base leading-6 tracking-tight text-zinc-950 dark:text-white">
              {settings.shopName}
            </span>
            <span className="font-medium text-[#71717b] dark:text-zinc-400 text-[10px]">
              Boisar, Palghar
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`transition-colors font-medium rounded-lg text-sm leading-5 flex px-3 py-2 items-center gap-1.5 ${
                  isActive
                    ? 'font-semibold text-zinc-950 dark:text-white bg-zinc-100/50 dark:bg-zinc-850'
                    : 'text-[#71717b] dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                <Icon className="size-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/products">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-lg text-[#71717b] dark:text-zinc-400 border-0"
              aria-label="Search Products"
            >
              <Search className="size-4" />
            </Button>
          </Link>

          
          {settings.whatsapp && (
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackWhatsApp}
            >
              <Button className="shadow-md transition-all rounded-lg bg-green-600 hover:bg-green-700 text-white gap-1.5 border-0">
                <MessageCircle className="size-4" />
                WhatsApp
              </Button>
            </a>
          )}
        </div>

        {/* Mobile menu toggle and theme toggle */}
        <div className="flex items-center md:hidden gap-2">

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="size-9 rounded-lg text-[#71717b] dark:text-zinc-400 border-0"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>

      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white'
                      : 'text-[#71717b] dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  <Icon className="size-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>
          <div className="pt-2 pb-4 border-t border-zinc-100 dark:border-zinc-900 px-4 flex gap-2">
            <Link href="/products" className="flex-1" onClick={handleLinkClick}>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800"
              >
                <Search className="size-4" />
                <span>Search Products</span>
              </Button>
            </Link>
            {settings.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={trackWhatsApp}
                className="flex-1"
              >
                <Button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold border-0">
                  <MessageCircle className="size-4" />
                  <span>WhatsApp</span>
                </Button>
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
