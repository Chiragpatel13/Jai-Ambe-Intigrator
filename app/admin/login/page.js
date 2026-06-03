'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Key, ArrowLeft } from 'lucide-react';
import Toast from '@/components/Toast';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const router = useRouter();

  const triggerToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      triggerToast('Please fill out all fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast('Login successful! Redirecting to panel...', 'success');
        
        // Push and refresh to ensure middleware gets new token cookie
        setTimeout(() => {
          router.push('/admin');
          router.refresh();
        }, 1000);
      } else {
        triggerToast(data.error || 'Invalid credentials.', 'error');
      }
    } catch (err) {
      console.error('Login request error:', err);
      triggerToast('Something went wrong. Please check your network.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gray-900 text-white relative">
      {/* Toast Alert */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Decorative backdrop glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500/10 blur-3xl w-[400px] h-[400px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-gray-950/80 backdrop-blur-md rounded-3xl border border-gray-800 shadow-2xl p-8 relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-2">
            <Lock size={22} />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Admin Console</h1>
          <p className="text-xs text-gray-500 font-semibold">Jai Ambe Intigrator control board</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-gray-800 bg-gray-900 text-white placeholder-gray-550 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <User size={14} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-gray-800 bg-gray-900 text-white placeholder-gray-550 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Key size={14} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-55"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="pt-2 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-450 hover:text-white transition-colors"
          >
            <ArrowLeft size={12} />
            <span>Return to Public Site</span>
          </a>
        </div>
      </div>
    </div>
  );
}
