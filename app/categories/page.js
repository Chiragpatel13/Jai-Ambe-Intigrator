'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layers, ChevronRight, Video, Cpu, Target } from 'lucide-react';
import Loader from '@/components/Loader';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({ ownerName: 'Er. Anand', designation: 'Owner', ownerPhoto: '/Anand.jpeg' });
  const [loading, setLoading] = useState(true);

  const fetchSettings = () => {
    fetch(`/api/settings?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((settingsData) => {
        if (settingsData.success && settingsData.settings) {
          setSettings({
            ownerName: settingsData.settings.ownerName || 'Er. Anand',
            designation: settingsData.settings.designation || 'Owner',
            ownerPhoto: settingsData.settings.ownerPhoto || '/Anand.jpeg',
          });
        }
      })
      .catch((err) => console.error('Error fetching settings for categories page:', err));
  };

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((categoriesData) => {
        if (categoriesData.success) {
          setCategories(categoriesData.categories);
        }
      })
      .catch((err) => console.error('Error fetching categories:', err))
      .finally(() => setLoading(false));

    fetchSettings();

    let ch;
    try {
      ch = new BroadcastChannel('settings_channel');
      ch.addEventListener('message', (e) => {
        if (e.data?.type === 'SETTINGS_UPDATED') fetchSettings();
      });
    } catch (e) {}

    return () => {
      try {
        ch?.close();
      } catch (e) {}
    };
  }, []);

  const getCategoryIcon = (slug) => {
    const iconSize = 24;
    switch (slug) {
      case 'cctv-intercom':
        return <Video size={iconSize} />;
      case 'vfd-control-panel':
        return <Cpu size={iconSize} />;
      case 'geyser-stabilizer':
        return <Layers size={iconSize} />;
      default:
        return <Cpu size={iconSize} />;
    }
  };

  const statCounters = [
    { value: '500+', label: 'Happy Clients' },
    { value: '1,200+', label: 'Systems Configured' },
    { value: '8+', label: 'Years Experience' },
    { value: '100%', label: 'Trust & Quality' },
  ];

  const teamMembers = [
    {
      name: settings.ownerName,
      role: settings.designation,
      img: settings.ownerPhoto || '/Anand.jpeg',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20 transition-colors duration-300">
      
      {/* 1. Header & Category Grid */}
      <section className="space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950 dark:text-white tracking-tight">
            Service Categories
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Explore our curated selection of high-quality electronics, components, and security systems.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader size="large" />
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/products?category=${cat.slug}`}
                className="group p-6 sm:p-8 rounded-2xl bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-900 shadow-sm hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500 hover:scale-[1.01] transition-all flex flex-col justify-between h-52"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    {getCategoryIcon(cat.slug)}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">
                    Browse premium quality parts and products catalog matching {cat.name.toLowerCase()} class.
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 mt-4 group-hover:translate-x-1 transition-transform">
                  <span>View All</span>
                  <ChevronRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            No categories available at the moment.
          </div>
        )}
      </section>

      {/* 2. Middle Hero Banner */}
      <section className="space-y-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-blue-600 dark:bg-blue-950 text-white text-center space-y-4 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-black">JAYAMBE INTEGRATORS</h2>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-blue-100 font-medium">
            We bridge the gap between advanced industrial automation controls and affordable residential services, delivering premium integration solutions across Boisar.
          </p>
        </div>
      </section>

      {/* 3. Stat counters grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statCounters.map((stat, idx) => (
          <div
            key={idx}
            className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-900 text-center shadow-sm space-y-1"
          >
            <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{stat.value}</p>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      {/* 4. Meet Our Team */}
      <section className="space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight">
            Meet Our Team
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Dedicated tech support engineers and sales consultants ready to guide you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 justify-center">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-900/30 border border-gray-150 dark:border-gray-900 text-center space-y-4 shadow-sm hover:scale-[1.01] transition-transform col-start-2"
            >
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-blue-500">
                <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">{member.name}</h4>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Our Vision & Journey */}
      <section className="p-8 sm:p-10 rounded-3xl bg-gray-50 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-900 space-y-4 text-center max-w-4xl mx-auto">
        <h3 className="text-lg font-bold text-gray-955 dark:text-white flex items-center justify-center gap-2">
          <Target size={18} className="text-blue-600" />
          Our Vision & Future Outlook
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
          At JAYAMBE INTEGRATORS, our vision is to lead the electrical and electronic services market from Virar (Mumbai) to Vapi (Gujarat) by providing unbeatable quality-to-price ratios on automation and security installations. With our shop based in Boisar, we are committed to extending technical assistance and after-sales support, ensuring that local businesses, factories, and homeowners can implement premium technology configurations with minimal effort and expense.
        </p>
      </section>

    </div>
  );
}
