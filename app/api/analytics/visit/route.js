export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { recordVisit } from '@/lib/analytics';
import crypto from 'crypto';

const VISITOR_COOKIE = 'ja_visitor';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function newVisitorId() {
  return crypto.randomUUID();
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const pathname = typeof body.pathname === 'string' ? body.pathname : '/';

    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
      return NextResponse.json({ success: true, skipped: true });
    }

    const cookieStore = await cookies();
    let visitorId = cookieStore.get(VISITOR_COOKIE)?.value;

    const isNewCookie = !visitorId;
    if (!visitorId) {
      visitorId = newVisitorId();
    }

    const result = await recordVisit(visitorId, pathname);

    const response = NextResponse.json({
      success: true,
      ...result,
    });

    if (isNewCookie) {
      response.cookies.set(VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Analytics visit API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to record visit.' }, { status: 500 });
  }
}
