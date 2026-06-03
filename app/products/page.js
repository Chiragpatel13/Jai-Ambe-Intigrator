'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, AlertCircle, RotateCcw } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import FilterPanel from '@/components/FilterPanel';
import ProductCard from '@/components/ProductCard';
import Loader, { ProductCardSkeleton } from '@/components/Loader';

// Component that handles the core product searching/filtering
function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search parameters
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const condition = searchParams.get('condition') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({ whatsapp: '919890254321' });
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch initial categories and settings
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.categories);
      })
      .catch((err) => console.error('Error fetching categories:', err));

    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) setSettings(data.settings);
      })
      .catch((err) => console.error('Error fetching settings:', err));
  }, []);

  // Fetch products whenever search params change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          search,
          category,
          condition,
          minPrice,
          maxPrice,
          sort,
          page: page.toString(),
          limit: '12',
        });

        const res = await fetch(`/api/products?${query.toString()}`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.products);
          setTotalPages(data.totalPages);
          setTotalProducts(data.total);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, category, condition, minPrice, maxPrice, sort, page]);

  // Update query params in URL
  const updateFilters = (newFilters) => {
    const params = new URLSearchParams();
    
    // Copy active parameters
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.condition) params.set('condition', newFilters.condition);
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
    if (newFilters.sort) params.set('sort', newFilters.sort);
    if (newFilters.page) params.set('page', newFilters.page.toString());

    router.push(`/products?${params.toString()}`);
  };

  const handleSearch = (searchValue) => {
    updateFilters({
      search: searchValue,
      category,
      condition,
      minPrice,
      maxPrice,
      sort,
      page: 1, // reset page on search
    });
  };

  const handleFilterChange = (filters) => {
    updateFilters({
      search,
      ...filters,
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    updateFilters({
      search,
      category,
      condition,
      minPrice,
      maxPrice,
      sort,
      page: newPage,
    });
  };

  const activeFilters = {
    category,
    condition,
    minPrice,
    maxPrice,
    sort,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Product Catalogue
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Showing {totalProducts} items matching your selections
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex-1 md:flex-initial md:w-80">
            <SearchBar initialValue={search} onSearch={handleSearch} />
          </div>
          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center justify-center p-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300"
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Left Filters - Desktop */}
        <div className="hidden md:block">
          <FilterPanel
            categories={categories}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Mobile Filters Overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            <div
              className="fixed inset-0 bg-black/55 backdrop-blur-sm"
              onClick={() => setShowMobileFilters(false)}
            />
            <div className="relative w-80 bg-white dark:bg-gray-950 h-full overflow-y-auto animate-in slide-in-from-right duration-250 z-10 shadow-2xl border-l border-gray-100 dark:border-gray-900">
              <div className="p-4 border-b border-gray-150 dark:border-gray-900 flex justify-between items-center bg-gray-55 dark:bg-gray-900/50">
                <span className="font-bold text-gray-900 dark:text-white">Filter Products</span>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Close
                </button>
              </div>
              <FilterPanel
                categories={categories}
                activeFilters={activeFilters}
                onFilterChange={(filters) => {
                  handleFilterChange(filters);
                  setShowMobileFilters(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Right Products Grid */}
        <div className="md:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <ProductCard
                    key={prod._id}
                    product={prod}
                    whatsappNumber={settings.whatsapp}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-6 border-t border-gray-100 dark:border-gray-900">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3.5 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold text-gray-500 px-3">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-3.5 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/50 dark:bg-gray-900/10">
              <AlertCircle size={40} className="text-gray-400" />
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 dark:text-white">No Products Found</h3>
                <p className="text-xs text-gray-500 dark:text-gray-450 max-w-xs">
                  We couldn't find matches for your search. Try resetting filters or updating keywords.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-4.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                <RotateCcw size={12} />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function handleResetFilters() {
    router.push('/products');
  }
}

// Wrapper to prevent Next.js useSearchParams client-side boundary errors on Vercel
export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="large" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
