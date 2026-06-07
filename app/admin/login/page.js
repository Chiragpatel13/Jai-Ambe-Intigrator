'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Eye, EyeOff, Zap, ArrowRight, Shield } from 'lucide-react';
import Toast from '@/components/Toast';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        triggerToast('Login successful! Redirecting...', 'success');
        setTimeout(() => {
          router.push('/admin');
          router.refresh();
        }, 1000);
      } else {
        triggerToast(data.error || 'Invalid credentials.', 'error');
      }
    } catch {
      triggerToast('Something went wrong. Check your network.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0f172a' }}>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Left Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)' }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: '#818cf8' }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-15 blur-3xl"
          style={{ background: '#c084fc' }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <p className="font-black text-base text-white leading-none">Ambe Admin</p>
            <p className="text-[10px] text-indigo-300 font-semibold mt-0.5">JAYAMBE INTEGRATORS</p>
          </div>
        </div>

        {/* Center content */}
        <div className="relative space-y-6">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center mb-6"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <Shield size={30} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white leading-tight">
            Secure Admin<br />Control Panel
          </h1>
          <p className="text-indigo-300 text-sm font-medium leading-relaxed max-w-xs">
            Manage your hardware inventory, customer inquiries, and store settings — all in one place.
          </p>

          {/* Feature bullets */}
          <div className="space-y-3 pt-4">
            {[
              'Real-time inventory management',
              'Customer inquiry tracking',
              'Firebase-powered & secure',
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(99,102,241,0.4)' }}
                >
                  <ArrowRight size={10} className="text-white" />
                </div>
                <p className="text-xs text-indigo-200 font-medium">{feat}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative">
          <p className="text-[10px] text-indigo-400 font-semibold">
            © 2025 JayAmbe Integrators. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 relative">
        {/* Subtle glow behind form */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: '#6366f1' }}
        />

        <div className="relative w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              <Zap size={15} className="text-white" />
            </div>
            <p className="font-black text-sm text-white">Ambe Admin</p>
          </div>

          {/* Form header */}
          <div>
            <h2 className="text-2xl font-black text-white">Welcome back 👋</h2>
            <p className="text-sm text-slate-400 font-medium mt-1">
              Sign in to your admin account to continue.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={(e) => { e.target.style.background = 'rgba(255,255,255,0.08)'; }}
                  onBlur={(e) => { e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                />
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 text-sm rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={(e) => { e.target.style.background = 'rgba(255,255,255,0.08)'; }}
                  onBlur={(e) => { e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                />
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-60 mt-2"
              style={{
                background: loading
                  ? 'rgba(99,102,241,0.6)'
                  : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
              }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Back link */}
          <div className="text-center">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors font-medium"
            >
              ← Return to Public Site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
