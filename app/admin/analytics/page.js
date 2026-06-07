'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Eye,
  Users,
  Activity,
  Radio,
  RefreshCw,
  Clock,
  TrendingUp,
  Laptop,
  Globe,
  BarChart3,
} from 'lucide-react';
import Loader from '@/components/Loader';

function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function BarChart({ data, valueKey = 'views', labelKey = 'label', maxBars = 24, className = '' }) {
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  return (
    <div className={`flex items-end gap-1 sm:gap-1.5 h-36 sm:h-44 ${className}`}>
      {data.slice(-maxBars).map((item, idx) => {
        const val = item[valueKey] || 0;
        const height = Math.max(8, Math.round((val / max) * 100));
        return (
          <div key={item[labelKey] || idx} className="flex-1 min-w-0 flex flex-col items-center gap-1">
            <span className="text-[8px] sm:text-[9px] font-bold text-slate-500">{val}</span>
            <div
              className="w-full rounded-md bg-gradient-to-t from-indigo-600 to-sky-400 transition-all duration-500"
              style={{ height: `${height}%`, minHeight: '8px' }}
              title={`${item[labelKey]}: ${val}`}
            />
            <span className="text-[7px] sm:text-[8px] text-slate-400 font-semibold truncate w-full text-center">
              {item[labelKey]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function LineAreaChart({ data }) {
  const max = Math.max(...data.map((d) => d.pageViews || 0), 1);
  const w = 100;
  const h = 100;
  const points = data.map((d, i) => {
    const x = data.length === 1 ? w / 2 : (i / (data.length - 1)) * w;
    const y = h - ((d.pageViews || 0) / max) * (h - 8) - 4;
    return `${x},${y}`;
  });
  const area = `0,${h} ${points.join(' ')} ${w},${h}`;
  const line = points.join(' ');

  return (
    <div className="relative h-40 sm:h-48">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#areaGrad)" />
        <polyline
          points={line}
          fill="none"
          stroke="#4f46e5"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        {data.map((d, i) => {
          const x = data.length === 1 ? w / 2 : (i / (data.length - 1)) * w;
          const y = h - ((d.pageViews || 0) / max) * (h - 8) - 4;
          return <circle key={d.date} cx={x} cy={y} r="1.8" fill="#4f46e5" />;
        })}
      </svg>
      <div className="flex justify-between mt-2 text-[8px] sm:text-[9px] text-slate-400 font-semibold">
        {data.length > 0 && (
          <>
            <span>{new Date(data[0].date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
            <span>{new Date(data[data.length - 1].date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [live, setLive] = useState(true);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchAnalytics = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch(`/api/admin/analytics?t=${Date.now()}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success) {
        setData(json.analytics);
        setLastFetch(new Date());
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    if (!live) return undefined;
    const id = setInterval(() => fetchAnalytics(true), 5000);
    return () => clearInterval(id);
  }, [live, fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader size="large" />
      </div>
    );
  }

  const summaryCards = [
    {
      title: 'Total Page Views',
      value: data?.totalPageViews || 0,
      sub: 'All-time visits',
      icon: Eye,
      color: 'from-indigo-500 to-violet-600',
    },
    {
      title: 'Unique Visitors',
      value: data?.totalUniqueVisitors || 0,
      sub: 'Distinct people',
      icon: Users,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: "Today's Views",
      value: data?.todayPageViews || 0,
      sub: `${data?.todayUniqueVisitors || 0} unique today`,
      icon: TrendingUp,
      color: 'from-sky-500 to-blue-600',
    },
    {
      title: 'Live Now',
      value: data?.liveVisitors || 0,
      sub: 'Active last 5 min',
      icon: Radio,
      color: 'from-rose-500 to-pink-600',
      pulse: true,
    },
  ];

  const hourlyChart = (data?.hourlyStats || []).filter((h) => h.hour >= 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Website Analytics</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              REAL-TIME
            </span>
            {data?.source === 'firestore' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-[10px] font-bold text-indigo-700">
                <Activity size={10} />
                FIRESTORE DB
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Live visitor tracking, page views, product visits, and activity feed.
          </p>
          {lastFetch && (
            <p className="text-[10px] text-slate-400 mt-1 font-medium">
              Last updated: {formatTime(lastFetch.toISOString())}
              {refreshing && ' · Syncing...'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setLive((v) => !v)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
              live
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            {live ? 'Live ON' : 'Live OFF'}
          </button>
          <button
            type="button"
            onClick={() => fetchAnalytics()}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm"
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
                <Icon size={16} className="text-white" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">{card.value}</p>
              <p className="text-[11px] sm:text-xs font-bold text-slate-700 mt-1">{card.title}</p>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                {card.pulse && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                {card.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-indigo-500" />
            <div>
              <h2 className="text-sm font-bold text-slate-800">7-Day Traffic</h2>
              <p className="text-[10px] text-slate-400 font-medium">Daily page views trend</p>
            </div>
          </div>
          <LineAreaChart data={data?.dailyStats || []} />
          <div className="grid grid-cols-7 gap-1 mt-3">
            {(data?.dailyStats || []).map((day) => (
              <div key={day.date} className="text-center">
                <p className="text-[9px] font-bold text-slate-700">{day.pageViews || 0}</p>
                <p className="text-[8px] text-slate-400">
                  {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-sky-500" />
            <div>
              <h2 className="text-sm font-bold text-slate-800">Today by Hour</h2>
              <p className="text-[10px] text-slate-400 font-medium">Real-time hourly breakdown</p>
            </div>
          </div>
          <BarChart
            data={hourlyChart.map((h) => ({
              ...h,
              label: `${h.hour}`,
            }))}
            maxBars={24}
          />
        </div>
      </div>

      {/* 30-day overview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-violet-500" />
          <div>
            <h2 className="text-sm font-bold text-slate-800">30-Day Overview</h2>
            <p className="text-[10px] text-slate-400 font-medium">Monthly traffic pattern</p>
          </div>
        </div>
        <BarChart
          data={(data?.monthlyStats || []).map((d) => ({
            label: new Date(d.date).getDate().toString(),
            views: d.pageViews || 0,
          }))}
          maxBars={30}
          className="h-32 sm:h-36"
        />
      </div>

      {/* Top pages & products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Globe size={15} className="text-indigo-500" />
            <h2 className="text-sm font-bold text-slate-800">Top Pages</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {(data?.topPages || []).length > 0 ? (
              data.topPages.map((page, idx) => (
                <div key={page.path} className="px-4 sm:px-5 py-3.5 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-[10px] font-black text-slate-500 flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{page.label}</p>
                    <p className="text-[10px] text-slate-400 truncate">{page.path}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-indigo-600">{page.views}</p>
                    <p className="text-[9px] text-slate-400">{timeAgo(page.lastVisited)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-xs text-slate-400">No page data yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Laptop size={15} className="text-emerald-500" />
            <h2 className="text-sm font-bold text-slate-800">Top Products Visited</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {(data?.topProducts || []).length > 0 ? (
              data.topProducts.map((prod, idx) => (
                <div key={prod.productId} className="px-4 sm:px-5 py-3.5 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[10px] font-black text-emerald-600 flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{prod.productName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{prod.path}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-emerald-600">{prod.views}</p>
                    <p className="text-[9px] text-slate-400">{timeAgo(prod.lastVisited)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-xs text-slate-400">No product visits yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Live activity feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity size={15} className="text-rose-500" />
            <div>
              <h2 className="text-sm font-bold text-slate-800">Live Activity Feed</h2>
              <p className="text-[10px] text-slate-400 font-medium">Recent visits with timestamps</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-400 shrink-0">
            {(data?.recentVisits || []).length} events
          </span>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Time</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Page</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Product</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Visitor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(data?.recentVisits || []).map((visit) => (
                <tr key={visit.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 whitespace-nowrap">
                    <p className="font-semibold text-slate-700">{formatTime(visit.timestamp)}</p>
                    <p className="text-[10px] text-slate-400">{timeAgo(visit.timestamp)}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-bold text-slate-800">{visit.pageLabel}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{visit.pathname}</p>
                  </td>
                  <td className="px-5 py-3">
                    {visit.productName ? (
                      <span className="text-emerald-700 font-semibold">{visit.productName}</span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 font-mono text-[10px] text-slate-500">
                    {visit.visitorId?.slice(0, 8)}…
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-slate-50">
          {(data?.recentVisits || []).map((visit) => (
            <div key={visit.id} className="px-4 py-3.5 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-slate-800">{visit.pageLabel}</p>
                <span className="text-[10px] text-slate-400 shrink-0">{timeAgo(visit.timestamp)}</span>
              </div>
              <p className="text-[10px] text-slate-500">{formatTime(visit.timestamp)}</p>
              {visit.productName && (
                <p className="text-[10px] font-semibold text-emerald-600">Product: {visit.productName}</p>
              )}
              <p className="text-[9px] font-mono text-slate-400 truncate">{visit.pathname}</p>
            </div>
          ))}
        </div>

        {(data?.recentVisits || []).length === 0 && (
          <p className="py-12 text-center text-xs text-slate-400">
            No visits recorded yet. Browse the public site to see live data.
          </p>
        )}
      </div>
    </div>
  );
}
