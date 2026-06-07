'use client';

import { useState, useEffect } from 'react';
import {
  FileVideo,
  Image as ImageIcon,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import Loader from '@/components/Loader';
import { useLiveSync } from '@/hooks/useLiveSync';

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'image', 'video'
  const [activeMedia, setActiveMedia] = useState(null); // Active item for lightbox
  const [activeIdx, setActiveIdx] = useState(-1);

  const fetchGallery = (showLoader = true) => {
    fetch('/api/gallery', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setItems(data.items);
        }
      })
      .catch((err) => console.error('Error fetching gallery items:', err))
      .finally(() => {
        if (showLoader) setLoading(false);
      });
  };

  useEffect(() => {
    fetchGallery(true);
  }, []);

  useLiveSync(() => fetchGallery(false), ['gallery'], 12000);

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    return item.mediaType === filter;
  });

  const openLightbox = (item, idx) => {
    setActiveMedia(item);
    setActiveIdx(idx);
  };

  const closeLightbox = () => {
    setActiveMedia(null);
    setActiveIdx(-1);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (filteredItems.length <= 1) return;
    const nextIdx = (activeIdx + 1) % filteredItems.length;
    setActiveIdx(nextIdx);
    setActiveMedia(filteredItems[nextIdx]);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    if (filteredItems.length <= 1) return;
    const prevIdx = (activeIdx - 1 + filteredItems.length) % filteredItems.length;
    setActiveIdx(prevIdx);
    setActiveMedia(filteredItems[prevIdx]);
  };

  return (
    <div className="w-full min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      
      {/* 1. Header Banner */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
        {/* Decorative Gradients */}
        <div className="absolute top-0 left-1/4 size-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 size-96 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-10 lg:px-16 text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-[#2b7fff] border border-blue-100 dark:border-blue-900/50">
            Showcase
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-950 dark:text-white">
            Our Completed Projects
          </h1>
          <p className="text-[#71717b] dark:text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Take a look at our expert integrations in Palghar & Boisar. From complex CCTV security networks and intercom setups to VFD drives, custom electrical panels, and voltage stabilizers, we bring quality you can rely on.
          </p>
        </div>
      </section>

      {/* 2. Content & Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-16 py-12 space-y-8">
        
        {/* Filters Panel */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div className="flex items-center gap-2">
            {[
              { id: 'all', name: 'All Works' },
              { id: 'image', name: 'Photos' },
              { id: 'video', name: 'Videos & Demos' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filter === btn.id
                    ? 'bg-[#2b7fff] text-white shadow-md'
                    : 'bg-white dark:bg-zinc-900 text-[#71717b] dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                {btn.name}
              </button>
            ))}
          </div>

          <div className="text-xs text-[#71717b] dark:text-zinc-400 font-semibold">
            Showing {filteredItems.length} of {items.length} works
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader size="large" />
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, idx) => (
              <div
                key={item._id}
                onClick={() => openLightbox(item, idx)}
                className="group relative aspect-video w-full bg-zinc-950 rounded-3xl overflow-hidden hover:scale-[1.02] border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                {/* Media Container */}
                {item.mediaType === 'video' ? (
                  <>
                    <video
                      src={item.mediaUrl}
                      className="w-full h-full object-cover opacity-90"
                      preload="metadata"
                      muted
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="size-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="size-4 fill-current ml-0.5" />
                      </div>
                    </div>
                  </>
                ) : (
                  <img
                    src={item.mediaUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}

                {/* Media Badge Type */}
                <div className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-zinc-800 z-10">
                  {item.mediaType === 'video' ? <FileVideo size={12} /> : <ImageIcon size={12} />}
                  <span className="uppercase tracking-wider">{item.mediaType}</span>
                </div>

                {/* Hover Gradient Overlay showing Title */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="font-extrabold text-sm sm:text-base leading-snug text-white drop-shadow-md">
                    {item.title}
                  </h3>
                  <div className="text-[10px] text-zinc-300 font-semibold mt-1.5 flex items-center justify-between">
                    <span>PALGHAR, MH</span>
                    <span>
                      {new Date(item.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 rounded-3xl">
            <p className="text-sm font-semibold text-[#71717b] dark:text-zinc-400">
              No works match the selected filter. Check back again later.
            </p>
          </div>
        )}
      </section>

      {/* 3. Lightbox Overlay */}
      {activeMedia && (
        <div
          className="fixed inset-0 z-50 bg-zinc-950/95 flex flex-col justify-between p-4 sm:p-8 animate-fade-in"
          onClick={closeLightbox}
        >
          {/* Top Bar Actions */}
          <div className="w-full max-w-7xl mx-auto flex items-center justify-between text-white shrink-0">
            <div className="truncate pr-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/50 px-2.5 py-1 rounded-full border border-blue-900">
                {activeMedia.mediaType}
              </span>
              <h2 className="font-black text-lg sm:text-xl mt-1.5 truncate">{activeMedia.title}</h2>
            </div>
            <button
              onClick={closeLightbox}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-colors"
              title="Close Full Screen"
            >
              <X size={20} />
            </button>
          </div>

          {/* Media Core Player/Viewer */}
          <div className="w-full flex-grow flex items-center justify-center relative max-h-[70vh] my-4">
            {/* Left Nav */}
            {filteredItems.length > 1 && (
              <button
                onClick={handlePrev}
                className="absolute left-0 sm:left-4 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors hidden sm:block"
                title="Previous Showcase"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Media wrapper */}
            <div
              className="relative max-w-5xl max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 bg-black flex items-center justify-center aspect-video w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {activeMedia.mediaType === 'video' ? (
                <video
                  src={activeMedia.mediaUrl}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={activeMedia.mediaUrl}
                  alt={activeMedia.title}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Right Nav */}
            {filteredItems.length > 1 && (
              <button
                onClick={handleNext}
                className="absolute right-0 sm:right-4 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors hidden sm:block"
                title="Next Showcase"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Bottom Bar Info / Caption */}
          <div className="w-full max-w-4xl mx-auto text-center text-white shrink-0 space-y-3">
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              {activeMedia.description || 'No project description added.'}
            </p>
            <div className="text-[10px] text-zinc-500 font-bold">
              PROJECT GALLERY &bull; JAYAMBE INTEGRATORS
            </div>
            
            {/* Mobile swipe indicator/controls */}
            <div className="flex justify-center items-center gap-6 sm:hidden pt-2">
              <button
                onClick={handlePrev}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl"
              >
                Prev
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
