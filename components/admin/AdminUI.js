'use client';

import Link from 'next/link';

/* ── Shared class tokens ─────────────────────────────────────────────────── */
export const adminInputCls =
  'w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200/90 bg-white text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400/60 transition-all';

export const adminSelectCls =
  'w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200/90 bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400/60 transition-all';

export function AdminPageHeader({ title, subtitle, badge, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-1">
      <div className="min-w-0">
        {badge && <div className="mb-2">{badge}</div>}
        <h1 className="text-2xl sm:text-[1.65rem] font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-1.5 font-medium leading-relaxed max-w-2xl">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2 shrink-0">{children}</div>}
    </div>
  );
}

export function AdminCard({ children, className = '', padding = 'p-5 sm:p-6' }) {
  return (
    <div
      className={`admin-card ${padding} ${className}`}
    >
      {children}
    </div>
  );
}

export function AdminCardHeader({ icon: Icon, title, subtitle, action, iconClass = 'text-amber-600' }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-5">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-sm">
            <Icon size={16} className={iconClass} />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h2>
          {subtitle && <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function AdminStatCard({ title, value, sub, icon: Icon, href, accent = 'indigo' }) {
  const accents = {
    indigo: 'from-indigo-500 to-violet-600 shadow-indigo-500/20',
    emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/20',
    amber: 'from-amber-500 to-orange-600 shadow-amber-500/20',
    rose: 'from-rose-500 to-pink-600 shadow-rose-500/20',
    sky: 'from-sky-500 to-blue-600 shadow-sky-500/20',
    violet: 'from-violet-500 to-purple-600 shadow-violet-500/20',
  };
  const grad = accents[accent] || accents.indigo;

  const inner = (
    <div className="admin-stat-card group h-full">
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-lg`}>
          <Icon size={18} className="text-white" />
        </div>
        {href && (
          <span className="text-slate-300 group-hover:text-slate-500 transition-colors mt-0.5">↗</span>
        )}
      </div>
      <p className="text-2xl sm:text-[1.75rem] font-bold text-slate-900 tracking-tight tabular-nums">{value}</p>
      <p className="text-xs font-semibold text-slate-700 mt-1">{title}</p>
      {sub && <p className="text-[10px] text-slate-400 font-medium mt-0.5">{sub}</p>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {inner}
      </Link>
    );
  }
  return inner;
}

export function AdminBadge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-slate-100 text-slate-600 border-slate-200',
    live: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    gold: 'bg-amber-50 text-amber-800 border-amber-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
}

export function AdminBtnPrimary({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`admin-btn-primary ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function AdminBtnSecondary({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function AdminSectionLabel({ children }) {
  return (
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.14em] mb-3">{children}</p>
  );
}

export function AdminTableWrap({ children }) {
  return (
    <div className="admin-card overflow-hidden p-0">
      {children}
    </div>
  );
}
