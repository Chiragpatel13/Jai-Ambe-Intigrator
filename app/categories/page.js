'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layers, ChevronRight, Laptop, Video, Printer, Cable, Cpu } from 'lucide-react';
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

  // Simple icon mapping helper for premium visual aesthetics
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-colors duration-300">
      <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950 dark:text-white">
          Product Categories
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
          Select a category to view our inventory of new and pre-owned devices.
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-semibold">
                  Browse laptops, spares, or security configurations matching this class.
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-4 group-hover:translate-x-1 transition-transform">
                <span>View Products</span>
                <ChevronRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-550">
          No categories found. Check back later or contact shop.
        </div>
      )}
    </div>
  );
}
