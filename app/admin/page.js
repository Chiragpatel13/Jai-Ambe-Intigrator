'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Laptop,
  Mail,
  PlusCircle,
  Settings,
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowUpRight,
  Database,
  Wifi,
  WifiOff,
  Activity,
  Users,
  Eye,
  BarChart3,
} from 'lucide-react';
import Loader from '@/components/Loader';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState(null); // null = checking
  const [dailyStats, setDailyStats] = useState([]);

  // Fetch stats
  useEffect(() => {
    fetch('/api/admin/stats', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
          setRecentInquiries(data.recentInquiries);
          setRecentProducts(data.recentProducts);
          setDailyStats(data.analytics?.dailyStats || []);
        }
      })
      .catch((err) => console.error('Error fetching stats:', err))
      .finally(() => setLoading(false));
  }, []);

  // Fetch DB status
  useEffect(() => {
    fetch('/api/admin/db-status', { cache: 'no-store' })
      .then((r) => r.json())
      .then(setDbStatus)
      .catch(() => setDbStatus({ connected: false, source: 'error' }));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader size="large" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Laptop,
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      glow: 'rgba(99,102,241,0.25)',
      link: '/admin/products',
      sub: 'In catalog',
    },
    {
      title: 'New Hardware',
      value: stats?.newProducts || 0,
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      glow: 'rgba(16,185,129,0.25)',
      link: '/admin/products?condition=new',
      sub: 'Brand new units',
    },
    {
      title: 'Used / Refurbished',
      value: stats?.usedProducts || 0,
      icon: Layers,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      glow: 'rgba(245,158,11,0.25)',
      link: '/admin/products?condition=used',
      sub: 'Refurbished stock',
    },
    {
      title: 'Pending Inquiries',
      value: stats?.pendingInquiries || 0,
      icon: Mail,
      gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      glow: 'rgba(236,72,153,0.25)',
      link: '/admin/inquiries',
      sub: 'Awaiting response',
    },
    {
      title: 'Total Visits',
      value: stats?.totalPageViews || 0,
      icon: Eye,
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
      glow: 'rgba(14,165,233,0.25)',
      link: '/admin',
      sub: 'All-time page views',
    },
    {
      title: 'Unique Visitors',
      value: stats?.totalUniqueVisitors || 0,
      icon: Users,
      gradient: 'linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)',
      glow: 'rgba(20,184,166,0.25)',
      link: '/admin',
      sub: 'Distinct people',
    },
    {
      title: "Today's Visits",
      value: stats?.todayPageViews || 0,
      icon: BarChart3,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      glow: 'rgba(139,92,246,0.25)',
      link: '/admin',
      sub: `${stats?.todayUniqueVisitors || 0} unique today`,
    },
  ];

  const maxDailyViews = Math.max(...dailyStats.map((d) => d.pageViews || 0), 1);

  const quickControls = [
    { label: 'Add New Product', icon: PlusCircle, href: '/admin/products?action=new', color: '#6366f1', bg: 'rgba(99,102,241,0.08)', hover: 'rgba(99,102,241,0.15)' },
    { label: 'Manage Categories', icon: Layers, href: '/admin/categories', color: '#10b981', bg: 'rgba(16,185,129,0.08)', hover: 'rgba(16,185,129,0.15)' },
    { label: 'Store Settings', icon: Settings, href: '/admin/settings', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', hover: 'rgba(245,158,11,0.15)' },
    { label: 'View Inquiries', icon: Mail, href: '/admin/inquiries', color: '#ec4899', bg: 'rgba(236,72,153,0.08)', hover: 'rgba(236,72,153,0.15)' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Dashboard Overview</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Real-time status of your store inventory and visitor inquiries.
          </p>
        </div>
      </div>

      {/* Firebase DB Status Banner */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-5 py-3.5 rounded-2xl border ${
          dbStatus === null
            ? 'bg-slate-50 border-slate-200'
            : dbStatus.connected
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-amber-50 border-amber-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              dbStatus === null
                ? 'bg-slate-200'
                : dbStatus.connected
                ? 'bg-emerald-500'
                : 'bg-amber-500'
            }`}
          >
            {dbStatus === null ? (
              <Activity size={15} className="text-slate-500 animate-pulse" />
            ) : dbStatus.connected ? (
              <Wifi size={15} className="text-white" />
            ) : (
              <WifiOff size={15} className="text-white" />
            )}
          </div>
          <div>
            <p className={`text-xs font-bold ${
              dbStatus === null ? 'text-slate-600' : dbStatus.connected ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              {dbStatus === null
                ? 'Checking Firebase connection...'
                : dbStatus.connected
                ? '✓ Firebase Firestore — Connected'
                : '⚠ Firebase Firestore — Unavailable (using mock data)'}
            </p>
            <p className={`text-[10px] font-medium mt-0.5 ${
              dbStatus === null ? 'text-slate-400' : dbStatus.connected ? 'text-emerald-600' : 'text-amber-600'
            }`}>
              {dbStatus === null
                ? 'Please wait...'
                : dbStatus.connected
                ? `Project: ${dbStatus.projectId} · Latency: ${dbStatus.latency}ms`
                : `Project: ${dbStatus.projectId} · ${dbStatus.error || 'Connection failed'}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Database size={14} className={dbStatus?.connected ? 'text-emerald-500' : 'text-amber-400'} />
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            dbStatus === null
              ? 'bg-slate-200 text-slate-500'
              : dbStatus.connected
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          }`}>
            {dbStatus === null ? 'CHECKING' : dbStatus.connected ? 'LIVE' : 'FALLBACK'}
          </span>
        </div>
      </div>

      {/* Stat Cards — 2 per row on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={card.link}
              className="group relative p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(circle at 80% 20%, ${card.glow} 0%, transparent 60%)` }}
              />
              <div className="relative">
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-2.5 sm:mb-4"
                  style={{ background: card.gradient }}
                >
                  <Icon size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">{card.value}</p>
                <p className="text-[11px] sm:text-xs font-bold text-slate-700 mt-1 leading-tight">{card.title}</p>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium mt-0.5 hidden sm:block">{card.sub}</p>
                <ArrowUpRight size={12} className="absolute top-0 right-0 text-slate-300 group-hover:text-slate-500 transition-colors sm:w-3.5 sm:h-3.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Visitor Analytics — last 7 days */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Visitor Analytics</h2>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Page views over the last 7 days</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-black text-slate-900">{stats?.todayPageViews || 0}</p>
            <p className="text-[10px] text-slate-400 font-semibold">views today</p>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 items-end h-28 sm:h-32">
          {dailyStats.map((day) => {
            const height = Math.max(12, Math.round(((day.pageViews || 0) / maxDailyViews) * 100));
            const label = new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' });
            return (
              <div key={day.date} className="flex flex-col items-center gap-1.5 min-w-0">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500">{day.pageViews || 0}</span>
                <div
                  className="w-full rounded-lg bg-gradient-to-t from-sky-500 to-indigo-400 transition-all"
                  style={{ height: `${height}%`, minHeight: '12px' }}
                  title={`${day.pageViews || 0} views · ${day.uniqueVisitors || 0} unique`}
                />
                <span className="text-[8px] sm:text-[9px] text-slate-400 font-semibold truncate w-full text-center">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Controls</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickControls.map((ctrl, idx) => {
            const Icon = ctrl.icon;
            return (
              <Link
                key={idx}
                href={ctrl.href}
                className="group flex items-center gap-2.5 p-3.5 sm:p-4 rounded-xl border border-slate-100 transition-all duration-200 hover:border-slate-200 hover:shadow-sm"
                style={{ background: ctrl.bg }}
                onMouseEnter={(e) => { e.currentTarget.style.background = ctrl.hover; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ctrl.bg; }}
              >
                <Icon size={16} style={{ color: ctrl.color }} />
                <span className="text-xs font-bold text-slate-700 leading-tight">{ctrl.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inquiries */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Mail size={15} className="text-pink-500" />
              Recent Inquiries
            </h3>
            <Link href="/admin/inquiries" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentInquiries.length > 0 ? (
              recentInquiries.map((inq) => (
                <div key={inq._id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                    >
                      {inq.customerName?.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-bold text-slate-800 truncate">{inq.customerName}</p>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          inq.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {inq.status === 'pending'
                            ? <span className="flex items-center gap-1"><Clock size={8} /> PENDING</span>
                            : <span className="flex items-center gap-1"><CheckCircle size={8} /> DONE</span>}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{inq.phone}</p>
                      <p className="text-[10px] text-slate-500 italic mt-1 line-clamp-1">"{inq.message}"</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">No recent inquiries.</div>
            )}
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Laptop size={15} className="text-indigo-500" />
              Recent Products
            </h3>
            <Link href="/admin/products" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentProducts.length > 0 ? (
              recentProducts.map((prod) => (
                <div key={prod._id} className="px-5 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                  <div className="w-11 h-11 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                    {prod.images?.length > 0 ? (
                      <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-[9px] font-bold">IMG</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{prod.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        prod.condition === 'new' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {prod.condition?.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {prod.price && prod.price > 0 ? `₹${prod.price.toLocaleString('en-IN')}` : 'Ask for Price'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">No products in catalog.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
