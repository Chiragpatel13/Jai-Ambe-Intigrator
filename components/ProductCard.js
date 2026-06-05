'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ProductCard({ product, whatsappNumber = '918879430925' }) {
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

    const text = `Hello JAYAMBE INTEGRATORS, I am interested in inquiring about:
*Product:* ${name}
*Condition:* ${condition === 'new' ? 'Brand New' : 'Refurbished / Used'}
*Price:* ${formattedPrice}
*Link:* ${window.location.origin}/products/${_id}

Please let me know if it is available.`;

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <Card className="shadow-sm hover:shadow-md hover:border-[#2b7fff] transition-all duration-300 rounded-2xl p-0 gap-3 overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-full">
      <Link href={`/products/${_id}`} className="relative overflow-hidden aspect-[4/3] w-full bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-900 block cursor-pointer">
        {images.length > 0 ? (
          <img
            src={images[0]}
            alt={name}
            className="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-400 dark:text-zinc-650 bg-zinc-100 dark:bg-zinc-900 text-xs">
            No Image Available
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
          {product.category && (
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
