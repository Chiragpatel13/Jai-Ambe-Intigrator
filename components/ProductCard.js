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
    <div className="group relative flex flex-col bg-white dark:bg-gray-950 rounded-2xl border border-gray-150 dark:border-gray-900 shadow-sm hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 overflow-hidden h-full">
      {/* Product Image Panel */}
      <div className="relative aspect-square w-full bg-gray-50 dark:bg-gray-900 overflow-hidden border-b border-gray-100 dark:border-gray-900/50">
        {images.length > 0 ? (
          <img
            src={images[currentImageIndex]}
            alt={name}
            className="h-full w-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-650 bg-gray-100 dark:bg-gray-900">
            No Image Available
          </div>
        )}

        {/* Condition Badge (Orange for New, Blue for Refurbished) */}
        <span
          className={`absolute top-3 left-3 z-10 inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase shadow-sm ${
            condition === 'new'
              ? 'bg-orange-500 text-white'
              : 'bg-blue-600 text-white'
          }`}
        >
          {condition === 'new' ? 'New' : 'Refurbished'}
        </span>

        {/* Stock status badge */}
        {!availability || stock === 0 ? (
          <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-600 text-white shadow-sm">
            SOLD OUT
          </span>
        ) : (
          stock <= 2 && (
            <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500 text-white shadow-sm">
              Only {stock} Left
            </span>
          )
        )}
      </div>

      {/* Product Content Details */}
      <div className="flex flex-col flex-1 p-5 space-y-2">
        <div className="flex justify-between items-center">
          {product.category && (
            <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400">
              {product.category.name}
            </span>
          )}
        </div>

        <Link href={`/products/${_id}`} className="hover:underline">
          <h4 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {name}
          </h4>
        </Link>

        <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 flex-1 leading-relaxed">
          {description}
        </p>

        <div className="pt-2 flex flex-col gap-3">
          <p className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400">
            {formattedPrice}
          </p>

          <Link
            href={`/products/${_id}`}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 transition-transform hover:scale-[1.01]"
          >
            <span>Inquire Now</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
