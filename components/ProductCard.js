'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, Eye, Award, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ProductCard({ product, whatsappNumber = '919890254321' }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    _id,
    name,
    price,
    condition,
    description,
    images = [],
    availability,
    stock,
  } = product;

  // Formatting price to Indian Rupees (INR)
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

  const handleWhatsAppInquiry = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Event Tracking for WhatsApp clicks
    try {
      if (typeof window !== 'undefined') {
        window.gtag?.('event', 'whatsapp_inquiry', {
          event_category: 'engagement',
          event_label: name,
        });
      }
    } catch (err) {}

    const text = `Hello Jai Ambe Intigrator, I am interested in inquiring about:
*Product:* ${name}
*Condition:* ${condition === 'new' ? 'Brand New' : 'Refurbished / Used'}
*Price:* ${formattedPrice}
*Link:* ${window.location.origin}/products/${_id}

Please let me know if it is available.`;

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const hasMultipleImages = images.length > 1;

  return (
    <div className="group relative flex flex-col bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm hover:shadow-xl hover:border-gray-200 dark:hover:border-gray-800 transition-all duration-300 overflow-hidden h-full">
      {/* Product Image Panel */}
      <div className="relative aspect-square w-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
        {images.length > 0 ? (
          <img
            src={images[currentImageIndex]}
            alt={name}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-900">
            No Image Available
          </div>
        )}

        {/* Condition Badge */}
        <span
          className={`absolute top-3 left-3 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
            condition === 'new'
              ? 'bg-emerald-500 text-white'
              : 'bg-amber-500 text-white'
          }`}
        >
          <Award size={12} />
          {condition === 'new' ? 'NEW' : 'USED / REFURBISHED'}
        </span>

        {/* Stock status badge */}
        {!availability || stock === 0 ? (
          <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500 text-white shadow-sm">
            <AlertTriangle size={12} />
            SOLD OUT
          </span>
        ) : (
          stock <= 2 && (
            <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-600 text-white shadow-sm">
              Only {stock} Left
            </span>
          )
        )}

        {/* Multi-image indicators */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(idx);
                }}
                className={`w-2 h-2 rounded-full border border-white/50 ${
                  currentImageIndex === idx ? 'bg-white scale-125' : 'bg-white/40'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex justify-between items-start gap-2 mb-2">
          {product.category && (
            <span className="text-xs font-semibold tracking-wide uppercase text-indigo-500">
              {product.category.name}
            </span>
          )}
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {formattedPrice}
          </span>
        </div>

        <Link href={`/products/${_id}`} className="hover:underline">
          <h4 className="text-base font-semibold text-gray-800 dark:text-gray-150 line-clamp-1 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {name}
          </h4>
        </Link>

        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2.5 mt-auto pt-2">
          <Link
            href={`/products/${_id}`}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors"
          >
            <Eye size={14} />
            <span>Details</span>
          </Link>

          {availability && stock > 0 ? (
            <button
              onClick={handleWhatsAppInquiry}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all hover:scale-[1.01]"
            >
              <MessageSquare size={14} />
              <span>WhatsApp</span>
            </button>
          ) : (
            <button
              disabled
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600 text-xs font-semibold cursor-not-allowed"
            >
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
