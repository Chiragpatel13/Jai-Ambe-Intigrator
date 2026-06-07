export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/utils/jwt';
import { getAdminByUsername } from '@/lib/dbFirebase';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.username) {
      // Clear the stale/invalid cookie so the proxy doesn't block login
      const res = NextResponse.json({ authenticated: false }, { status: 401 });
      res.cookies.set('admin_token', '', { maxAge: 0, path: '/' });
      return res;
    }

    const admin = await getAdminByUsername(decoded.username);
    if (!admin) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: { id: admin._id, username: admin.username },
    });
  } catch (error) {
    console.error('Verify session API error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
