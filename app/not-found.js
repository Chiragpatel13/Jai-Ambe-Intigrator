'use client';

import Link from 'next/link';
import { Home, Laptop, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-24 bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="text-center space-y-6 max-w-md">
        {/* Error Illustration */}
        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full w-48 h-48 mx-auto -z-10" />
          <span className="text-9xl font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400 select-none animate-bounce">
            404
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white">
            Lost in Connection?
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            The page you are looking for has been moved, renamed, or is temporarily offline. Let us get you back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/10 transition-all hover:scale-[1.02]"
          >
            <Home size={16} />
            <span>Go to Homepage</span>
          </Link>
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 font-semibold text-sm transition-colors"
          >
            <Laptop size={16} />
            <span>Browse Products</span>
          </Link>
        </div>

        <div className="pt-8">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-450 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={12} />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
