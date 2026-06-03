'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layers, ChevronRight, Laptop, Video, Printer, Cable, Cpu, Calendar, Target, Award, Users } from 'lucide-react';
import Loader from '@/components/Loader';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.categories);
        }
      })
      .catch((err) => console.error('Error fetching categories:', err))
      .finally(() => setLoading(false));
  }, []);

  const getCategoryIcon = (slug) => {
    const iconSize = 24;
    switch (slug) {
      case 'laptops-computers':
        return <Laptop size={iconSize} />;
      case 'cctv-security':
        return <Video size={iconSize} />;
      case 'printers-copiers':
        return <Printer size={iconSize} />;
      case 'networking':
        return <Cable size={iconSize} />;
      default:
        return <Cpu size={iconSize} />;
    }
  };

  const timelineMilestones = [
    {
      year: '2020',
      title: 'The Humble Beginning',
      desc: 'Launched in Boisar, Palghar as a local repair outlet focusing on computers and basic printing setups.',
    },
    {
      year: '2022',
      title: 'Expanding Our Reach',
      desc: 'Partnered with regional vendors to provide certified refurbished laptops and professional CCTV installation services.',
    },
    {
      year: '2024',
      title: 'Digital Modernization',
      desc: 'Upgraded diagnostics, expanded industrial networking services, and launched digital platforms for easier browsing.',
    },
    {
      year: '2026',
      title: 'Next-Gen Integrator',
      desc: 'Cemented our place as Boisar\'s most trusted new and refurbished tech provider, aiming for absolute customer satisfaction.',
    },
  ];

  const statCounters = [
    { value: '500+', label: 'Happy Clients' },
    { value: '1,000+', label: 'Products Supplied' },
    { value: '5+', label: 'Years Experience' },
    { value: '100%', label: 'Trust & Quality' },
  ];

  const teamMembers = [
    {
      name: 'Rajesh Sharma',
      role: 'Founder & Technical Director',
      img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    },
    {
      name: 'Amit Mishra',
      role: 'Head of Sales & Logistics',
      img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
    {
      name: 'Priya Patel',
      role: 'Operations & Inquiries Lead',
      img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20 transition-colors duration-300">
      
      {/* 1. Header & Category Grid */}
      <section className="space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950 dark:text-white tracking-tight">
            All Categories
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
                className="group p-6 sm:p-8 rounded-2xl bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-900 shadow-sm hover:shadow-lg hover:border-indigo-500 dark:hover:border-indigo-500 hover:scale-[1.01] transition-all flex flex-col justify-between h-52"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    {getCategoryIcon(cat.slug)}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">
                    Browse premium quality parts and products catalog matching {cat.name.toLowerCase()} class.
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-4 group-hover:translate-x-1 transition-transform">
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

      {/* 2. Middle Hero Banner & Business Timeline */}
      <section className="space-y-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-indigo-600 dark:bg-indigo-950 text-white text-center space-y-4 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-black">Jai Ambe Intigrator</h2>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-indigo-100 font-medium">
            We bridge the gap between quality technology and affordable pricing. Learn how we grew from a small repair desk to Palghar district's go-to tech hub.
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-6 max-w-4xl mx-auto">
          <h3 className="text-lg font-bold text-gray-950 dark:text-white text-center uppercase tracking-wider mb-8">
            Our Journey Through The Years
          </h3>
          <div className="relative border-l border-gray-200 dark:border-gray-800 ml-4 sm:ml-32 space-y-10">
            {timelineMilestones.map((milestone, idx) => (
              <div key={idx} className="relative pl-6 sm:pl-8 group">
                {/* Year tag left aligned */}
                <div className="hidden sm:block absolute -left-36 top-1 text-right w-28 text-indigo-600 dark:text-indigo-400 font-black text-sm">
                  {milestone.year}
                </div>
                {/* Visual marker dot */}
                <div className="absolute -left-1.5 top-2 w-3 h-3 rounded-full bg-indigo-600 dark:bg-indigo-400 border border-white dark:border-gray-950 group-hover:scale-125 transition-transform" />
                
                {/* Details */}
                <div className="space-y-1 bg-gray-50 dark:bg-gray-900/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm">
                  <span className="sm:hidden inline-block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-1">
                    Year {milestone.year}
                  </span>
                  <h4 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                    {milestone.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {milestone.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Stat counters grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statCounters.map((stat, idx) => (
          <div
            key={idx}
            className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-900 text-center shadow-sm space-y-1"
          >
            <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{stat.value}</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-900/30 border border-gray-150 dark:border-gray-900 text-center space-y-4 shadow-sm hover:scale-[1.01] transition-transform"
            >
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-indigo-500">
                <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">{member.name}</h4>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Our Vision & Journey */}
      <section className="p-8 sm:p-10 rounded-3xl bg-gray-50 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-900 space-y-4 text-center max-w-4xl mx-auto">
        <h3 className="text-lg font-bold text-gray-905 dark:text-white flex items-center justify-center gap-2">
          <Target size={18} className="text-indigo-600" />
          Our Vision & Future Outlook
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
          At Jai Ambe Intigrator, our vision is to lead Boisar and Palghar district's electronics market by providing unbeatable quality-to-price ratios on computing and surveillance installations. We are committed to extending technical assistance and after-sales setup support, ensuring that local businesses, schools, and homeowners can implement premium technology configurations with minimal effort and expense.
        </p>
      </section>

    </div>
  );
}
