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
  Database,
  Wifi,
  WifiOff,
  Activity,
  Users,
  Eye,
  BarChart3,
} from 'lucide-react';
import Loader from '@/components/Loader';
import {
  AdminPageHeader,
  AdminCard,
  AdminCardHeader,
  AdminStatCard,
  AdminBadge,
  AdminSectionLabel,
} from '@/components/admin/AdminUI';

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
    { title: 'Total Products', value: stats?.totalProducts || 0, icon: Laptop, accent: 'indigo', link: '/admin/products', sub: 'In catalog' },
    { title: 'New Hardware', value: stats?.newProducts || 0, icon: TrendingUp, accent: 'emerald', link: '/admin/products?condition=new', sub: 'Brand new units' },
    { title: 'Used / Refurbished', value: stats?.usedProducts || 0, icon: Layers, accent: 'amber', link: '/admin/products?condition=used', sub: 'Refurbished stock' },
    { title: 'Pending Inquiries', value: stats?.pendingInquiries || 0, icon: Mail, accent: 'rose', link: '/admin/inquiries', sub: 'Awaiting response' },
    { title: 'Total Visits', value: stats?.totalPageViews || 0, icon: Eye, accent: 'sky', link: '/admin/analytics', sub: 'All-time page views' },
    { title: 'Unique Visitors', value: stats?.totalUniqueVisitors || 0, icon: Users, accent: 'emerald', link: '/admin/analytics', sub: 'Distinct people' },
    { title: "Today's Visits", value: stats?.todayPageViews || 0, icon: BarChart3, accent: 'violet', link: '/admin/analytics', sub: `${stats?.todayUniqueVisitors || 0} unique today` },
  ];

  const maxDailyViews = Math.max(...dailyStats.map((d) => d.pageViews || 0), 1);

  const quickControls = [
    { label: 'Add Product', icon: PlusCircle, href: '/admin/products?action=new', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    { label: 'Categories', icon: Layers, href: '/admin/categories', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { label: 'Settings', icon: Settings, href: '/admin/settings', color: 'text-amber-700 bg-amber-50 border-amber-100' },
    { label: 'Inquiries', icon: Mail, href: '/admin/inquiries', color: 'text-rose-600 bg-rose-50 border-rose-100' },
    { label: 'Analytics', icon: BarChart3, href: '/admin/analytics', color: 'text-sky-600 bg-sky-50 border-sky-100' },
  ];

  return (
    <div className="space-y-7">
      <AdminPageHeader
        title="Dashboard Overview"
        subtitle="Real-time status of your store inventory, visitor analytics, and customer inquiries."
        badge={
          <AdminBadge variant="gold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            JayAmbe Integrators
          </AdminBadge>
        }
      />

      {/* Firebase DB Status */}
      <div
        className={`admin-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 !p-4 sm:!p-5 ${
          dbStatus === null
            ? ''
            : dbStatus.connected
            ? '!border-emerald-200/80 !bg-emerald-50/50'
            : '!border-amber-200/80 !bg-amber-50/50'
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

      <AdminSectionLabel>Store metrics</AdminSectionLabel>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card) => (
          <AdminStatCard key={card.title} {...card} />
        ))}
      </div>

      <Link href="/admin/analytics" className="block group">
        <AdminCard className="hover:!border-amber-300/50 transition-all group-hover:shadow-lg">
        <AdminCardHeader
          icon={BarChart3}
          title="Real-Time Analytics"
          subtitle="Live graphs, product visits & activity feed"
          iconClass="text-sky-600"
          action={
            <AdminBadge variant="live">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </AdminBadge>
          }
        />
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 items-end h-24 sm:h-28">
          {dailyStats.map((day) => {
            const height = Math.max(12, Math.round(((day.pageViews || 0) / maxDailyViews) * 100));
            const label = new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' });
            return (
              <div key={day.date} className="flex flex-col items-center gap-1.5 min-w-0">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500">{day.pageViews || 0}</span>
                <div
                  className="w-full rounded-lg bg-gradient-to-t from-sky-500 to-indigo-400 transition-all"
                  style={{ height: `${height}%`, minHeight: '12px' }}
                />
                <span className="text-[8px] sm:text-[9px] text-slate-400 font-semibold truncate w-full text-center">{label}</span>
              </div>
            );
          })}
        </div>
        <p className="text-xs font-semibold text-slate-600 mt-4 group-hover:text-amber-700 transition-colors">Open full analytics dashboard →</p>
        </AdminCard>
      </Link>

      <AdminCard>
        <AdminCardHeader icon={PlusCircle} title="Quick Actions" subtitle="Shortcuts to common admin tasks" iconClass="text-amber-600" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {quickControls.map((ctrl) => {
            const Icon = ctrl.icon;
            return (
              <Link
                key={ctrl.href}
                href={ctrl.href}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border text-center transition-all hover:shadow-md hover:-translate-y-0.5 ${ctrl.color}`}
              >
                <Icon size={18} />
                <span className="text-[11px] font-semibold leading-tight">{ctrl.label}</span>
              </Link>
            );
          })}
        </div>
      </AdminCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <AdminCard className="!p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100/90 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Mail size={15} className="text-rose-500" />
              Recent Inquiries
            </h3>
            <Link href="/admin/inquiries" className="text-xs font-semibold text-slate-600 hover:text-amber-700 flex items-center gap-0.5 transition-colors">
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
        </AdminCard>

        <AdminCard className="!p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100/90 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Laptop size={15} className="text-indigo-500" />
              Recent Products
            </h3>
            <Link href="/admin/products" className="text-xs font-semibold text-slate-600 hover:text-amber-700 flex items-center gap-0.5 transition-colors">
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
        </AdminCard>
      </div>
    </div>
  );
}
