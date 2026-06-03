'use client';

import { useState } from 'react';
import { Filter, SlidersHorizontal, RefreshCw } from 'lucide-react';

export default function FilterPanel({
  categories = [],
  activeFilters = {},
  onFilterChange,
}) {
  const {
    category = '',
    condition = '',
    minPrice = '',
    maxPrice = '',
    sort = 'newest',
  } = activeFilters;

  const handleSelectCategory = (slug) => {
    onFilterChange({ ...activeFilters, category: slug, page: 1 });
  };

  const handleSelectCondition = (cond) => {
    onFilterChange({ ...activeFilters, condition: cond, page: 1 });
  };

  const handlePriceChange = (field, val) => {
    onFilterChange({ ...activeFilters, [field]: val, page: 1 });
  };

  const handleSelectSort = (sortOption) => {
    onFilterChange({ ...activeFilters, sort: sortOption, page: 1 });
  };

  const handleReset = () => {
    onFilterChange({
      category: '',
      condition: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
      page: 1,
    });
  };

  return (
    <div className="space-y-6 p-5 bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-900">
        <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-gray-100">
          <SlidersHorizontal size={18} className="text-indigo-500" />
          <span>Filters</span>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
        >
          <RefreshCw size={12} />
          Reset All
        </button>
      </div>

      {/* Sort Section */}
      <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
          Sort By
        </label>
        <select
          value={sort}
          onChange={(e) => handleSelectSort(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="newest">Newest Additions</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="oldest">Oldest Additions</option>
        </select>
      </div>

      {/* Condition Section */}
      <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
          Condition
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-50 dark:bg-gray-900 rounded-xl">
          {[
            { label: 'All', value: '' },
            { label: 'New', value: 'new' },
            { label: 'Used', value: 'used' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => handleSelectCondition(item.value)}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                condition === item.value
                  ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Section */}
      <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
          Category
        </label>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => handleSelectCategory('')}
            className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
              category === ''
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleSelectCategory(cat.slug)}
              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                category === cat.slug
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Section */}
      <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
          Price Range (₹)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => handlePriceChange('minPrice', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <span className="text-gray-400 text-xs">to</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}
