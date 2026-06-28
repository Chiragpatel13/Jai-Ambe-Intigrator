'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BadgeCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Grid,
  Heart,
  Home,
  Info,
  Link2 as ShareIcon,
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Moon,
  Phone,
  Plus,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  StarHalf,
  Tag,
  Zap,
  ZoomIn,
  ArrowLeft,
  Share2,
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
  const [settings, setSettings] = useState({ whatsapp: '918879430925' });
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Inquiry Form state
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  // Review form states
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

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
          setQuantity(data.product.stock > 0 ? 1 : 0);
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!product || !product.images || product.images.length <= 1) return;

      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveImageIdx((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveImageIdx((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product]);

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

  const handleWhatsAppInquiry = () => {
    try {
      if (typeof window !== 'undefined') {
        window.gtag?.('event', 'whatsapp_inquiry', {
          event_category: 'engagement',
          event_label: product.name,
        });
      }
    } catch (err) {}

    const formattedPrice = product.price && product.price > 0 ? new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(product.price) : 'Ask for Price';

    const text = `Hello JAYAMBE INTEGRATORS, I am interested in inquiring about:
*Product:* ${product.name}
*Condition:* ${product.condition === 'new' ? 'Brand New' : 'Refurbished / Used'}
*Price:* ${formattedPrice}
*Quantity:* ${quantity}
*Link:* ${window.location.href}

Please let me know if it is available.`;

    window.open(`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
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
          const formattedPrice = product.price && product.price > 0 ? new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
          }).format(product.price) : 'Ask for Price';

          const waText = `Hello JAYAMBE INTEGRATORS,

I have submitted an inquiry on your website:
*Name:* ${customerName}
*Phone:* ${phone}
*Product:* ${product.name}
*Price:* ${formattedPrice}
*Quantity:* ${quantity}
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) {
      triggerToast('Please fill in all review fields.', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: reviewName,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (data.success) {
        triggerToast('Review submitted successfully!', 'success');
        setReviewName('');
        setReviewRating(5);
        setReviewComment('');
        setProduct((prev) => ({ ...prev, reviews: data.reviews }));
      } else {
        triggerToast(data.error || 'Failed to submit review.', 'error');
      }
    } catch (err) {
      console.error('Review submission error:', err);
      triggerToast('Something went wrong. Please try again.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-white dark:bg-zinc-950">
        <Loader size="large" className="mb-4" />
        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full py-20 text-center bg-white dark:bg-zinc-950">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Product Not Found</h2>
        <p className="text-sm text-zinc-500 mt-2">The product you are looking for does not exist or has been removed.</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-[#2b7fff] hover:bg-[#1a6eeb] text-white text-sm font-semibold shadow-md transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Catalogue</span>
        </Link>
      </div>
    );
  }

  const hasPrice = !!(product.price && product.price > 0);
  const formattedPrice = hasPrice ? new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price) : 'Ask for Price';

  const originalPrice = product.originalPrice || Math.round((product.price || 0) * 1.25);
  const formattedOriginalPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(originalPrice);

  const discountPercent = Math.round(((originalPrice - (product.price || 0)) / originalPrice) * 100);

  return (
    <div className="w-full bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 transition-colors duration-300">
      {/* Toast Messages */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <main className="w-full px-4 sm:px-10 lg:px-16 py-8">
        {/* Breadcrumb */}
        <nav className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm leading-5 flex mb-8 items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-[#2b7fff] transition-colors">Home</Link>
          <ChevronRight className="size-4 shrink-0" />
          <Link href="/products" className="hover:text-[#2b7fff] transition-colors">Products</Link>
          {product.category && (
            <>
              <ChevronRight className="size-4 shrink-0" />
              <Link href={`/products?category=${product.category.slug}`} className="hover:text-[#2b7fff] transition-colors capitalize">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="size-4 shrink-0" />
          <span className="font-medium text-zinc-900 dark:text-white truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Gallery - Left Column */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="group relative shadow-lg rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden aspect-[4/3] w-full flex items-center justify-center">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[activeImageIdx]}
                  alt={product.name}
                  className="object-contain w-full h-full p-4 transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="text-zinc-400 dark:text-zinc-500 text-sm">
                  No Image Available
                </div>
              )}

              {/* Left/Right navigation chevrons */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIdx((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
                    className="absolute left-4 z-10 size-10 rounded-full bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800 text-zinc-800 dark:text-white flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                    title="Previous Image (Left Arrow)"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    onClick={() => setActiveImageIdx((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 z-10 size-10 rounded-full bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800 text-zinc-800 dark:text-white flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                    title="Next Image (Right Arrow)"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </>
              )}

              <div className="size-10 backdrop-blur-md rounded-full bg-zinc-950/40 text-white flex absolute right-4 top-4 justify-center items-center cursor-pointer hover:bg-zinc-950/60 transition-colors">
                <ZoomIn className="size-5" />
              </div>
              <span className="font-bold rounded-full bg-[#2b7fff] text-white text-[10px] absolute left-4 top-4 px-2.5 py-0.5 shadow-sm flex items-center gap-1">
                <Sparkles className="size-3" />
                Featured
              </span>
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex flex-wrap gap-2.5">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`size-14 sm:size-16 shadow-xs transition-all rounded-xl border-2 overflow-hidden bg-zinc-50 dark:bg-zinc-900 flex-shrink-0 cursor-pointer ${
                      activeImageIdx === idx
                        ? 'border-[#2b7fff] scale-95'
                        : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="object-contain w-full h-full p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details - Right Column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-bold rounded-full text-white text-[10px] px-2.5 py-0.5 shadow-sm ${
                  product.condition === 'new' ? 'bg-[#2b7fff]' : 'bg-orange-500'
                }`}>
                  {product.condition === 'new' ? 'New' : 'Used'}
                </span>
                <span className="font-medium text-zinc-500 dark:text-zinc-400 text-xs">
                  SKU: JAI-{product._id?.substring(0, 8).toUpperCase() || 'PROD'}
                </span>
              </div>
              <h1 className="leading-snug font-bold text-2xl sm:text-3xl tracking-tight text-zinc-900 dark:text-white">
                {product.name}
              </h1>
              <div className="flex items-center gap-2">
                <div className="text-orange-500 flex items-center gap-0.5">
                  <Star className="size-4 fill-current" />
                  <Star className="size-4 fill-current" />
                  <Star className="size-4 fill-current" />
                  <Star className="size-4 fill-current" />
                  <StarHalf className="size-4 fill-current" />
                </div>
                <span className="font-semibold text-sm leading-5">4.5</span>
                <span className="text-zinc-500 dark:text-zinc-400 text-sm leading-5">
                  (128 reviews)
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-end gap-3 flex-wrap">
                <span className="font-bold text-[#2b7fff] text-3xl leading-9">
                  {formattedPrice}
                </span>
                {hasPrice && (
                  <>
                    <span className="line-through text-zinc-500 dark:text-zinc-400 text-lg leading-7 mb-1">
                      {formattedOriginalPrice}
                    </span>
                    <span className="rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold px-2.5 py-1 mb-1">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="leading-relaxed text-zinc-600 dark:text-zinc-400 text-sm">
                {product.description}
              </p>

              {/* Specifications Card */}
              <div className="grid grid-cols-2 gap-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl">
                <div className="flex p-2 items-center gap-2 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <Tag className="size-4 text-[#2b7fff] shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-zinc-400 dark:text-zinc-500 text-[10px]">Brand</span>
                    <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-200 truncate">{product.brand || 'JAYAMBE'}</span>
                  </div>
                </div>
                <div className="flex p-2 items-center gap-2 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <ShieldCheck className="size-4 text-[#2b7fff] shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-zinc-400 dark:text-zinc-500 text-[10px]">Condition</span>
                    <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-200 truncate">{product.condition === 'new' ? 'Brand New' : 'Used'}</span>
                  </div>
                </div>
                <div className="flex p-2 items-center gap-2 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <BadgeCheck className="size-4 text-[#2b7fff] shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-zinc-400 dark:text-zinc-500 text-[10px]">Warranty</span>
                    <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-200 truncate">{product.warranty || (product.condition === 'new' ? '1 Year' : '6 Months')}</span>
                  </div>
                </div>
                <div className="flex p-2 items-center gap-2 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <MapPin className="size-4 text-[#2b7fff] shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-zinc-400 dark:text-zinc-500 text-[10px]">Location</span>
                    <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-200 truncate">{product.location || 'Boisar'}</span>
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-medium text-sm text-zinc-600 dark:text-zinc-400">
                  Quantity
                </span>
                <div className="rounded-full border border-zinc-200 dark:border-zinc-800 flex p-1 items-center gap-3 bg-zinc-50 dark:bg-zinc-900">
                  <button
                    onClick={() => setQuantity(q => Math.max(product.stock > 0 ? 1 : 0, q - 1))}
                    disabled={quantity <= (product.stock > 0 ? 1 : 0)}
                    className="size-8 rounded-full flex items-center justify-center text-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="font-semibold text-center text-sm w-6">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock || 0, q + 1))}
                    disabled={quantity >= (product.stock || 0)}
                    className="size-8 rounded-full flex items-center justify-center text-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <span className="text-emerald-500 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" />
                  In Stock ({product.stock} units)
                </span>
              </div>
            </div>

            {/* CTA Actions */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleWhatsAppInquiry}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm px-6 py-3 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10 transition-colors"
                >
                  <MessageCircle className="size-4" />
                  Inquire on WhatsApp
                </button>
                <Link href="#inquiry-form" className="w-full">
                  <button className="w-full rounded-xl bg-[#2b7fff] hover:bg-[#1a6eeb] text-white font-bold text-sm px-6 py-3 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10 transition-colors">
                    <Send className="size-4" />
                    Send Inquiry
                  </button>
                </Link>
              </div>

              {/* Share & Favorite */}
              <div className="flex pt-2 items-center gap-3 w-full border-t border-zinc-200 dark:border-zinc-900">
                <span className="text-zinc-500 dark:text-zinc-400 text-xs">
                  Share:
                </span>
                <button
                  onClick={handleShare}
                  className="size-8 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <Share2 className="size-4" />
                </button>
                <button className="size-8 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 hover:text-red-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer ml-auto">
                  <Heart className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Info */}
        <div className="mt-16 space-y-6">
          <div className="border-b border-zinc-200 dark:border-zinc-800">
            <nav className="flex gap-8" aria-label="Tabs">
              {['description', 'specifications', 'reviews']
                .filter((tab) => tab !== 'reviews' || settings.enableReviews !== false)
                .map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-sm font-semibold capitalize border-b-2 transition-all cursor-pointer ${
                      activeTab === tab
                        ? 'border-[#2b7fff] text-[#2b7fff]'
                        : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
            </nav>
          </div>

          <div className="transition-all duration-300">
            {activeTab === 'description' && (
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4">
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                  About this Product
                </h3>
                <p className="leading-relaxed text-zinc-600 dark:text-zinc-400 text-sm whitespace-pre-line">
                  {product.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 pt-2 gap-3">
                  <div className="text-sm flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                    <CheckCircle2 className="size-4 text-[#2b7fff]" />
                    High energy conversion efficiency
                  </div>
                  <div className="text-sm flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                    <CheckCircle2 className="size-4 text-[#2b7fff]" />
                    Intelligent temperature cooling fan
                  </div>
                  <div className="text-sm flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                    <CheckCircle2 className="size-4 text-[#2b7fff]" />
                    Digital status monitoring output
                  </div>
                  <div className="text-sm flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                    <CheckCircle2 className="size-4 text-[#2b7fff]" />
                    Multi-layer electrical safety checks
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <div className="grid grid-cols-2 bg-zinc-50 dark:bg-zinc-900/50 text-sm border-b border-zinc-200 dark:border-zinc-800 p-3">
                    <span className="font-medium text-zinc-500 dark:text-zinc-400">Brand</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">{product.brand || 'JAYAMBE'}</span>
                  </div>
                  <div className="grid grid-cols-2 text-sm border-b border-zinc-200 dark:border-zinc-800 p-3">
                    <span className="font-medium text-zinc-500 dark:text-zinc-400">Condition</span>
                    <span className="font-semibold text-zinc-900 dark:text-white capitalize">{product.condition}</span>
                  </div>
                  <div className="grid grid-cols-2 bg-zinc-50 dark:bg-zinc-900/50 text-sm border-b border-zinc-200 dark:border-zinc-800 p-3">
                    <span className="font-medium text-zinc-500 dark:text-zinc-400">Warranty</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">{product.warranty || (product.condition === 'new' ? '1 Year' : '6 Months')}</span>
                  </div>
                  <div className="grid grid-cols-2 text-sm border-b border-zinc-200 dark:border-zinc-800 p-3">
                    <span className="font-medium text-zinc-500 dark:text-zinc-400">Location</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">{product.location || 'Boisar'}</span>
                  </div>
                  <div className="grid grid-cols-2 bg-zinc-50 dark:bg-zinc-900/50 text-sm p-3">
                    <span className="font-medium text-zinc-500 dark:text-zinc-400">Category</span>
                    <span className="font-semibold text-zinc-900 dark:text-white capitalize">{product.category?.name || 'Uncategorized'}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && settings.enableReviews !== false && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side: reviews list */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                    <span>Customer Reviews</span>
                    <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 px-2 py-0.5 rounded-full">
                      {(product.reviews || []).length}
                    </span>
                  </h3>

                  {(product.reviews && product.reviews.length > 0) ? (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                      {product.reviews.map((rev) => (
                        <div key={rev._id || rev.id} className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3 shadow-xs">
                          <div className="flex items-center gap-3">
                            <div className="size-9 font-black rounded-full bg-gradient-to-br from-indigo-500 to-[#2b7fff] text-white text-xs flex justify-center items-center">
                              {rev.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-zinc-900 dark:text-white">{rev.name}</span>
                              <div className="flex items-center gap-2">
                                <div className="text-orange-500 flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`size-3 ${
                                        star <= rev.rating ? 'fill-orange-500' : 'text-zinc-200 dark:text-zinc-800'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-[10px] text-zinc-400 font-medium">
                                  {new Date(rev.createdAt || rev.date).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed whitespace-pre-line italic">
                            "{rev.comment}"
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950">
                      <Star className="mx-auto size-8 text-zinc-300 dark:text-zinc-700 mb-3" />
                      <p className="text-sm font-semibold text-zinc-400 dark:text-zinc-500">No reviews yet. Be the first to share your experience!</p>
                    </div>
                  )}
                </div>

                {/* Right side: submission form */}
                <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4 shadow-sm self-start">
                  <div>
                    <h3 className="font-black text-lg text-zinc-900 dark:text-white">Write a Review</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Share your feedback about this product.</p>
                  </div>

                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Your Name</label>
                      <input
                        type="text"
                        required
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="e.g. Rahul Patel"
                        className="w-full text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#2b7fff] text-zinc-900 dark:text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Rating</label>
                      <div className="flex gap-1.5 items-center py-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="focus:outline-none transition-transform active:scale-95 cursor-pointer"
                          >
                            <Star
                              className={`size-6 ${
                                star <= reviewRating
                                  ? 'fill-orange-500 text-orange-550'
                                  : 'text-zinc-200 dark:text-zinc-805'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Comments</label>
                      <textarea
                        required
                        rows={4}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="What did you like or dislike about this product?"
                        className="w-full text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#2b7fff] text-zinc-900 dark:text-white resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full rounded-xl bg-[#2b7fff] hover:bg-[#1a6eeb] disabled:opacity-50 text-white font-bold text-sm py-3 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10 transition-colors"
                    >
                      {submittingReview ? 'Submitting…' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-zinc-200 dark:border-zinc-900 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
                  You May Also Like
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Related gear in {product.category?.name}</p>
              </div>
              <div className="flex gap-2">
                <button className="size-9 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer">
                  <ChevronLeft className="size-4" />
                </button>
                <button className="size-9 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer">
                  <ChevronRight className="size-4" />
                </button>
              </div>
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

        {/* Have a Question / Inquiry Form Banner */}
        <div id="inquiry-form" className="mt-16 relative bg-gradient-to-br from-[#2b7fff]/5 to-[#f97316]/5 dark:from-[#2b7fff]/10 dark:to-orange-500/10 shadow-lg backdrop-blur-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
            <div className="lg:col-span-5 space-y-4">
              <h2 className="font-bold text-2xl tracking-tight text-zinc-900 dark:text-white">
                Have a Question?
              </h2>
              <p className="leading-relaxed text-zinc-600 dark:text-zinc-400 text-sm">
                Send us an inquiry about this product and our team in Boisar will get back to you shortly.
              </p>
              <div className="flex pt-2 flex-col gap-3">
                <a href={`tel:${settings.phone || '+918879430925'}`} className="text-sm flex items-center gap-2 hover:text-[#2b7fff] transition-colors text-zinc-600 dark:text-zinc-300">
                  <Phone className="size-4 text-[#2b7fff]" />
                  {settings.phone || '+91 8879430925'}
                </a>
                <a href={`mailto:${settings.email || 'anandp4994@gmail.com'}`} className="text-sm flex items-center gap-2 hover:text-[#2b7fff] transition-colors text-zinc-600 dark:text-zinc-300">
                  <Mail className="size-4 text-[#2b7fff]" />
                  {settings.email || 'anandp4994@gmail.com'}
                </a>
                <div className="text-sm flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                  <MapPin className="size-4 text-[#2b7fff]" />
                  Boisar, Maharashtra
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800 p-6 rounded-2xl shadow-md space-y-4">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-xs text-zinc-500 dark:text-zinc-400">Name</label>
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2b7fff] text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-xs text-zinc-500 dark:text-zinc-400">Phone</label>
                    <input
                      type="tel"
                      placeholder="Your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2b7fff] text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-xs text-zinc-500 dark:text-zinc-400">Message</label>
                  <textarea
                    placeholder="Tell us about your requirement..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="min-h-28 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2b7fff] text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingInquiry}
                  className="rounded-xl bg-[#2b7fff] hover:bg-[#1a6eeb] text-white font-bold text-sm py-3 flex items-center justify-center gap-2 cursor-pointer w-full shadow-md shadow-blue-500/10 transition-colors disabled:opacity-50"
                >
                  <Send className="size-4" />
                  {submittingInquiry ? 'Submitting...' : 'Submit Inquiry'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
