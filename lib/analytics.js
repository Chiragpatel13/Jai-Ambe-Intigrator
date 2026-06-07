import { db } from './firebase';
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  orderBy,
  limit,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { getProductById } from './dbFirebase';

const SUMMARY_ID = 'summary';
const FIRESTORE_TIMEOUT_MS = 10000;
const LIVE_WINDOW_MS = 5 * 60 * 1000;

const mockAnalytics = {
  totalPageViews: 0,
  totalUniqueVisitors: 0,
  daily: {},
  pages: {},
  products: {},
  events: [],
  visitorIds: new Set(),
  visitorLastDate: {},
  visitors: {},
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function currentHour() {
  return new Date().getHours();
}

function pathToDocId(pathname) {
  return pathname.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 120) || 'home';
}

function parseProductId(pathname) {
  const match = pathname.match(/^\/products\/([^/]+)/);
  return match ? match[1] : null;
}

export function getPageLabel(pathname) {
  if (pathname === '/') return 'Home';
  if (pathname === '/products') return 'Products Catalog';
  if (pathname.startsWith('/products/')) return 'Product Detail';
  if (pathname === '/categories') return 'Categories';
  if (pathname === '/contact') return 'Contact';
  if (pathname === '/about') return 'About';
  if (pathname === '/gallery') return 'Gallery';
  return pathname;
}

function withTimeout(promise, ms = FIRESTORE_TIMEOUT_MS) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Analytics operation timed out.')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

function emptyDaily(date) {
  return { date, pageViews: 0, uniqueVisitors: 0, hourly: {} };
}

function getLastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function tsToIso(value) {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value?.toDate) return value.toDate().toISOString();
  return new Date(value).toISOString();
}

function formatHourly(hourly = {}) {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: `${hour.toString().padStart(2, '0')}:00`,
    views: hourly[hour] || hourly[String(hour)] || 0,
  }));
}

async function readSummaryFromFirestore() {
  const summaryRef = doc(db, 'analytics', SUMMARY_ID);
  const snap = await withTimeout(getDoc(summaryRef));
  if (!snap.exists()) {
    return { totalPageViews: 0, totalUniqueVisitors: 0, updatedAt: null };
  }
  const data = snap.data();
  return {
    totalPageViews: data.totalPageViews || 0,
    totalUniqueVisitors: data.totalUniqueVisitors || 0,
    updatedAt: tsToIso(data.updatedAt),
  };
}

async function readDailyFromFirestore(date) {
  const dailyRef = doc(db, 'analytics', `daily_${date}`);
  const snap = await withTimeout(getDoc(dailyRef));
  if (!snap.exists()) return emptyDaily(date);
  const data = snap.data();
  return {
    date,
    pageViews: data.pageViews || 0,
    uniqueVisitors: data.uniqueVisitors || 0,
    hourly: data.hourly || {},
  };
}

async function resolveProductName(productId) {
  if (!productId) return null;
  try {
    const product = await getProductById(productId);
    return product?.name || null;
  } catch {
    return null;
  }
}

export async function recordVisit(visitorId, pathname = '/') {
  if (!visitorId) return { success: false };

  const today = todayKey();
  const hour = currentHour();
  const pageLabel = getPageLabel(pathname);
  const productId = parseProductId(pathname);
  const productName = productId ? await resolveProductName(productId) : null;
  const now = Timestamp.now();

  try {
    const visitorRef = doc(db, 'analytics_visitors', visitorId);
    const summaryRef = doc(db, 'analytics', SUMMARY_ID);
    const dailyRef = doc(db, 'analytics', `daily_${today}`);
    const pageRef = doc(db, 'analytics_pages', pathToDocId(pathname));

    const visitorSnap = await withTimeout(getDoc(visitorRef));
    const isNewVisitor = !visitorSnap.exists();
    const lastVisitDate = visitorSnap.exists() ? visitorSnap.data().lastVisitDate : null;
    const isNewToday = lastVisitDate !== today;

    await withTimeout(
      setDoc(
        visitorRef,
        {
          lastSeen: now,
          lastVisitDate: today,
          lastPath: pathname,
          firstSeen: visitorSnap.exists() ? visitorSnap.data().firstSeen : now,
          visitCount: increment(1),
        },
        { merge: true }
      )
    );

    const summarySnap = await withTimeout(getDoc(summaryRef));
    if (!summarySnap.exists()) {
      await withTimeout(
        setDoc(summaryRef, {
          totalPageViews: 1,
          totalUniqueVisitors: 1,
          updatedAt: now,
        })
      );
    } else {
      await withTimeout(
        updateDoc(summaryRef, {
          totalPageViews: increment(1),
          ...(isNewVisitor ? { totalUniqueVisitors: increment(1) } : {}),
          updatedAt: now,
        })
      );
    }

    const dailySnap = await withTimeout(getDoc(dailyRef));
    if (!dailySnap.exists()) {
      await withTimeout(
        setDoc(dailyRef, {
          date: today,
          pageViews: 1,
          uniqueVisitors: 1,
          hourly: { [hour]: 1 },
          updatedAt: now,
        })
      );
    } else {
      await withTimeout(
        updateDoc(dailyRef, {
          pageViews: increment(1),
          ...(isNewToday ? { uniqueVisitors: increment(1) } : {}),
          [`hourly.${hour}`]: increment(1),
          updatedAt: now,
        })
      );
    }

    await withTimeout(
      setDoc(
        pageRef,
        {
          path: pathname,
          label: pageLabel,
          views: increment(1),
          lastVisited: now,
        },
        { merge: true }
      )
    );

    if (productId) {
      const productRef = doc(db, 'analytics_products', productId);
      await withTimeout(
        setDoc(
          productRef,
          {
            productId,
            productName: productName || 'Unknown Product',
            path: pathname,
            views: increment(1),
            lastVisited: now,
          },
          { merge: true }
        )
      );
    }

    await withTimeout(
      addDoc(collection(db, 'analytics_events'), {
        visitorId,
        pathname,
        pageLabel,
        productId: productId || null,
        productName: productName || null,
        timestamp: now,
        date: today,
        hour,
      })
    );

    return { success: true, isNewVisitor, isNewToday };
  } catch (err) {
    console.warn('[ANALYTICS] Firestore record failed, using in-memory fallback:', err.message);

    const isNewVisitor = !mockAnalytics.visitorIds.has(visitorId);
    mockAnalytics.visitorIds.add(visitorId);

    const lastVisitDate = mockAnalytics.visitorLastDate[visitorId];
    const isNewToday = lastVisitDate !== today;
    mockAnalytics.visitorLastDate[visitorId] = today;

    mockAnalytics.totalPageViews += 1;
    if (isNewVisitor) mockAnalytics.totalUniqueVisitors += 1;

    if (!mockAnalytics.daily[today]) {
      mockAnalytics.daily[today] = emptyDaily(today);
    }
    mockAnalytics.daily[today].pageViews += 1;
    if (isNewToday) mockAnalytics.daily[today].uniqueVisitors += 1;
    mockAnalytics.daily[today].hourly[hour] = (mockAnalytics.daily[today].hourly[hour] || 0) + 1;

    const pageKey = pathToDocId(pathname);
    if (!mockAnalytics.pages[pageKey]) {
      mockAnalytics.pages[pageKey] = { path: pathname, label: pageLabel, views: 0, lastVisited: null };
    }
    mockAnalytics.pages[pageKey].views += 1;
    mockAnalytics.pages[pageKey].lastVisited = new Date().toISOString();

    if (productId) {
      if (!mockAnalytics.products[productId]) {
        mockAnalytics.products[productId] = {
          productId,
          productName: productName || 'Unknown Product',
          path: pathname,
          views: 0,
          lastVisited: null,
        };
      }
      mockAnalytics.products[productId].views += 1;
      mockAnalytics.products[productId].lastVisited = new Date().toISOString();
    }

    mockAnalytics.visitors[visitorId] = {
      lastSeen: new Date().toISOString(),
      lastPath: pathname,
      visitCount: (mockAnalytics.visitors[visitorId]?.visitCount || 0) + 1,
    };

    mockAnalytics.events.unshift({
      id: `mock_${Date.now()}`,
      visitorId,
      pathname,
      pageLabel,
      productId: productId || null,
      productName: productName || null,
      timestamp: new Date().toISOString(),
      date: today,
      hour,
    });
    mockAnalytics.events = mockAnalytics.events.slice(0, 100);

    return { success: true, isNewVisitor, isNewToday, fallback: true };
  }
}

async function fetchTopPagesFromFirestore() {
  const snap = await withTimeout(getDocs(collection(db, 'analytics_pages')));
  const pages = [];
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    pages.push({
      path: data.path,
      label: data.label || getPageLabel(data.path),
      views: data.views || 0,
      lastVisited: tsToIso(data.lastVisited),
    });
  });
  return pages.sort((a, b) => b.views - a.views).slice(0, 10);
}

async function fetchTopProductsFromFirestore() {
  const snap = await withTimeout(getDocs(collection(db, 'analytics_products')));
  const products = [];
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    products.push({
      productId: data.productId || docSnap.id,
      productName: data.productName || 'Unknown Product',
      path: data.path,
      views: data.views || 0,
      lastVisited: tsToIso(data.lastVisited),
    });
  });
  return products.sort((a, b) => b.views - a.views).slice(0, 10);
}

async function fetchRecentEventsFromFirestore() {
  const q = query(
    collection(db, 'analytics_events'),
    orderBy('timestamp', 'desc'),
    limit(40)
  );
  const snap = await withTimeout(getDocs(q));
  const events = [];
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    events.push({
      id: docSnap.id,
      visitorId: data.visitorId,
      pathname: data.pathname,
      pageLabel: data.pageLabel || getPageLabel(data.pathname),
      productId: data.productId || null,
      productName: data.productName || null,
      timestamp: tsToIso(data.timestamp),
      date: data.date,
      hour: data.hour,
    });
  });
  return events;
}

async function fetchLiveVisitorCount() {
  const snap = await withTimeout(getDocs(collection(db, 'analytics_visitors')));
  const cutoff = Date.now() - LIVE_WINDOW_MS;
  let count = 0;
  snap.forEach((docSnap) => {
    const lastSeen = tsToIso(docSnap.data().lastSeen);
    if (lastSeen && new Date(lastSeen).getTime() >= cutoff) count += 1;
  });
  return count;
}

export async function getAnalytics() {
  const today = todayKey();
  const last7Days = getLastNDays(7);

  try {
    const summary = await readSummaryFromFirestore();
    const todayStats = await readDailyFromFirestore(today);
    const dailyStats = await Promise.all(last7Days.map((date) => readDailyFromFirestore(date)));

    return {
      ...summary,
      todayPageViews: todayStats.pageViews,
      todayUniqueVisitors: todayStats.uniqueVisitors,
      dailyStats,
    };
  } catch (err) {
    console.warn('[ANALYTICS] Firestore read failed, using in-memory fallback:', err.message);

    const todayStats = mockAnalytics.daily[today] || emptyDaily(today);
    const dailyStats = last7Days.map((date) => mockAnalytics.daily[date] || emptyDaily(date));

    return {
      totalPageViews: mockAnalytics.totalPageViews,
      totalUniqueVisitors: mockAnalytics.totalUniqueVisitors,
      todayPageViews: todayStats.pageViews,
      todayUniqueVisitors: todayStats.uniqueVisitors,
      dailyStats,
      fallback: true,
    };
  }
}

export const REPORT_PERIODS = {
  today: { days: 1, label: 'Today' },
  '7days': { days: 7, label: 'Last 7 Days' },
  month: { days: 30, label: 'This Month' },
  year: { days: 365, label: 'Past Year' },
  all: { label: 'All Time' },
  pickyear: { label: 'Pick Year' },
  custom: { label: 'Custom Range' },
};

function periodDates(period) {
  const config = REPORT_PERIODS[period];
  if (!config?.days) return getLastNDays(7);
  return getLastNDays(config.days);
}

function datesBetween(from, to) {
  if (!from || !to) return [];
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];

  const dates = [];
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
    if (dates.length > 3660) break;
  }
  return dates;
}

function datesForYear(year) {
  const y = parseInt(year, 10);
  if (Number.isNaN(y) || y < 2000 || y > 2100) return [];
  const from = `${y}-01-01`;
  const endOfYear = `${y}-12-31`;
  const today = todayKey();
  const to = endOfYear > today ? today : endOfYear;
  return datesBetween(from, to);
}

async function fetchAllDailyDatesFromFirestore() {
  const snap = await withTimeout(getDocs(collection(db, 'analytics')));
  const dates = [];
  snap.forEach((docSnap) => {
    if (docSnap.id.startsWith('daily_')) {
      dates.push(docSnap.id.replace('daily_', ''));
    }
  });
  dates.sort();
  return dates.length > 0 ? dates : getLastNDays(365);
}

function resolveReportDates({ period = '7days', from, to, year } = {}) {
  if (period === 'custom' && from && to) {
    return {
      dates: datesBetween(from, to),
      periodLabel: `${from} to ${to}`,
      from,
      to,
    };
  }

  if (period === 'pickyear' && year) {
    const dates = datesForYear(year);
    return {
      dates,
      periodLabel: `Year ${year}`,
      from: dates[0] || `${year}-01-01`,
      to: dates[dates.length - 1] || `${year}-12-31`,
      year: String(year),
    };
  }

  if (period === 'all') {
    return { dates: null, periodLabel: 'All Time', from: null, to: null };
  }

  const config = REPORT_PERIODS[period] || REPORT_PERIODS['7days'];
  const dates = periodDates(period);
  return {
    dates,
    periodLabel: config.label,
    from: dates[0],
    to: dates[dates.length - 1],
  };
}

function filterEventsByDates(events, dates) {
  const set = new Set(dates);
  return events.filter((e) => set.has(e.date));
}

async function fetchEventsForReport(dates) {
  const q = query(
    collection(db, 'analytics_events'),
    orderBy('timestamp', 'desc'),
    limit(500)
  );
  const snap = await withTimeout(getDocs(q));
  const events = [];
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    events.push({
      id: docSnap.id,
      visitorId: data.visitorId,
      pathname: data.pathname,
      pageLabel: data.pageLabel || getPageLabel(data.pathname),
      productId: data.productId || null,
      productName: data.productName || null,
      timestamp: tsToIso(data.timestamp),
      date: data.date,
      hour: data.hour,
    });
  });
  return filterEventsByDates(events, dates);
}

export async function getDetailedAnalytics() {
  const today = todayKey();
  const last7Days = getLastNDays(7);

  try {
    const summary = await readSummaryFromFirestore();
    const todayStats = await readDailyFromFirestore(today);
    const dailyStats7 = await Promise.all(last7Days.map((date) => readDailyFromFirestore(date)));

    const [topPages, topProducts, recentVisits, liveVisitors] = await Promise.all([
      fetchTopPagesFromFirestore(),
      fetchTopProductsFromFirestore(),
      fetchRecentEventsFromFirestore(),
      fetchLiveVisitorCount(),
    ]);

    return {
      ...summary,
      todayPageViews: todayStats.pageViews,
      todayUniqueVisitors: todayStats.uniqueVisitors,
      liveVisitors,
      dailyStats: dailyStats7,
      hourlyStats: formatHourly(todayStats.hourly),
      topPages,
      topProducts,
      recentVisits,
      lastUpdated: new Date().toISOString(),
      source: 'firestore',
    };
  } catch (err) {
    console.warn('[ANALYTICS] Detailed read failed, using in-memory fallback:', err.message);

    const todayStats = mockAnalytics.daily[today] || emptyDaily(today);
    const dailyStats7 = last7Days.map((date) => mockAnalytics.daily[date] || emptyDaily(date));

    const cutoff = Date.now() - LIVE_WINDOW_MS;
    const liveVisitors = Object.values(mockAnalytics.visitors).filter(
      (v) => v.lastSeen && new Date(v.lastSeen).getTime() >= cutoff
    ).length;

    return {
      totalPageViews: mockAnalytics.totalPageViews,
      totalUniqueVisitors: mockAnalytics.totalUniqueVisitors,
      todayPageViews: todayStats.pageViews,
      todayUniqueVisitors: todayStats.uniqueVisitors,
      liveVisitors,
      dailyStats: dailyStats7,
      hourlyStats: formatHourly(todayStats.hourly),
      topPages: Object.values(mockAnalytics.pages).sort((a, b) => b.views - a.views).slice(0, 10),
      topProducts: Object.values(mockAnalytics.products).sort((a, b) => b.views - a.views).slice(0, 10),
      recentVisits: mockAnalytics.events.slice(0, 40),
      lastUpdated: new Date().toISOString(),
      source: 'memory',
      fallback: true,
    };
  }
}

export async function getAnalyticsReport(options = {}) {
  const period = options.period || '7days';
  const today = todayKey();
  let resolved = resolveReportDates(options);

  try {
    if (period === 'all') {
      const allDates = await fetchAllDailyDatesFromFirestore();
      resolved = { ...resolved, dates: allDates, from: allDates[0], to: allDates[allDates.length - 1] };
    }

    const dates = resolved.dates || [];
    if (dates.length === 0) {
      throw new Error('No dates in selected range.');
    }

    const summary = await readSummaryFromFirestore();
    const dailyRows = await Promise.all(dates.map((date) => readDailyFromFirestore(date)));
    const todayStats = await readDailyFromFirestore(today);
    const [topPages, topProducts, visits] = await Promise.all([
      fetchTopPagesFromFirestore(),
      fetchTopProductsFromFirestore(),
      fetchEventsForReport(dates),
    ]);

    const periodPageViews = dailyRows.reduce((s, d) => s + (d.pageViews || 0), 0);
    const periodUniqueVisitors = dailyRows.reduce((s, d) => s + (d.uniqueVisitors || 0), 0);
    const singleDay = dates.length === 1 ? dates[0] : null;
    const singleDayStats = singleDay ? await readDailyFromFirestore(singleDay) : null;

    return {
      period,
      periodLabel: resolved.periodLabel,
      dateFrom: resolved.from,
      dateTo: resolved.to,
      generatedAt: new Date().toISOString(),
      summary: {
        ...summary,
        periodPageViews,
        periodUniqueVisitors,
        todayPageViews: todayStats.pageViews,
        todayUniqueVisitors: todayStats.uniqueVisitors,
      },
      dailyStats: dailyRows,
      hourlyStats:
        singleDay && singleDayStats ? formatHourly(singleDayStats.hourly) : null,
      topPages,
      topProducts,
      visits,
      source: 'firestore',
    };
  } catch (err) {
    console.warn('[ANALYTICS] Report read failed, using in-memory fallback:', err.message);

    if (period === 'all') {
      const allDates = Object.keys(mockAnalytics.daily).sort();
      resolved = {
        ...resolved,
        dates: allDates.length > 0 ? allDates : getLastNDays(365),
        from: allDates[0],
        to: allDates[allDates.length - 1],
      };
    }

    const dates = resolved.dates || [];
    const dailyRows = dates.map((date) => mockAnalytics.daily[date] || emptyDaily(date));
    const todayStats = mockAnalytics.daily[today] || emptyDaily(today);
    const visits = filterEventsByDates(mockAnalytics.events, dates);

    const periodPageViews = dailyRows.reduce((s, d) => s + (d.pageViews || 0), 0);
    const periodUniqueVisitors = dailyRows.reduce((s, d) => s + (d.uniqueVisitors || 0), 0);
    const singleDay = dates.length === 1 ? dates[0] : null;
    const singleDayStats = singleDay ? mockAnalytics.daily[singleDay] || emptyDaily(singleDay) : null;

    return {
      period,
      periodLabel: resolved.periodLabel,
      dateFrom: resolved.from,
      dateTo: resolved.to,
      generatedAt: new Date().toISOString(),
      summary: {
        totalPageViews: mockAnalytics.totalPageViews,
        totalUniqueVisitors: mockAnalytics.totalUniqueVisitors,
        periodPageViews,
        periodUniqueVisitors,
        todayPageViews: todayStats.pageViews,
        todayUniqueVisitors: todayStats.uniqueVisitors,
      },
      dailyStats: dailyRows,
      hourlyStats:
        singleDay && singleDayStats ? formatHourly(singleDayStats.hourly) : null,
      topPages: Object.values(mockAnalytics.pages).sort((a, b) => b.views - a.views).slice(0, 10),
      topProducts: Object.values(mockAnalytics.products).sort((a, b) => b.views - a.views).slice(0, 10),
      visits,
      source: 'memory',
      fallback: true,
    };
  }
}

export function buildAnalyticsCsv(report) {
  const lines = [];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

  lines.push('JAYAMBE INTEGRATORS - Website Analytics Report');
  lines.push(`Period,${esc(report.periodLabel)}`);
  if (report.dateFrom && report.dateTo) {
    lines.push(`From Date,${report.dateFrom}`);
    lines.push(`To Date,${report.dateTo}`);
  }
  lines.push(`Generated,${esc(new Date(report.generatedAt).toLocaleString('en-IN'))}`);
  lines.push('');

  lines.push('SUMMARY');
  lines.push('Metric,Value');
  lines.push(`Period Page Views,${report.summary.periodPageViews}`);
  lines.push(`Period Unique Visitors,${report.summary.periodUniqueVisitors}`);
  lines.push(`All-Time Page Views,${report.summary.totalPageViews}`);
  lines.push(`All-Time Unique Visitors,${report.summary.totalUniqueVisitors}`);
  lines.push(`Today Page Views,${report.summary.todayPageViews}`);
  lines.push(`Today Unique Visitors,${report.summary.todayUniqueVisitors}`);
  lines.push('');

  if (report.hourlyStats && report.dailyStats?.length === 1) {
    lines.push(`HOURLY BREAKDOWN (${report.dateFrom || 'single day'})`);
    lines.push('Hour,Page Views');
    report.hourlyStats.forEach((h) => {
      lines.push(`${esc(h.label)},${h.views}`);
    });
    lines.push('');
  } else {
    lines.push('DAILY BREAKDOWN');
    lines.push('Date,Page Views,Unique Visitors');
    report.dailyStats.forEach((d) => {
      lines.push(`${d.date},${d.pageViews || 0},${d.uniqueVisitors || 0}`);
    });
    lines.push('');
  }

  lines.push('TOP PAGES');
  lines.push('Rank,Page,Path,Views,Last Visited');
  report.topPages.forEach((p, i) => {
    lines.push(`${i + 1},${esc(p.label)},${esc(p.path)},${p.views},${esc(p.lastVisited || '')}`);
  });
  lines.push('');

  lines.push('TOP PRODUCTS');
  lines.push('Rank,Product,Path,Views,Last Visited');
  report.topProducts.forEach((p, i) => {
    lines.push(`${i + 1},${esc(p.productName)},${esc(p.path)},${p.views},${esc(p.lastVisited || '')}`);
  });
  lines.push('');

  lines.push('VISIT LOG');
  lines.push('Timestamp,Page,Path,Product,Visitor ID');
  report.visits.forEach((v) => {
    lines.push(
      `${esc(v.timestamp)},${esc(v.pageLabel)},${esc(v.pathname)},${esc(v.productName || '')},${esc(v.visitorId)}`
    );
  });

  return lines.join('\n');
}
