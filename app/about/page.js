'use client';

import { ShieldCheck, Award, ThumbsUp, MapPin, Landmark, Phone, Mail } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Hero Header */}
      <section className="text-center max-w-2xl mx-auto space-y-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-900 uppercase tracking-wide">
          About JAYAMBE INTEGRATORS
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950 dark:text-white tracking-tight">
          JAYAMBE INTEGRATORS
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
          Professional Service Centre led by **Er. Anand (EXTC Engineer)**. We specialize in system integrations, troubleshooting, and all types of electrical and electronic works.
        </p>
      </section>

      {/* Main Narrative & Visiting Card Data */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Our Core Offerings & Services
          </h2>
          <p className="text-sm text-gray-650 dark:text-gray-400 leading-relaxed">
            As detailed on our official business card, JAYAMBE INTEGRATORS provides high-quality sales, integration, and repair services for:
          </p>
          
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-semibold text-gray-850 dark:text-gray-200">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              CCTV Systems
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Intercom Systems
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              VFD Drives
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Control Panels
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Geysers & Stabilizers
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Microwaves & Inductions
            </li>
            <li className="flex items-center gap-2 sm:col-span-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Troubleshooting & All Types of Electrical/Electronic Works
            </li>
          </ul>

          <div className="flex gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-3.5 py-2 rounded-xl">
              <Landmark size={14} />
              <span>EXTC Engineer Led</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3.5 py-2 rounded-xl">
              <ShieldCheck size={14} />
              <span>Genuine Spares Only</span>
            </div>
          </div>
        </div>
        
        <div className="relative rounded-3xl overflow-hidden shadow-lg border border-gray-150 dark:border-gray-900 bg-zinc-50 dark:bg-zinc-900 p-6 sm:p-8 flex flex-col justify-between h-80 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-extrabold text-lg text-blue-600 dark:text-blue-400 tracking-tight">JAYAMBE INTEGRATORS</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">System Integrator</p>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900">
                Service Centre
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="text-xs text-zinc-855 dark:text-zinc-200">
                <p className="font-bold">Er. Anand</p>
                <p className="text-[10px] text-zinc-500 font-medium">EXTC ENGINEER</p>
              </div>
              
              <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                <p className="flex items-center gap-1.5">
                  <Phone size={12} className="text-blue-600" />
                  +91 8879430925 / 8855070925
                </p>
                <p className="flex items-center gap-1.5">
                  <Mail size={12} className="text-blue-600" />
                  anandp4994@gmail.com
                </p>
                <p className="flex items-start gap-1.5 leading-relaxed">
                  <MapPin size={12} className="text-blue-600 mt-0.5 shrink-0" />
                  <span>Office: Mahavir Nagar, Shop No. 28, Navapur Road, Near to UCO Bank, Boisar (W).</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 flex justify-between items-center text-[10px] font-bold text-zinc-400">
            <span>Authorized Brands: Gelco | Crompton | Altech</span>
            <span>Est. 2018</span>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Authorized Brands We Support
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            We provide official support and integrate genuine parts from these leading manufacturers:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'GELCO ELECTRONICS',
              desc: 'Premium voltage stabilizers, single phase preventers, motor starters, and electrical protection devices.',
              icon: Award,
            },
            {
              title: 'Crompton Greaves',
              desc: 'High-efficiency geysers, domestic water pumps, fan systems, and household electrical appliances.',
              icon: ThumbsUp,
            },
            {
              title: 'Altech',
              desc: 'Industrial quality spares, electrical terminal blocks, electronic connectors, and integration parts.',
              icon: ShieldCheck,
            },
          ].map((val, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-900 shadow-sm space-y-4"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
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
          <h3 className="text-xl font-bold text-gray-955 dark:text-white flex items-center gap-2">
            <MapPin className="text-blue-600" size={20} />
            Visit Our Service Centre
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Office: Mahavir Nagar, Shop No. 28, Navapur Road, Near to UCO Bank, Boisar (W), Palghar, Maharashtra.
          </p>
        </div>
        <div className="shrink-0 w-full md:w-auto">
          <a
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md"
          >
            Get Location & Directions
          </a>
        </div>
      </section>
    </div>
  );
}
