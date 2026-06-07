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
  Download,
} from 'lucide-react';
import Loader from '@/components/Loader';
import {
  AdminPageHeader,
  AdminCard,
  AdminCardHeader,
  AdminStatCard,
  AdminBadge,
  AdminBtnPrimary,
  AdminBtnSecondary,
  adminSelectCls,
} from '@/components/admin/AdminUI';

const REPORT_OPTIONS = [
  { value: '7days', label: 'Last 7 Days' },
  { value: 'today', label: 'Today' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'Past Year' },
  { value: 'all', label: 'All Time' },
  { value: 'pickyear', label: 'Pick Year' },
  { value: 'custom', label: 'Custom Range (From – To)' },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoIso(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function yearOptions() {
  const current = new Date().getFullYear();
  const years = [];
  for (let y = current; y >= current - 5; y -= 1) {
    years.push(y);
  }
  return years;
}

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

function niceMax(value) {
  if (value <= 0) return 4;
  if (value <= 5) return 5;
  if (value <= 10) return 10;
  const mag = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / mag) * mag;
}

function YAxis({ max, ticks = 4, className = '' }) {
  const step = max / ticks;
  const labels = Array.from({ length: ticks + 1 }, (_, i) => Math.round(max - step * i));
  return (
    <div className={`flex flex-col justify-between text-[9px] sm:text-[10px] font-semibold text-slate-400 pr-2 ${className}`}>
      {labels.map((v) => (
        <span key={v}>{v}</span>
      ))}
    </div>
  );
}

function TrafficLineChart({ data }) {
  const max = niceMax(Math.max(...data.map((d) => d.pageViews || 0), 0));
  const padL = 32;
  const padR = 8;
  const padT = 8;
  const padB = 24;
  const w = 100;
  const h = 100;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;

  const points = data.map((d, i) => {
    const x = padL + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
    const y = padT + innerH - ((d.pageViews || 0) / max) * innerH;
    return { x, y, ...d };
  });

  const line = points.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `${padL},${padT + innerH} ${line} ${padL + innerW},${padT + innerH}`;

  return (
    <div className="flex gap-0">
      <YAxis max={max} className="h-44 sm:h-52 shrink-0" />
      <div className="flex-1 min-w-0">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-44 sm:h-52" preserveAspectRatio="none">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = padT + innerH * (1 - t);
            return (
              <line
                key={t}
                x1={padL}
                y1={y}
                x2={padL + innerW}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="0.3"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
          <defs>
            <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <polygon points={area} fill="url(#trafficGrad)" />
          <polyline
            points={line}
            fill="none"
            stroke="#4f46e5"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
          {points.map((p) => (
            <circle key={p.date} cx={p.x} cy={p.y} r="1.5" fill="#4f46e5" />
          ))}
        </svg>
        <div className="grid mt-1" style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}>
          {data.map((d) => (
            <div key={d.date} className="text-center min-w-0 px-0.5">
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-600">{d.pageViews || 0}</p>
              <p className="text-[8px] sm:text-[9px] text-slate-400 font-medium truncate">
                {new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HourlyBarChart({ data }) {
  const max = niceMax(Math.max(...data.map((d) => d.views || 0), 0));

  return (
    <div className="flex gap-0">
      <YAxis max={max} className="h-44 sm:h-52 shrink-0" />
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="relative h-44 sm:h-52 border-l border-b border-slate-200">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <div
              key={t}
              className="absolute left-0 right-0 border-t border-slate-100"
              style={{ bottom: `${t * 100}%` }}
            />
          ))}
          <div className="absolute inset-0 flex items-end gap-px px-0.5 pb-px">
            {data.map((item) => {
              const val = item.views || 0;
              const height = max > 0 ? Math.max(val > 0 ? 4 : 0, (val / max) * 100) : 0;
              return (
                <div
                  key={item.hour}
                  className="flex-1 min-w-0 flex flex-col justify-end h-full"
                  title={`${item.label}: ${val} views`}
                >
                  <div
                    className="w-full rounded-t-sm bg-gradient-to-t from-sky-600 to-indigo-400 transition-all duration-500"
                    style={{ height: `${height}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-12 mt-1.5 text-[8px] sm:text-[9px] text-slate-400 font-semibold">
          {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22].map((h) => (
            <span key={h} className="text-center col-span-1">
              {h.toString().padStart(2, '0')}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [live, setLive] = useState(true);
  const [reportPeriod, setReportPeriod] = useState('7days');
  const [reportFrom, setReportFrom] = useState(daysAgoIso(6));
  const [reportTo, setReportTo] = useState(todayIso());
  const [reportYear, setReportYear] = useState(String(new Date().getFullYear()));
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

  const handleDownloadReport = async () => {
    if (reportPeriod === 'custom' && reportFrom > reportTo) {
      alert('From date must be before or equal to To date.');
      return;
    }

    setDownloading(true);
    try {
      const params = new URLSearchParams({ period: reportPeriod });
      if (reportPeriod === 'custom') {
        params.set('from', reportFrom);
        params.set('to', reportTo);
      }
      if (reportPeriod === 'pickyear') {
        params.set('year', reportYear);
      }

      const res = await fetch(`/api/admin/analytics/report?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Download failed');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const slug =
        reportPeriod === 'custom'
          ? `${reportFrom}_to_${reportTo}`
          : reportPeriod === 'pickyear'
          ? `year-${reportYear}`
          : reportPeriod;
      a.download = `jayambe-analytics-${slug}-${todayIso()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Report download error:', err);
      alert(err.message || 'Failed to download report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader size="large" />
      </div>
    );
  }

  const summaryCards = [
    { title: 'Total Page Views', value: data?.totalPageViews || 0, sub: 'All-time visits', icon: Eye, accent: 'indigo' },
    { title: 'Unique Visitors', value: data?.totalUniqueVisitors || 0, sub: 'Distinct people', icon: Users, accent: 'emerald' },
    { title: "Today's Views", value: data?.todayPageViews || 0, sub: `${data?.todayUniqueVisitors || 0} unique today`, icon: TrendingUp, accent: 'sky' },
    { title: 'Live Now', value: data?.liveVisitors || 0, sub: 'Active last 5 min', icon: Radio, accent: 'rose' },
  ];

  const hourlyChart = data?.hourlyStats || [];

  return (
    <div className="space-y-7">
      <AdminPageHeader
        title="Website Analytics"
        subtitle="Live visitor tracking, page views, product visits, and activity feed."
        badge={
          <div className="flex flex-wrap items-center gap-2">
            <AdminBadge variant="live">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Real-time
            </AdminBadge>
            {data?.source === 'firestore' && (
              <AdminBadge variant="info">
                <Activity size={10} />
                Firestore
              </AdminBadge>
            )}
          </div>
        }
      >
        <AdminBtnSecondary onClick={() => setLive((v) => !v)}>
          {live ? 'Live ON' : 'Live OFF'}
        </AdminBtnSecondary>
        <AdminBtnSecondary onClick={() => fetchAnalytics()} disabled={refreshing}>
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </AdminBtnSecondary>
      </AdminPageHeader>

      {lastFetch && (
        <p className="text-[11px] text-slate-400 font-medium -mt-4">
          Last updated: {formatTime(lastFetch.toISOString())}
          {refreshing && ' · Syncing…'}
        </p>
      )}

      <AdminCard className="space-y-4">
        <AdminCardHeader
          icon={Download}
          title="Download Report"
          subtitle="Preset, year, or custom From–To range. Default: last 7 days."
          iconClass="text-amber-600"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Report Period
            </label>
            <select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className={adminSelectCls}
            >
              {REPORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {reportPeriod === 'pickyear' && (
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Year
              </label>
              <select
                value={reportYear}
                onChange={(e) => setReportYear(e.target.value)}
                className={adminSelectCls}
              >
                {yearOptions().map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          {reportPeriod === 'custom' && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  From Date
                </label>
                <input
                  type="date"
                  value={reportFrom}
                  max={reportTo}
                  onChange={(e) => setReportFrom(e.target.value)}
                  className={adminSelectCls}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  To Date
                </label>
                <input
                  type="date"
                  value={reportTo}
                  min={reportFrom}
                  max={todayIso()}
                  onChange={(e) => setReportTo(e.target.value)}
                  className={adminSelectCls}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-medium">
            {reportPeriod === 'custom' && (
              <>Range: <span className="font-bold text-slate-600">{reportFrom}</span> → <span className="font-bold text-slate-600">{reportTo}</span></>
            )}
            {reportPeriod === 'pickyear' && (
              <>Full year: <span className="font-bold text-slate-600">{reportYear}</span> (Jan 1 – Dec 31)</>
            )}
            {reportPeriod === 'all' && <>Includes all stored analytics data</>}
            {!['custom', 'pickyear', 'all'].includes(reportPeriod) && (
              <>Preset: <span className="font-bold text-slate-600">{REPORT_OPTIONS.find((o) => o.value === reportPeriod)?.label}</span></>
            )}
          </p>
          <AdminBtnPrimary
            onClick={handleDownloadReport}
            disabled={downloading}
            className="w-full sm:w-auto shrink-0"
          >
            <Download size={14} className={downloading ? 'animate-bounce' : ''} />
            {downloading ? 'Generating…' : 'Download CSV Report'}
          </AdminBtnPrimary>
        </div>
      </AdminCard>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {summaryCards.map((card) => (
          <AdminStatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <AdminCard>
          <AdminCardHeader icon={BarChart3} title="7-Day Traffic" subtitle="Daily page views with Y-axis scale" iconClass="text-indigo-600" />
          <TrafficLineChart data={data?.dailyStats || []} />
        </AdminCard>

        <AdminCard>
          <AdminCardHeader icon={Clock} title="Today by Hour" subtitle="24-hour breakdown (00–23)" iconClass="text-sky-600" />
          <HourlyBarChart data={hourlyChart} />
        </AdminCard>
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
