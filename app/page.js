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
    banners: [
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80',
    ],
  });
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [usedProducts, setUsedProducts] = useState([]);
  const [activeBanner, setActiveBanner] = useState(0);

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
          setUsedProducts(usedData.products);
        }
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Banner rotation logic
  useEffect(() => {
    if (settings.banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % settings.banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [settings.banners]);

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="space-y-16 pb-20 bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* 1. HERO SECTION */}
      <section className="relative h-[550px] overflow-hidden bg-gray-900 flex items-center">
        {settings.banners.map((url, idx) => (
          <div
            key={url}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              activeBanner === idx ? 'opacity-40' : 'opacity-0'
            }`}
          >
            <img
              src={url}
              alt={`Banner ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {/* Fallback pattern overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900/90 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 text-white space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4 max-w-2xl"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/35 uppercase tracking-wider">
              <Sparkles size={12} />
              Boisar's Leading Tech Integrator
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Trusted New & Used <br />
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                IT Solutions
              </span>{' '}
              at Best Prices
            </h1>
            <p className="text-base sm:text-lg text-gray-300 font-medium">
              Find premium new & refurbished laptops, desktop setups, printers, CCTV systems, and network peripherals backed by local support and expert diagnostics.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href="/products"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]"
            >
              <span>Browse Shop</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="flex items-center justify-center px-6 py-3.5 rounded-xl border border-white/20 hover:bg-white/10 text-white font-bold text-sm transition-colors"
            >
              <span>Visit Physical Shop</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Explore Categories
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Browse our curated collections of new and pre-owned high-performance devices.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-100 dark:bg-gray-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/products?category=${cat.slug}`}
                className="group p-5 rounded-2xl border border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950 text-center hover:border-indigo-500 dark:hover:border-indigo-500 transition-all hover:shadow-lg"
              >
                <div className="mx-auto w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Layers size={20} />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-gray-800 dark:text-gray-250 truncate">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-gray-400 font-semibold flex items-center justify-center gap-0.5 mt-1 group-hover:text-indigo-500 transition-colors">
                  <span>View Items</span>
                  <ChevronRight size={10} />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Featured Products
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Handpicked customer favorites inspected for absolute reliability.
            </p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>View All</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((prod) => (
                <ProductCard
                  key={prod._id}
                  product={prod}
                  whatsappNumber={settings.whatsapp}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-gray-500">
                No featured products found.
              </div>
            )}
          </div>
        )}
      </section>

      {/* 4. CONDITION SPLIT (NEW vs USED) */}
      <section className="bg-gray-50 dark:bg-gray-950/40 border-y border-gray-100 dark:border-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* New Arrivals */}
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-gray-950 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                Brand New Hardware
              </h3>
              <p className="text-sm text-gray-500">Directly sourced, sealed box with manufacturer warranties.</p>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {newProducts.map((prod) => (
                  <ProductCard
                    key={prod._id}
                    product={prod}
                    whatsappNumber={settings.whatsapp}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Used/Refurbished Arrivals */}
          <div className="space-y-6 pt-6">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-gray-950 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
                Premium Refurbished Laptops & Gear
              </h3>
              <p className="text-sm text-gray-500">Rigorous 25-point quality check, certified components, and local shop warranty.</p>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {usedProducts.map((prod) => (
                  <ProductCard
                    key={prod._id}
                    product={prod}
                    whatsappNumber={settings.whatsapp}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <h2 className="text-3xl font-extrabold text-gray-950 dark:text-white">
            Why Choose Us?
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Boisar's trusted integration and sales terminal for computers and network security.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: '25-Point Diagnostic Check',
              desc: 'Every refurbished device undergoes structural, software, and hardware diagnostics before sale.',
              icon: Wrench,
              color: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
            },
            {
              title: 'Local Shop Warranty',
              desc: 'No waiting for distant hubs. Any technical issue is handled directly at our Boisar storefront.',
              icon: ShieldCheck,
              color: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
            },
            {
              title: 'Highly Competitive Prices',
              desc: 'Get top-tier tech like Business Series HP, Dell, and Lenovo laptops at a fraction of their launch price.',
              icon: ThumbsUp,
              color: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400',
            },
            {
              title: 'Custom Integrations',
              desc: 'We do not just sell components; we design CCTV frameworks, office printing terminals, and home networks.',
              icon: Laptop,
              color: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-gray-150 dark:border-gray-900 bg-white dark:bg-gray-950 shadow-sm space-y-4"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.color}`}>
                <feature.icon size={22} />
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-450 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="bg-gray-50 dark:bg-gray-950/40 border-y border-gray-100 dark:border-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              What Our Customers Say
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Feedback from verified buyers and office setups around Palghar district.
            </p>
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
                className="p-6 rounded-2xl bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-900 shadow-sm text-left flex flex-col justify-between"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed mb-6">
                  "{t.quote}"
                </p>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                    {t.author}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-semibold">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CONTACT CTA SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl shadow-indigo-500/10">
          <div className="space-y-3 text-center md:text-left max-w-lg">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Looking for a Custom Configuration?
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 font-medium">
              We configure computers to order and setup specialized office print & surveillance frameworks. Talk to our technician today!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 justify-center">
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-indigo-600 font-bold text-sm shadow-md transition-all hover:scale-[1.02]"
            >
              <MapPin size={16} />
              <span>Contact & Timings</span>
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
