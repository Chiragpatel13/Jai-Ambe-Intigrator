'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Share2,
  Calendar,
  Layers,
  Award,
  ChevronRight,
  ShieldCheck,
  Check,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import Loader, { ProductCardSkeleton } from '@/components/Loader';
import ProductCard from '@/components/ProductCard';
import Toast from '@/components/Toast';

export default function ProductDetailsPage({ params }) {
  // Await params using React's use() hook to satisfy Next.js 15+ async params
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [settings, setSettings] = useState({ whatsapp: '919890254321' });

  // Inquiry Form state
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const triggerToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
  };

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        // Fetch Settings
        const settingsRes = await fetch('/api/settings');
        const settingsData = await settingsRes.json();
        if (settingsData.success && settingsData.settings) {
          setSettings(settingsData.settings);
        }

        // Fetch Product Details
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
          setActiveImageIdx(0);
          setMessage(`Hello, I would like to inquire about: ${data.product.name}`);

          // Fetch similar products in same category
          if (data.product.category) {
            const similarRes = await fetch(
              `/api/products?category=${data.product.category.slug}&limit=5`
            );
            const similarData = await similarRes.json();
            if (similarData.success) {
              // Exclude current product
              const filtered = similarData.products.filter((p) => p._id !== data.product._id);
              setSimilarProducts(filtered.slice(0, 4));
            }
          }
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      try {
        await navigator.clipboard.writeText(window.location.href);
        triggerToast('Product link copied to clipboard!');
      } catch (err) {
        triggerToast('Failed to copy link.', 'error');
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !phone || !message) {
      triggerToast('Please fill in all form fields.', 'error');
      return;
    }

    setSubmittingInquiry(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          phone,
          message,
          productId: id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        triggerToast('Inquiry submitted successfully! Redirecting to WhatsApp...', 'success');
        
        // Clear fields
        setCustomerName('');
        setPhone('');

        // Event tracking for Inquiry form submissions
        try {
          window.gtag?.('event', 'form_inquiry_submit', {
            event_category: 'engagement',
            event_label: product.name,
          });
        } catch (e) {}

        // Construct prefilled WhatsApp link and redirect
        setTimeout(() => {
          const formattedPrice = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
          }).format(product.price);

          const waText = `Hello Jai Ambe Intigrator,

I have submitted an inquiry on your website:
*Name:* ${customerName}
*Phone:* ${phone}
*Product:* ${product.name}
*Price:* ${formattedPrice}
*Inquiry Message:* ${message}
*Link:* ${window.location.href}

Please let me know how to proceed.`;

          window.open(
            `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(waText)}`,
            '_blank'
          );
        }, 1500);
      } else {
        triggerToast(data.error || 'Failed to submit inquiry.', 'error');
      }
    } catch (err) {
      console.error('Inquiry submission error:', err);
      triggerToast('Something went wrong. Please try again.', 'error');
    } finally {
      setSubmittingInquiry(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <Loader size="large" className="mb-4" />
        <p className="text-sm font-semibold text-gray-500">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Not Found</h2>
        <p className="text-sm text-gray-500 mt-2">The product you are looking for does not exist or has been removed.</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md"
        >
          <ArrowLeft size={16} />
          <span>Back to Catalogue</span>
        </Link>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 transition-colors duration-300">
      {/* Toast Messages */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Breadcrumb / Back button */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-550 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Catalogue</span>
        </Link>
      </div>

      {/* Product Detail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Left Column - Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-900 rounded-3xl overflow-hidden relative">
            {product.images.length > 0 ? (
              <img
                src={product.images[activeImageIdx]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-900">
                No Image Available
              </div>
            )}

            {/* Condition Badge */}
            <span
              className={`absolute top-4 left-4 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                product.condition === 'new'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-500 text-white'
              }`}
            >
              <Award size={12} />
              {product.condition === 'new' ? 'Brand New' : 'Used / Refurbished'}
            </span>
          </div>

          {/* Thumbnail row */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 bg-gray-50 dark:bg-gray-900 transition-colors ${
                    activeImageIdx === idx
                      ? 'border-indigo-600 dark:border-indigo-400'
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-800'
                  }`}
                >
                  <img src={img} alt={`${product.name} thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Product details & Inquiry */}
        <div className="space-y-6">
          <div className="space-y-2">
            {product.category && (
              <span className="text-xs font-bold text-indigo-500 tracking-wider uppercase">
                {product.category.name}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 py-2">
              <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {formattedPrice}
              </span>

              {/* Stock status indicator */}
              {product.availability && product.stock > 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900">
                  <Check size={12} /> In Stock ({product.stock} units)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border border-rose-100 dark:border-rose-900">
                  Sold Out
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-900 pt-4 space-y-2">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              Product Description
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Quick specs section */}
          <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-900 p-4.5 rounded-2xl grid grid-cols-2 gap-4">
            <div className="flex gap-2.5 items-start">
              <ShieldCheck size={18} className="text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-white">Quality Inspection</h4>
                <p className="text-[10px] text-gray-500">Fully inspected & diagnostics checked</p>
              </div>
            </div>
            <div className="flex gap-2.5 items-start">
              <Clock size={18} className="text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-white">Shop Support</h4>
                <p className="text-[10px] text-gray-500">Local support & warranty options</p>
              </div>
            </div>
          </div>

          {/* Share/Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Share2 size={14} />
              <span>Share Product</span>
            </button>
          </div>

          {/* Lead Inquiry Form Container */}
          <div className="border border-gray-150 dark:border-gray-900 bg-white dark:bg-gray-950 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-gray-950 dark:text-white flex items-center gap-2">
              <MessageSquare size={18} className="text-indigo-500" />
              Send Shop Inquiry
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Submit details below to query this product. We will reply instantly via call or WhatsApp.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Contact Number (e.g. +91 99999 99999)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <textarea
                  rows={3}
                  placeholder="Your Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              {product.availability && product.stock > 0 ? (
                <button
                  type="submit"
                  disabled={submittingInquiry}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingInquiry ? 'Submitting...' : 'Submit Inquiry & Chat on WhatsApp'}
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full py-3 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-650 font-bold text-xs cursor-not-allowed"
                >
                  Product Sold Out
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="pt-10 border-t border-gray-100 dark:border-gray-900 space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
              Similar Products
            </h2>
            <p className="text-xs text-gray-500">Related gear in {product.category?.name}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {similarProducts.map((prod) => (
              <ProductCard
                key={prod._id}
                product={prod}
                whatsappNumber={settings.whatsapp}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
