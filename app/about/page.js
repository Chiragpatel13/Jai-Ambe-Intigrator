'use client';

import { ShieldCheck, Award, ThumbsUp, MapPin, Landmark } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Hero Header */}
      <section className="text-center max-w-2xl mx-auto space-y-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900 uppercase tracking-wide">
          About Jai Ambe Intigrator
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950 dark:text-white tracking-tight">
          Delivering Reliable IT Hardware & Systems Since 2018
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
          Located in Boisar (Palghar, Maharashtra), we are dedicated to supplying authentic computer products, professional network layouts, and CCTV installations at honest prices.
        </p>
      </section>

      {/* Main Narrative & Image */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Our Mission: Tech Accessibility with Complete Trust
          </h2>
          <p className="text-sm text-gray-650 dark:text-gray-400 leading-relaxed">
            At Jai Ambe Intigrator, we understand that technology is critical for businesses, schools, and homes. However, brand new computer hardware can often be cost-prohibitive. That is why we specialize in both premium brand new devices and certified refurbished computers.
          </p>
          <p className="text-sm text-gray-650 dark:text-gray-400 leading-relaxed">
            Every refurbished laptop or desktop we sell goes through an intensive hardware inspection—testing battery health, CPU performance, display outputs, and storage speed. By combining affordable pricing with reliable shop warranties, we bring premium corporate-grade computers to the local community of Boisar and Palghar district.
          </p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-3.5 py-2 rounded-xl">
              <Landmark size={14} />
              <span>Palghar Local Business</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3.5 py-2 rounded-xl">
              <ShieldCheck size={14} />
              <span>Certified Stock</span>
            </div>
          </div>
        </div>
        <div className="relative rounded-3xl overflow-hidden shadow-lg aspect-video md:aspect-square bg-gray-100 dark:bg-gray-900 border border-gray-100 dark:border-gray-900">
          <img
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"
            alt="Hardware workshop"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Core Values */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Our Guiding Principles
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            How we do business every day at our Boisar outlet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Quality First, Always',
              desc: 'We never compromise on component health. If a refurbished device doesn’t meet our strict benchmarking requirements, it doesn’t hit the shelf.',
              icon: Award,
            },
            {
              title: 'Honest & Clear Pricing',
              desc: 'No hidden integration fees or diagnostic surcharges. We provide explicit itemized quotes for custom desktop builds, CCTV rigs, and networking services.',
              icon: ThumbsUp,
            },
            {
              title: 'Post-Sale Shop Warranty',
              desc: 'We stand by what we sell. Any product issue is serviced locally at our store, saving you weeks of shipping delays to standard factory hubs.',
              icon: ShieldCheck,
            },
          ].map((val, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-900 shadow-sm space-y-4"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <val.icon size={20} />
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">{val.title}</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-450 leading-relaxed">
                {val.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Location Callout */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gray-50 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-900 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-lg">
          <h3 className="text-xl font-bold text-gray-950 dark:text-white flex items-center gap-2">
            <MapPin className="text-indigo-600" size={20} />
            Located in Boisar, Maharashtra
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            We are centrally situated near Boisar railway station, making it convenient for customers from Palghar, Dahanu, Tarapur, and Safale to visit and inspect hardware.
          </p>
        </div>
        <div className="shrink-0 w-full md:w-auto">
          <a
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md"
          >
            Get Location & Directions
          </a>
        </div>
      </section>
    </div>
  );
}
