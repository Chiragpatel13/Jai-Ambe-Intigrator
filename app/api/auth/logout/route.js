import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
    // Delete the cookie via the response object — the only reliable method
    // in Next.js App Router API routes
    response.cookies.set('admin_token', '', {
      httpOnly: true,
      expires: new Date(0),
      maxAge: 0,
      path: '/',
    });
    return response;
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
