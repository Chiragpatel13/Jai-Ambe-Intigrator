import { db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  Timestamp,
} from 'firebase/firestore';

const SUMMARY_ID = 'summary';
const FIRESTORE_TIMEOUT_MS = 10000;

const mockAnalytics = {
  totalPageViews: 0,
  totalUniqueVisitors: 0,
  daily: {},
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function withTimeout(promise, ms = FIRESTORE_TIMEOUT_MS) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Analytics operation timed out.')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

function emptyDaily(date) {
  return { date, pageViews: 0, uniqueVisitors: 0 };
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

async function readSummaryFromFirestore() {
  const summaryRef = doc(db, 'analytics', SUMMARY_ID);
  const snap = await withTimeout(getDoc(summaryRef));
  if (!snap.exists()) {
    return { totalPageViews: 0, totalUniqueVisitors: 0 };
  }
  const data = snap.data();
  return {
    totalPageViews: data.totalPageViews || 0,
    totalUniqueVisitors: data.totalUniqueVisitors || 0,
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
  };
}

export async function recordVisit(visitorId, pathname = '/') {
  if (!visitorId) return { success: false };

  const today = todayKey();

  try {
    const visitorRef = doc(db, 'analytics_visitors', visitorId);
    const summaryRef = doc(db, 'analytics', SUMMARY_ID);
    const dailyRef = doc(db, 'analytics', `daily_${today}`);

    const visitorSnap = await withTimeout(getDoc(visitorRef));
    const isNewVisitor = !visitorSnap.exists();
    const lastVisitDate = visitorSnap.exists() ? visitorSnap.data().lastVisitDate : null;
    const isNewToday = lastVisitDate !== today;

    const now = Timestamp.now();

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
          updatedAt: now,
        })
      );
    } else {
      await withTimeout(
        updateDoc(dailyRef, {
          pageViews: increment(1),
          ...(isNewToday ? { uniqueVisitors: increment(1) } : {}),
          updatedAt: now,
        })
      );
    }

    return { success: true, isNewVisitor, isNewToday };
  } catch (err) {
    console.warn('[ANALYTICS] Firestore record failed, using in-memory fallback:', err.message);

    const isNewVisitor = !mockAnalytics.visitorIds?.has(visitorId);
    if (!mockAnalytics.visitorIds) mockAnalytics.visitorIds = new Set();
    mockAnalytics.visitorIds.add(visitorId);

    const lastVisitDate = mockAnalytics.visitorLastDate?.[visitorId];
    const isNewToday = lastVisitDate !== today;
    if (!mockAnalytics.visitorLastDate) mockAnalytics.visitorLastDate = {};
    mockAnalytics.visitorLastDate[visitorId] = today;

    mockAnalytics.totalPageViews += 1;
    if (isNewVisitor) mockAnalytics.totalUniqueVisitors += 1;

    if (!mockAnalytics.daily[today]) {
      mockAnalytics.daily[today] = emptyDaily(today);
    }
    mockAnalytics.daily[today].pageViews += 1;
    if (isNewToday) mockAnalytics.daily[today].uniqueVisitors += 1;

    return { success: true, isNewVisitor, isNewToday, fallback: true };
  }
}

export async function getAnalytics() {
  const today = todayKey();
  const last7Days = getLast7Days();

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
