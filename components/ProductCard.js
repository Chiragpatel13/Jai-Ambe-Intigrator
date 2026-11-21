'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { normalizeImages, PLACEHOLDER_SVG } from '@/utils/imageHelper';

export default function ProductCard({ product, whatsappNumber = '918879430925' }) {
  const {
    _id,
    name,
    price,
    condition,
    description,
    availability,
    stock,
  } = product || {};

  const images = normalizeImages(product);
  const primaryImage = images.length > 0 ? images[0] : '';
  const [imgSrc, setImgSrc] = useState(primaryImage || PLACEHOLDER_SVG);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgSrc(primaryImage || PLACEHOLDER_SVG);
    setImgError(false);
  }, [primaryImage]);

  // Formatting price to Indian Rupees (INR)
  const formattedPrice = price && price > 0 ? new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price) : 'Ask for Price';

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

    const text = `Hello JAYAMBE INTEGRATORS, I am interested in inquiring about:
*Product:* ${name}
*Condition:* ${condition === 'new' ? 'Brand New' : 'Refurbished / Used'}
*Price:* ${formattedPrice}
*Link:* ${typeof window !== 'undefined' ? window.location.origin : ''}/products/${_id}

Please let me know if it is available.`;

    if (typeof window !== 'undefined') {
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc(PLACEHOLDER_SVG);
    }
  };

  return (
    <Card className="shadow-sm hover:shadow-md hover:border-[#2b7fff] transition-all duration-300 rounded-2xl p-0 gap-3 overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-full">
      <Link href={`/products/${_id}`} className="relative overflow-hidden aspect-[4/3] w-full bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-900 block cursor-pointer">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={name || 'Product'}
            onError={handleImageError}
            loading="lazy"
            className="h-full w-full object-contain p-2 transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-900 text-xs gap-1">
            <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>No Image Available</span>
          </div>
        )}

        {/* Condition Badge (Blue for New, Orange for Used) */}
        <span
          className={`font-bold rounded-full text-white text-[10px] absolute left-2 top-2 px-2.5 py-0.5 shadow-sm ${
            condition === 'new'
              ? 'bg-[#2b7fff]'
              : 'bg-orange-500'
          }`}
        >
          {condition === 'new' ? 'New' : 'Used'}
        </span>

        {/* Stock status badge */}
        {!availability || stock === 0 ? (
          <span className="font-bold rounded-full bg-rose-600 text-white text-[10px] absolute right-2 top-2 px-2 py-0.5 shadow-sm">
            SOLD OUT
          </span>
        ) : (
          stock <= 2 && (
            <span className="font-bold rounded-full bg-amber-500 text-white text-[10px] absolute right-2 top-2 px-2 py-0.5 shadow-sm">
              Only {stock} Left
            </span>
          )
        )}
      </Link>

      <div className="flex p-6 flex-col gap-3 flex-grow justify-between bg-white dark:bg-zinc-950">
        <div className="space-y-2">
          {product?.category && (
            <p className="text-[10px] font-bold tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
              {product.category.name}
            </p>
          )}
          <Link href={`/products/${_id}`} className="hover:underline block">
            <h4 className="font-semibold text-sm leading-snug text-zinc-900 dark:text-zinc-50 line-clamp-2 hover:text-[#2b7fff] dark:hover:text-[#2b7fff] transition-colors min-h-[40px]">
              {name}
            </h4>
          </Link>
          <p className="text-xs text-zinc-500 dark:text-zinc-450 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <p className="font-bold text-[#2b7fff] text-lg leading-7">
            {formattedPrice}
          </p>
          <Button
            onClick={handleWhatsAppInquiry}
            size="sm"
            className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white gap-1.5 py-2 font-semibold text-xs border-0"
          >
            <MessageSquare className="size-3.5" />
            Inquire Now
          </Button>
        </div>
      </div>
    </Card>
  );
}
