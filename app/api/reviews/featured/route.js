export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getFeaturedReviews } from '@/lib/dbFirebase';

export async function GET() {
  try {
    const reviews = await getFeaturedReviews();
    return NextResponse.json(
      { success: true, reviews },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('GET featured reviews error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured reviews.' },
      { status: 500 }
    );
  }
}
