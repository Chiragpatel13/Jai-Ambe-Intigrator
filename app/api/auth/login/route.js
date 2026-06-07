import { NextResponse } from 'next/server';
import { getAdminByUsername } from '@/lib/dbFirebase';
import { signToken } from '@/utils/jwt';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    const admin = await getAdminByUsername(username);

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    const token = signToken({ id: admin._id, username: admin.username });

    // Use NextResponse.cookies.set() — the only reliable way to set cookies
    // in Next.js App Router API routes. cookieStore.set() does NOT write
    // Set-Cookie response headers.
    const response = NextResponse.json({
      success: true,
      user: { id: admin._id, username: admin.username },
    });

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',   // 'strict' can block cookies on same-site navigations
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
