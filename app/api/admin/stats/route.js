export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/utils/auth';
import { getProducts, getInquiries } from '@/lib/dbFirebase';
import { getAnalytics } from '@/lib/analytics';

export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    // Fetch products and inquiries using Firestore database helpers
    const productsRes = await getProducts({ limit: 1000 });
    const inquiriesRes = await getInquiries();

    const totalProducts = productsRes.total;
    const newProducts = productsRes.products.filter(p => p.condition === 'new').length;
    const usedProducts = productsRes.products.filter(p => p.condition === 'used').length;
    
    const totalInquiries = inquiriesRes.length;
    const pendingInquiries = inquiriesRes.filter(i => i.status === 'pending').length;

    const recentInquiries = inquiriesRes.slice(0, 5);
    const recentProducts = productsRes.products.slice(0, 5);
    const analytics = await getAnalytics();

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts,
        newProducts,
        usedProducts,
        totalInquiries,
        pendingInquiries,
        totalPageViews: analytics.totalPageViews,
        totalUniqueVisitors: analytics.totalUniqueVisitors,
        todayPageViews: analytics.todayPageViews,
        todayUniqueVisitors: analytics.todayUniqueVisitors,
      },
      analytics: {
        dailyStats: analytics.dailyStats,
      },
      recentInquiries,
      recentProducts,
    });
  } catch (error) {
    console.error('Admin stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to compile dashboard statistics.' },
      { status: 500 }
    );
  }
}
