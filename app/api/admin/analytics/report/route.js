export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/utils/auth';
import { getAnalyticsReport, buildAnalyticsCsv } from '@/lib/analytics';

const PRESET_PERIODS = ['today', '7days', 'month', 'year', 'all', 'pickyear', 'custom'];

export async function GET(request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7days';
    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';
    const year = searchParams.get('year') || '';

    if (!PRESET_PERIODS.includes(period)) {
      return NextResponse.json({ error: 'Invalid period.' }, { status: 400 });
    }

    if (period === 'custom') {
      if (!from || !to) {
        return NextResponse.json({ error: 'From and To dates are required for custom range.' }, { status: 400 });
      }
      if (from > to) {
        return NextResponse.json({ error: 'From date must be before To date.' }, { status: 400 });
      }
    }

    if (period === 'pickyear' && !year) {
      return NextResponse.json({ error: 'Year is required.' }, { status: 400 });
    }

    const report = await getAnalyticsReport({ period, from, to, year });
    const csv = buildAnalyticsCsv(report);
    const slug =
      period === 'custom'
        ? `${from}_to_${to}`
        : period === 'pickyear'
        ? `year-${year}`
        : period;
    const filename = `jayambe-analytics-${slug}-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Analytics report API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate report.' },
      { status: 500 }
    );
  }
}
