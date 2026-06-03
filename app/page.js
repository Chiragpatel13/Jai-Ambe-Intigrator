'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Laptop,
  ShieldCheck,
  Wrench,
  ThumbsUp,
  ChevronRight,
  ArrowRight,
  MapPin,
  Clock,
  Layers,
  Sparkles,
  Camera,
  Printer,
  Network,
  Cpu,
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Loader, { ProductCardSkeleton } from '@/components/Loader';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    shopName: 'Jai Ambe Intigrator',
    phone: '',
    whatsapp: '919890254321',
    address: 'Boisar, Palghar, Maharashtra',
    workingHours: 'Monday - Saturday: 10:00 AM - 8:30 PM',
  });
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [usedProducts, setNewUsedProducts] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Settings
        const settingsRes = await fetch('/api/settings');
        const settingsData = await settingsRes.json();
        if (settingsData.success && settingsData.settings) {
          setSettings(settingsData.settings);
        }

        // Fetch Categories
        const categoriesRes = await fetch('/api/categories');
        const categoriesData = await categoriesRes.json();
        if (categoriesData.success) {
          setCategories(categoriesData.categories);
        }

        // Fetch Featured Products
        const featuredRes = await fetch('/api/products?featured=true&limit=8');
        const featuredData = await featuredRes.json();
        if (featuredData.success) {
          setFeaturedProducts(featuredData.products);
        }

        // Fetch New Products
        const newRes = await fetch('/api/products?condition=new&limit=4');
        const newData = await newRes.json();
        if (newData.success) {
          setNewProducts(newData.products);
        }

        // Fetch Used Products
        const usedRes = await fetch('/api/products?condition=used&limit=4');
        const usedData = await usedRes.json();
        if (usedData.success) {
          setNewUsedProducts(usedData.products);
        }
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCategoryIcon = (slug) => {
    switch (slug) {
      case 'laptops-computers':
        return <Laptop className="w-5 h-5 text-blue-600 dark:text-blue-450" />;
      case 'cctv-security':
        return <Camera className="w-5 h-5 text-blue-600 dark:text-blue-450" />;
      case 'printers-copiers':
        return <Printer className="w-5 h-5 text-blue-600 dark:text-blue-450" />;
      case 'networking':
        return <Network className="w-5 h-5 text-blue-600 dark:text-blue-450" />;
      default:
        return <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-450" />;
    }
  };

  const statCounters = [
    { value: '500+', label: 'Happy Customers' },
    { value: '1,000+', label: 'Products Supplied' },
    { value: '5+', label: 'Years Experience' },
    { value: '100%', label: 'Trust & Quality' },
  ];

  const faqs = [
    {
      q: "Do you offer warranties on refurbished laptops?",
      a: "Yes! Every refurbished laptop purchased from our store comes with a local shop warranty (typically 1 to 3 months) covering hardware diagnostics and repairs."
    },
    {
      q: "Can I inspect the laptop physically before buying?",
      a: "Absolutely! We encourage customers to visit our Boisar showroom to test keyboard response, battery life, screen quality, and system speed firsthand."
    },
    {
      q: "Do you provide custom configurations (RAM/SSD upgrades)?",
      a: "Yes. We can customize any laptop or desktop configuration on the spot, including upgrading RAM, installing high-speed SSDs, or installing specific software tools."
    },
    {
      q: "What services do you cover for CCTV and Networking?",
      a: "We provide complete layout planning, cabling, installation, and mobile-app remote setup for retail shops, offices, warehouses, and homes in Palghar district."
    }
  ];

  return (
    <div className="bg-slate-50/50 dark:bg-gray-950 transition-colors duration-300 space-y-16 pb-20">
      
      {/* 1. HERO SECTION (2-Column Mockup Layout) */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-900/50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline, Subtext, Stats */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                <Sparkles size={12} className="fill-current" />
                Trusted IT Integration Terminal
              </span>
              <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-[1.15]">
                Trusted <span className="text-blue-600 dark:text-blue-400">New &amp; Used</span> Products at Best Prices
              </h1>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
                Boisar's premier outlet for brand new and refurbished laptops, office printers, surveillance CCTV cameras, custom desktops, and industrial networking components.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/10 transition-transform hover:scale-[1.01]"
              >
                <span>Browse Products</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/contact"
                className="flex items-center justify-center px-6 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:bg-gray-50 text-gray-700 dark:text-gray-300 font-bold text-xs sm:text-sm transition-colors"
              >
                <span>Visit Our Outlet</span>
              </Link>
            </div>

            {/* Hero Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              {statCounters.map((stat, i) => (
                <div key={i} className="space-y-0.5">
                  <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{stat.value}</p>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Featured Promo Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-900 shadow-xl overflow-hidden p-3 group">
              <div className="aspect-video sm:aspect-square bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80"
                  alt="Premium laptops showcase"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Featured Inventory
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-500 text-white rounded-full">
                    Refurbished Stock
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                  Corporate Grade Laptops
                </h3>
                <p className="text-[11px] text-gray-400 leading-normal">
                  Heavy duty Dell, HP &amp; Lenovo models configured with brand new SSDs.
                </p>
                <Link
                  href="/products?condition=used"
                  className="w-full py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-600 dark:text-blue-400 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Explore Catalog</span>
                  <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. CATEGORIES SECTION (Shop by Category Horizontal Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-lg font-extrabold text-gray-950 dark:text-white uppercase tracking-wider">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/products?category=${cat.slug}`}
              className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-900 shadow-sm hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                {getCategoryIcon(cat.slug)}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                  {cat.name}
                </h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">
                  View Items
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS CATALOG */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-gray-905 dark:text-white">
              Featured Products
            </h2>
            <p className="text-xs text-gray-400">Our customer picks backed by our repair workshop verification.</p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-0.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>View All</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((prod) => (
              <ProductCard key={prod._id} product={prod} whatsappNumber={settings.whatsapp} />
            ))}
          </div>
        )}
      </section>

      {/* 4. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white">
            New Arrivals
          </h2>
          <p className="text-xs text-gray-400">Direct distributor brand new components and systems.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {newProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} whatsappNumber={settings.whatsapp} />
            ))}
          </div>
        )}
      </section>

      {/* 5. USED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white">
            Used &amp; Refurbished Products
          </h2>
          <p className="text-xs text-gray-400">Inspected, benchmarked, and warrantied local pre-owned stock.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {usedProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} whatsappNumber={settings.whatsapp} />
            ))}
          </div>
        )}
      </section>

      {/* 6. WHY CHOOSE US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white">
            Why Choose Us?
          </h2>
          <p className="text-xs text-gray-500">
            Boisar's technical integration point for computing and network security.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: '25-Point Diagnostic Check',
              desc: 'Every refurbished device undergoes structural, software, and hardware diagnostics before sale.',
              icon: Wrench,
            },
            {
              title: 'Local Shop Warranty',
              desc: 'No waiting for distant hubs. Any technical issue is handled directly at our Boisar storefront.',
              icon: ShieldCheck,
            },
            {
              title: 'Highly Competitive Prices',
              desc: 'Get top-tier tech like Business Series HP, Dell, and Lenovo laptops at a fraction of their launch price.',
              icon: ThumbsUp,
            },
            {
              title: 'Custom Integrations',
              desc: 'We do not just sell components; we design CCTV frameworks, office printing terminals, and home networks.',
              icon: Laptop,
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-gray-150 dark:border-gray-900 bg-white dark:bg-gray-950 shadow-sm space-y-4"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-450">
                <feature.icon size={22} />
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-450 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white">
            Customer Reviews
          </h2>
          <p className="text-xs text-gray-500">Feedback from local retail buyers and office installations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: 'Purchased a refurbished ThinkPad for my office. The laptop runs as good as new and saved me over 60% of the cost. Outstanding service by Jai Ambe Intigrator!',
              author: 'Ramesh Patil',
              role: 'Small Business Owner, Boisar East',
            },
            {
              quote: 'They installed a 6-camera CCTV kit at my retail store. Complete setup done in one day with remote phone viewing. Very professional and helpful staff.',
              author: 'Sanjay Mishra',
              role: 'Supermarket Owner, Tarapur Road',
            },
            {
              quote: 'Best place in Boisar for printers and spares. I get all my cartridges and servicing done here. Transparent pricing and genuine feedback on repairs.',
              author: 'Priya Sharma',
              role: 'Academy Coordinator, Palghar',
            },
          ].map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-900 shadow-sm text-left flex flex-col justify-between h-48"
            >
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic leading-relaxed">
                "{t.quote}"
              </p>
              <div>
                <h4 className="font-extrabold text-xs text-gray-900 dark:text-white">
                  {t.author}
                </h4>
                <p className="text-[10px] text-gray-400 font-semibold">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Find answers to common questions about our products, setups, and local support.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-gray-150 dark:border-gray-900 bg-white dark:bg-gray-950/40 overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-colors"
              >
                <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                  {faq.q}
                </span>
                <span className="text-blue-600 dark:text-blue-400 text-lg font-bold">
                  {openFaq === idx ? '−' : '+'}
                </span>
              </button>
              
              {openFaq === idx && (
                <div className="px-6 pb-5 pt-1 border-t border-gray-100 dark:border-gray-900">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. CONTACT CTA SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-blue-600 dark:bg-blue-900 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-lg shadow-blue-500/10">
          <div className="space-y-3 text-center md:text-left max-w-lg">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Looking for a Custom Configuration?
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 font-medium">
              We configure computers to order and setup specialized office print &amp; surveillance frameworks. Talk to our technician today!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 justify-center">
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-blue-600 font-bold text-sm shadow-md transition-all hover:scale-[1.02]"
            >
              <MapPin size={16} />
              <span>Contact &amp; Timings</span>
            </Link>
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-all hover:scale-[1.02]"
            >
              <span>WhatsApp Chat</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
