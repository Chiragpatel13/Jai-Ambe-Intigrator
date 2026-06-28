'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  Cpu,
  Grid,
  Laptop,
  MapPin,
  Navigation,
  ShieldCheck,
  ShoppingCart,
  Star,
  Tag,
  Truck,
  Headset,
  Camera,
  Printer,
  Network,
  ChevronRight,
  Zap,
  User,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ProductCard from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/Loader';
import { useLiveSync } from '@/hooks/useLiveSync';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    shopName: 'JAYAMBE INTEGRATORS',
    phone: '+91 8879430925',
    whatsapp: '918879430925',
    address: 'Office: Mahavir Nagar, Shop No. 28, Navapur Road, Near to UCO Bank, Boisar (W).',
    banners: [],
    enableReviews: true,
  });
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [usedProducts, setUsedProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([
    {
      _id: 't1',
      name: 'Rohit Patil',
      rating: 5,
      comment: 'Bought a laptop here, great price and genuine product. Very trustworthy shop in Boisar!',
      avatar: 'https://images.unsplash.com/photo-1625241152315-4a698f74ceb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMG1hbiUyMGluZGlhbiUyMHNtaWxpbmd8ZW58MXwyfHx8MTc4MDQ3NjUyNnww&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
      _id: 't2',
      name: 'Sneha Joshi',
      rating: 5,
      comment: 'Excellent service and friendly staff. Got my home appliance at the best price. Highly recommend!',
      avatar: 'https://images.unsplash.com/photo-1732888878731-7e52999af144?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHdvbWFuJTIwaW5kaWFuJTIwc21pbGluZ3xlbnwxfDJ8fHwxNzgwNDc2NTI2fDA&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
      _id: 't3',
      name: 'Amit Sharma',
      rating: 5,
      comment: 'Reliable used products at fair prices. The team is honest and helpful. Will visit again soon.',
      avatar: 'https://images.unsplash.com/photo-1718209881007-c0ecdfc00f9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHByb2Zlc3Npb25hbCUyMGJ1c2luZXNzbWFufGVufDF8Mnx8fDE3ODQ0NzY1MjZ8MA&ixlib=rb-4.1.0&q=80&w=400',
    },
  ]);

  // Banner slider state
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerTimerRef = useRef(null);

  const startBannerTimer = (banners) => {
    if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
    if (banners.length > 1) {
      bannerTimerRef.current = setInterval(() => {
        setBannerIndex((i) => (i + 1) % banners.length);
      }, 4000);
    }
  };

  useEffect(() => {
    return () => { if (bannerTimerRef.current) clearInterval(bannerTimerRef.current); };
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        const banners = data.settings.banners || [];
        setBannerIndex(0);
        startBannerTimer(banners);
      }
    } catch (err) {
      console.warn('Error fetching settings:', err.message);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const res = await fetch(`/api/reviews/featured?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      const defaults = [
        {
          _id: 't1',
          name: 'Rohit Patil',
          rating: 5,
          comment: 'Bought a laptop here, great price and genuine product. Very trustworthy shop in Boisar!',
          avatar: 'https://images.unsplash.com/photo-1625241152315-4a698f74ceb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMG1hbiUyMGluZGlhbiUyMHNtaWxpbmd8ZW58MXwyfHx8MTc4MDQ3NjUyNnww&ixlib=rb-4.1.0&q=80&w=400',
        },
        {
          _id: 't2',
          name: 'Sneha Joshi',
          rating: 5,
          comment: 'Excellent service and friendly staff. Got my home appliance at the best price. Highly recommend!',
          avatar: 'https://images.unsplash.com/photo-1732888878731-7e52999af144?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHdvbWFuJTIwaW5kaWFuJTIwc21pbGluZ3xlbnwxfDJ8fHwxNzgwNDc2NTI2fDA&ixlib=rb-4.1.0&q=80&w=400',
        },
        {
          _id: 't3',
          name: 'Amit Sharma',
          rating: 5,
          comment: 'Reliable used products at fair prices. The team is honest and helpful. Will visit again soon.',
          avatar: 'https://images.unsplash.com/photo-1718209881007-c0ecdfc00f9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHByb2Zlc3Npb25hbCUyMGJ1c2luZXNzbWFufGVufDF8Mnx8fDE3ODQ0NzY1MjZ8MA&ixlib=rb-4.1.0&q=80&w=400',
        },
      ];

      if (data.success && data.reviews && data.reviews.length > 0) {
        const mapped = data.reviews.map((rev, idx) => ({
          _id: rev._id || rev.id,
          name: rev.name,
          rating: rev.rating,
          comment: rev.comment,
          productName: rev.productName,
          productId: rev.productId,
          avatar: [
            'https://images.unsplash.com/photo-1625241152315-4a698f74ceb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
            'https://images.unsplash.com/photo-1732888878731-7e52999af144?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
            'https://images.unsplash.com/photo-1718209881007-c0ecdfc00f9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
          ][idx % 3],
        }));

        if (mapped.length >= 3) {
          setTestimonials(mapped.slice(0, 3));
        } else {
          setTestimonials([...mapped, ...defaults.slice(mapped.length)]);
        }
      } else {
        setTestimonials(defaults);
      }
    } catch (err) {
      console.warn('Error fetching testimonials:', err.message);
    }
  };

  const fetchHomeData = async (showLoader = true) => {
    try {
      await fetchSettings();
      await fetchTestimonials();

      const categoriesRes = await fetch('/api/categories', { cache: 'no-store' });
      const categoriesData = await categoriesRes.json();
      if (categoriesData.success) {
        setCategories(categoriesData.categories);
      }

      const featuredRes = await fetch('/api/products?featured=true&limit=8', { cache: 'no-store' });
      const featuredData = await featuredRes.json();
      if (featuredData.success) {
        setFeaturedProducts(featuredData.products);
      }

      const newRes = await fetch('/api/products?condition=new&limit=4&daysLimit=30', { cache: 'no-store' });
      const newData = await newRes.json();
      if (newData.success) {
        setNewProducts(newData.products);
      }

      const usedRes = await fetch('/api/products?condition=used&limit=4', { cache: 'no-store' });
      const usedData = await usedRes.json();
      if (usedData.success) {
        setUsedProducts(usedData.products);
      }
    } catch (err) {
      console.warn('Error fetching home page data:', err.message);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData(true);
  }, []);

  useLiveSync(() => fetchHomeData(false), ['settings', 'products', 'categories'], 12000);

  const getCategoryIcon = (slug) => {
    switch (slug) {
      case 'cctv-intercom':
        return <Camera className="size-6 text-[#2b7fff]" />;
      case 'microwave-induction':
        return <Cpu className="size-6 text-[#2b7fff]" />;
      case 'geyser-stabilizer':
        return <Zap className="size-6 text-[#2b7fff]" />;
      case 'vfd-control-panel':
        return <Boxes className="size-6 text-[#2b7fff]" />;
      default:
        return <Cpu className="size-6 text-[#2b7fff]" />;
    }
  };

  const faqs = [
    {
      value: 'item-1',
      q: 'Do you sell both new and used products?',
      a: 'Yes, we offer a wide range of both brand-new and quality-checked used products at the best prices.',
    },
    {
      value: 'item-2',
      q: 'Where is your shop located?',
      a: `We are located in Boisar, Palghar, Maharashtra. Visit us at: ${settings.address}`,
    },
    {
      value: 'item-3',
      q: 'Do you provide warranty on products?',
      a: 'New products come with manufacturer warranty, and select used products carry a store warranty.',
    },
    {
      value: 'item-4',
      q: 'Can I inquire about a product on WhatsApp?',
      a: 'Absolutely! Click the WhatsApp button to chat with us directly about any product or price.',
    },
    {
      value: 'item-5',
      q: 'Do you offer home delivery?',
      a: 'Yes, we provide fast local delivery across Boisar and surrounding Palghar areas.',
    },
  ];

  return (
    <div className="bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 w-full min-h-screen overflow-x-hidden transition-colors duration-300">
      <main className="w-full flex flex-col items-center">

        {/* 1. HERO SECTION (w-full) */}
        <section className="w-full relative py-16 sm:py-24 overflow-hidden bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900">
          <div className="size-96 blur-3xl rounded-full bg-[#2b7fff]/10 absolute -left-20 top-0 pointer-events-none" />
          <div className="size-96 blur-3xl rounded-full bg-orange-500/10 absolute -right-10 bottom-0 pointer-events-none" />

          <div className="w-full px-4 sm:px-10 lg:px-16 relative grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
            <div className="flex flex-col gap-6">
              <span className="inline-flex font-semibold rounded-full bg-zinc-105 dark:bg-zinc-900 text-[#71717b] dark:text-zinc-400 text-xs leading-4 border border-zinc-200 dark:border-zinc-800 px-3 py-1 items-center gap-1.5 w-fit">
                <MapPin className="size-3.5 text-[#2b7fff]" />
                Boisar, Palghar, Maharashtra
              </span>
              <h1 className="leading-tight font-extrabold text-4xl sm:text-5xl tracking-tight text-zinc-900 dark:text-white">
                Trusted <span className="text-[#2b7fff]">Electrical, Electronic & CCTV</span> Integrations
              </h1>
              <p className="max-w-md text-[#71717b] dark:text-zinc-400 text-base leading-6">
                Your reliable local partner for CCTV systems, VFD drives, stabilizers, control panels, intercoms, and troubleshooting services in Boisar.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/products">
                  <Button
                    size="lg"
                    className="shadow-lg shadow-primary/20 transition-all rounded-xl bg-[#2b7fff] text-white hover:bg-[#2b7fff]/90 px-6 gap-2 border-0 cursor-pointer"
                  >
                    <ShoppingCart className="size-4" />
                    Shop Now
                  </Button>
                </Link>
                <Link href="/categories">
                  <Button
                    size="lg"
                    variant="outline"
                    className="transition-all rounded-xl text-orange-500 border-orange-500 hover:bg-orange-500/10 px-6 gap-2 cursor-pointer"
                  >
                    <Grid className="size-4" />
                    View Categories
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="bg-gradient-to-br from-[#2b7fff]/20 to-[#f97316]/20 blur-2xl rounded-3xl absolute inset-6" />
              <div className="relative shadow-2xl backdrop-blur-xl rounded-3xl bg-white/40 dark:bg-zinc-900/40 border border-white/20 dark:border-zinc-800 p-4 w-full max-w-lg overflow-hidden">
                <div className="rounded-2xl overflow-hidden aspect-square bg-zinc-50 dark:bg-zinc-900">
                  <img
                    src="/rebranded_hero_collage.png"
                    alt="Electrical Integration & Security Systems"
                    className="object-contain w-full h-full"
                  />
                </div>
                <div className="flex mt-4 px-2 justify-between items-center">
                  <div>
                    <p className="font-bold text-sm leading-5 text-zinc-900 dark:text-zinc-50">
                      CCTV & Control Systems
                    </p>
                    <p className="text-[#71717b] dark:text-zinc-400 text-xs leading-4 mt-0.5">
                      Professional installation & diagnostics
                    </p>
                  </div>
                </div>
              </div>
              <div className="shadow-lg rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex absolute -left-3 -bottom-3 px-3 py-2 items-center gap-2">
                <BadgeCheck className="size-5 text-green-600" />
                <span className="font-semibold text-xs leading-4 text-zinc-900 dark:text-zinc-50">
                  Verified Seller
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. STATS SECTION (w-full) */}
        <section className="w-full py-12 bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-900">
          <div className="w-full px-4 sm:px-10 lg:px-16 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-xs text-center rounded-2xl bg-[#2b7fff]/5 border border-[#2b7fff]/20 dark:border-[#2b7fff]/10 p-6 flex flex-col items-center justify-center gap-2">
              <p className="font-extrabold text-[#2b7fff] text-4xl leading-10">500+</p>
              <p className="font-medium text-[#71717b] dark:text-zinc-400 text-sm leading-5">Products</p>
            </Card>
            <Card className="shadow-xs text-center rounded-2xl bg-[#2b7fff]/5 border border-[#2b7fff]/20 dark:border-[#2b7fff]/10 p-6 flex flex-col items-center justify-center gap-2">
              <p className="font-extrabold text-[#2b7fff] text-4xl leading-10">1000+</p>
              <p className="font-medium text-[#71717b] dark:text-zinc-400 text-sm leading-5">Happy Customers</p>
            </Card>
            <Card className="shadow-xs text-center rounded-2xl bg-[#2b7fff]/5 border border-[#2b7fff]/20 dark:border-[#2b7fff]/10 p-6 flex flex-col items-center justify-center gap-2">
              <p className="font-extrabold text-[#2b7fff] text-4xl leading-10">5+</p>
              <p className="font-medium text-[#71717b] dark:text-zinc-400 text-sm leading-5">Years Experience</p>
            </Card>
            <Card className="shadow-xs text-center rounded-2xl bg-[#2b7fff]/5 border border-[#2b7fff]/20 dark:border-[#2b7fff]/10 p-6 flex flex-col items-center justify-center gap-2">
              <p className="font-extrabold text-[#2b7fff] text-4xl leading-10">100%</p>
              <p className="font-medium text-[#71717b] dark:text-zinc-400 text-sm leading-5">Trusted</p>
            </Card>
          </div>
        </section>

        {/* 3. CATEGORY GRID SECTION (w-full) */}
        {(!loading && categories.length === 0) ? null : (
          <section className="w-full py-16 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900">
            <div className="w-full px-4 sm:px-10 lg:px-16">
              <div className="text-center flex mb-12 flex-col items-center gap-1">
                <h2 className="font-bold text-3xl leading-9 tracking-tight text-zinc-900 dark:text-white">
                  Shop by Category
                </h2>
                <p className="text-[#71717b] dark:text-zinc-400 text-sm leading-5">
                  Find exactly what you need
                </p>
              </div>

              {loading ? (
                <div className="flex flex-wrap justify-center gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="w-[calc(50%-8px)] sm:w-[180px] h-[140px] rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-4">
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      href={`/products?category=${cat.slug}`}
                      className="flex flex-col items-center justify-center group cursor-pointer shadow-xs transition-all text-center rounded-2xl p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-[#2b7fff] dark:hover:border-[#2b7fff] hover:scale-[1.02] w-[calc(50%-8px)] sm:w-[180px] min-h-[140px]"
                    >
                      <div className="size-12 transition-colors rounded-xl bg-zinc-100 dark:bg-zinc-900 text-[#2b7fff] flex justify-center items-center group-hover:bg-[#2b7fff]/10 shrink-0">
                        {getCategoryIcon(cat.slug)}
                      </div>
                      <p className="font-semibold text-xs sm:text-sm leading-snug mt-3 text-zinc-900 dark:text-zinc-50 break-words w-full">
                        {cat.name}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* 4. FEATURED PRODUCTS (w-full) */}
        {(!loading && featuredProducts.length === 0) ? null : (
          <section className="w-full py-16 bg-zinc-50/30 dark:bg-zinc-900/10 border-b border-zinc-100 dark:border-zinc-900">
            <div className="w-full px-4 sm:px-10 lg:px-16">
              <div className="flex mb-10 justify-between items-end">
                <div className="flex flex-col gap-1">
                  <h2 className="font-bold text-3xl leading-9 tracking-tight text-zinc-900 dark:text-white">
                    Featured Products
                  </h2>
                  <p className="text-[#71717b] dark:text-zinc-400 text-sm leading-5">
                    Hand-picked deals for you
                  </p>
                </div>
                <Link
                  href="/products"
                  className="flex items-center gap-1 text-xs font-bold text-[#2b7fff] hover:underline"
                >
                  <span>View All</span>
                  <ChevronRight className="size-4" />
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {featuredProducts.slice(0, 8).map((prod) => (
                    <ProductCard
                      key={prod._id}
                      product={prod}
                      whatsappNumber={settings.whatsapp}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* 5. NEW ARRIVALS (w-full) */}
        {(!loading && newProducts.length === 0) ? null : (
          <section className="w-full py-16 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900">
            <div className="w-full px-4 sm:px-10 lg:px-16">
              <div className="space-y-1 mb-10">
                <h2 className="font-bold text-3xl leading-9 tracking-tight text-zinc-900 dark:text-white">
                  New Arrivals
                </h2>
                <p className="text-[#71717b] dark:text-zinc-400 text-sm leading-5">
                  Direct distributor brand new components and systems.
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {newProducts.slice(0, 3).map((prod) => (
                    <Card
                      key={prod._id}
                      className="shadow-xs hover:shadow-md transition-all rounded-2xl p-0 overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-full justify-between"
                    >
                      <Link href={`/products/${prod._id}`} className="relative overflow-hidden aspect-[16/10] w-full block cursor-pointer bg-zinc-50 dark:bg-zinc-900/30">
                        <img
                          src={prod.images?.[0] || 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400'}
                          alt={prod.name}
                          className="object-contain w-full h-full p-3 transition-transform duration-300 hover:scale-105"
                        />
                        <span className="font-bold rounded-full bg-[#2b7fff] text-blue-50 text-[10px] absolute left-2 top-2 px-2 py-0.5 shadow-sm">
                          New
                        </span>
                      </Link>
                      <div className="p-6 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-900/50">
                        <div className="flex justify-between items-start gap-4">
                          <div className="min-w-0 flex-1 space-y-2">
                            <Link href={`/products/${prod._id}`} className="hover:underline">
                              <p className="font-semibold text-sm leading-snug text-zinc-900 dark:text-zinc-50 hover:text-[#2b7fff] transition-colors whitespace-normal line-clamp-2 min-h-[40px]">
                                {prod.name}
                              </p>
                            </Link>
                            <p className="font-bold text-[#2b7fff] text-base leading-6">
                              {prod.price && prod.price > 0 ? (
                                new Intl.NumberFormat('en-IN', {
                                  style: 'currency',
                                  currency: 'INR',
                                  maximumFractionDigits: 0,
                                }).format(prod.price)
                              ) : (
                                'Ask for Price'
                              )}
                            </p>
                          </div>
                          <Link
                            href={`/products/${prod._id}`}
                            className="inline-flex items-center justify-center size-9 rounded-full text-[#2b7fff] border border-[#2b7fff] shrink-0 cursor-pointer hover:bg-[#2b7fff] hover:text-white transition-colors mt-0.5"
                          >
                            <ArrowRight className="size-4" />
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* 6. USED PRODUCTS (w-full) */}
        {(!loading && usedProducts.length === 0) ? null : (
          <section className="w-full py-16 bg-zinc-50/30 dark:bg-zinc-900/10 border-b border-zinc-100 dark:border-zinc-900">
            <div className="w-full px-4 sm:px-10 lg:px-16">
              <div className="space-y-1 mb-10">
                <h2 className="font-bold text-3xl leading-9 tracking-tight text-zinc-900 dark:text-white">
                  Used Products
                </h2>
                <p className="text-[#71717b] dark:text-zinc-400 text-sm leading-5">
                  Inspected, benchmarked, and warrantied local pre-owned stock.
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {usedProducts.slice(0, 3).map((prod) => (
                    <Card
                      key={prod._id}
                      className="shadow-xs hover:shadow-md transition-all rounded-2xl p-0 overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-full justify-between"
                    >
                      <Link href={`/products/${prod._id}`} className="relative overflow-hidden aspect-[16/10] w-full block cursor-pointer bg-zinc-50 dark:bg-zinc-900/30">
                        <img
                          src={prod.images?.[0] || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400'}
                          alt={prod.name}
                          className="object-contain w-full h-full p-3 transition-transform duration-300 hover:scale-105"
                        />
                        <span className="font-bold rounded-full bg-orange-500 text-white text-[10px] absolute left-2 top-2 px-2 py-0.5 shadow-sm">
                          Used
                        </span>
                      </Link>
                      <div className="p-6 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-900/50">
                        <div className="flex justify-between items-start gap-4">
                          <div className="min-w-0 flex-1 space-y-2">
                            <Link href={`/products/${prod._id}`} className="hover:underline">
                              <p className="font-semibold text-sm leading-snug text-zinc-900 dark:text-zinc-50 hover:text-orange-500 transition-colors whitespace-normal line-clamp-2 min-h-[40px]">
                                {prod.name}
                              </p>
                            </Link>
                            <p className="font-bold text-[#2b7fff] text-base leading-6">
                              {prod.price && prod.price > 0 ? (
                                new Intl.NumberFormat('en-IN', {
                                  style: 'currency',
                                  currency: 'INR',
                                  maximumFractionDigits: 0,
                                }).format(prod.price)
                              ) : (
                                'Ask for Price'
                              )}
                            </p>
                          </div>
                          <Link
                            href={`/products/${prod._id}`}
                            className="inline-flex items-center justify-center size-9 rounded-full text-orange-500 border border-orange-500 shrink-0 cursor-pointer hover:bg-orange-500 hover:text-white transition-colors mt-0.5"
                          >
                            <ArrowRight className="size-4" />
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* 7. WHY CHOOSE US (w-full) */}
        <section className="w-full py-16 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900">
          <div className="w-full px-4 sm:px-10 lg:px-16">
            <div className="text-center flex mb-12 flex-col items-center gap-1">
              <h2 className="font-bold text-3xl leading-9 tracking-tight text-zinc-900 dark:text-white">
                Why Choose Us
              </h2>
              <p className="text-[#71717b] dark:text-zinc-400 text-sm leading-5">
                Reasons our customers trust us
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-xs backdrop-blur-xl text-center rounded-2xl bg-white/40 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-3">
                <div className="size-12 rounded-xl bg-[#2b7fff]/10 text-[#2b7fff] flex mx-auto justify-center items-center">
                  <Cpu className="size-6" />
                </div>
                <p className="font-semibold text-sm leading-5 text-zinc-900 dark:text-zinc-50">
                  Expert Integration
                </p>
                <p className="text-[#71717b] dark:text-zinc-400 text-xs leading-4">
                  Professional VFD Drives and electrical control panel setup
                </p>
              </Card>
              <Card className="shadow-xs backdrop-blur-xl text-center rounded-2xl bg-white/40 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-3">
                <div className="size-12 rounded-xl bg-[#2b7fff]/10 text-[#2b7fff] flex mx-auto justify-center items-center">
                  <Zap className="size-6" />
                </div>
                <p className="font-semibold text-sm leading-5 text-zinc-900 dark:text-zinc-50">
                  Advanced Troubleshooting
                </p>
                <p className="text-[#71717b] dark:text-zinc-400 text-xs leading-4">
                  Specialized service center for microwaves, cooktops, geysers, and stabilizers
                </p>
              </Card>
              <Card className="shadow-xs backdrop-blur-xl text-center rounded-2xl bg-white/40 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-3">
                <div className="size-12 rounded-xl bg-[#2b7fff]/10 text-[#2b7fff] flex mx-auto justify-center items-center">
                  <Camera className="size-6" />
                </div>
                <p className="font-semibold text-sm leading-5 text-zinc-900 dark:text-zinc-50">
                  CCTV & Intercoms
                </p>
                <p className="text-[#71717b] dark:text-zinc-400 text-xs leading-4">
                  Full-scale security camera installation and intercom systems setup
                </p>
              </Card>
              <Card className="shadow-xs backdrop-blur-xl text-center rounded-2xl bg-white/40 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-3">
                <div className="size-12 rounded-xl bg-[#2b7fff]/10 text-[#2b7fff] flex mx-auto justify-center items-center">
                  <ShieldCheck className="size-6" />
                </div>
                <p className="font-semibold text-sm leading-5 text-zinc-900 dark:text-zinc-50">
                  Genuine Spares
                </p>
                <p className="text-[#71717b] dark:text-zinc-400 text-xs leading-4">
                  Authorized supply of premium electrical and electronic components
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* 7.5 BRANDS SECTION (w-full) */}
        <section className="w-full py-16 bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-900">
          <div className="w-full px-4 sm:px-10 lg:px-16">
            <div className="text-center flex mb-12 flex-col items-center gap-1">
              <h2 className="font-bold text-3xl leading-9 tracking-tight text-zinc-900 dark:text-white">
                Authorized & Supported Brands
              </h2>
              <p className="text-[#71717b] dark:text-zinc-400 text-sm leading-5">
                We service and integrate components from leading manufacturers
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center justify-center">
              {[
                { name: 'GELCO ELECTRONICS', desc: 'Voltage Stabilizers & Starters', logo: '/logo_gelco.png' },
                { name: 'Crompton Greaves', desc: 'Geysers & Home Appliances', logo: '/logo_crompton.png' },
                { name: 'Altech', desc: 'Industrial Quality Spares', logo: '/logo_altech.png' },
                { name: 'DELTA', desc: 'VFD Drives & Automation', logo: '/logo_delta.png' },
                { name: 'KPS', desc: 'Power Instrumentation', logo: '/logo_kps.png' },
                { name: 'SIGNAL', desc: 'Electronics & Signaling', logo: '/logo_signal.png' }
              ].map((brand, idx) => (
                <Card key={idx} className="shadow-xs hover:shadow-md transition-all rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col items-center justify-center text-center gap-2 h-36">
                  <div className="h-14 w-full flex items-center justify-center mb-1 bg-white rounded-xl p-1.5 border border-zinc-100 dark:border-zinc-800 shadow-inner">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium leading-tight">
                    {brand.desc}
                  </span>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 8. CUSTOMER REVIEWS (w-full) */}
        {settings.enableReviews !== false && (
          <section className="w-full py-16 bg-zinc-50/30 dark:bg-zinc-900/10 border-b border-zinc-100 dark:border-zinc-900">
            <div className="w-full px-4 sm:px-10 lg:px-16">
              <div className="text-center flex mb-12 flex-col items-center gap-1">
                <h2 className="font-bold text-3xl leading-9 tracking-tight text-zinc-900 dark:text-white">
                  Customer Reviews
                </h2>
                <p className="text-[#71717b] dark:text-zinc-400 text-sm leading-5">
                  What our happy customers say
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((rev) => (
                  <Card key={rev._id || rev.id} className="shadow-xs rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
                        <User className="size-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm leading-5 text-zinc-900 dark:text-zinc-50">
                          {rev.name}
                        </p>
                        <div className="text-orange-500 flex mt-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`size-3.5 ${
                                star <= rev.rating ? 'fill-current text-orange-500' : 'text-zinc-200 dark:text-zinc-800'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between gap-3">
                      <p className="text-[#71717b] dark:text-zinc-400 text-sm leading-relaxed italic">
                        "{rev.comment}"
                      </p>
                      {rev.productName && (
                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center text-[10px]">
                          <span className="text-zinc-400 dark:text-zinc-500">Reviewed for:</span>
                          <Link
                            href={`/products/${rev.productId}`}
                            className="font-bold text-indigo-500 hover:text-indigo-600 transition-colors truncate max-w-[150px]"
                          >
                            {rev.productName}
                          </Link>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 9. FAQs SECTION (w-full) */}
        <section className="w-full py-16 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900">
          <div className="w-full px-4 sm:px-10 lg:px-16">
            <h2 className="font-bold text-center text-3xl leading-9 tracking-tight mb-10 text-zinc-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <Accordion
              type="single"
              collapsible={true}
              className="max-w-2xl mx-auto w-full"
            >
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq.value}
                  value={faq.value}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 mb-3 px-4 bg-white dark:bg-zinc-950/40"
                >
                  <AccordionTrigger className="font-semibold text-sm leading-5 text-zinc-900 dark:text-zinc-50 border-0 hover:no-underline hover:text-[#2b7fff] transition-colors">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[#71717b] dark:text-zinc-400 text-sm leading-5 leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* 10. MAPS / DIRECTION SECTION (w-full) */}
        <section className="w-full py-16 pb-24 bg-zinc-50/30 dark:bg-zinc-900/10">
          <div className="w-full px-4 sm:px-10 lg:px-16">
            <div className="relative bg-gradient-to-br from-[#2b7fff] to-[#1e5bb8] shadow-xl text-center rounded-3xl text-blue-50 p-12 overflow-hidden">
              <div className="size-48 blur-2xl rounded-full bg-white/10 absolute -right-10 -top-10" />
              <h2 className="relative font-extrabold text-3xl leading-9">
                Visit Our Shop Today
              </h2>
              <p className="relative text-blue-50/90 text-sm leading-5 flex mt-2 justify-center items-center gap-1.5">
                <MapPin className="size-4" />
                Boisar, Palghar, Maharashtra
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.shopName + ' ' + settings.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-6"
              >
                <Button
                  size="lg"
                  className="relative shadow-lg rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-6 gap-2 border-0 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <Navigation className="size-4" />
                  Get Directions
                </Button>
              </a>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
