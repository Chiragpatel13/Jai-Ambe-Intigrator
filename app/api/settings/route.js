export const revalidate = 60;

import { NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/dbFirebase';
import { verifyAdminSession } from '@/utils/auth';

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(
      { success: true, settings },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('GET settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shop settings.' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const settings = await updateSettings(body);

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('PUT settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update shop settings.' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  return PUT(req);
}
