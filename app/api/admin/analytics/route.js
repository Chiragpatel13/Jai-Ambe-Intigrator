export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/utils/auth';
import { getDetailedAnalytics } from '@/lib/analytics';

export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const analytics = await getDetailedAnalytics();

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error('Admin analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to load analytics data.' },
      { status: 500 }
    );
  }
}
