import { NextResponse } from 'next/server';

/**
 * Next.js 16 uses proxy.js instead of middleware.js.
 * DO NOT create middleware.js alongside this file.
 *
 * Responsibilities:
 *  1. Protect all /admin/* routes — redirect to /admin/login if no session cookie.
 *  2. If already logged in, redirect /admin/login → /admin dashboard.
 *  3. Inject HTTP security headers on every matched response.
 */
export function proxy(request) {
  const token = request.cookies.get('admin_token')?.value;
  const { pathname } = request.nextUrl;

  // ─── Admin Route Guard ────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {

    if (pathname === '/admin/login') {
      // Do NOT redirect even if cookie exists — the token may be invalid/expired.
      // Let the login page handle "already authenticated" via /api/auth/me.
      return applySecurityHeaders(NextResponse.next());
    }

    // Protected admin page without any token cookie → redirect to login
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      const res = NextResponse.redirect(loginUrl);
      return applySecurityHeaders(res);
    }
  }

  // ─── All other routes: just pass through with security headers ───────────
  return applySecurityHeaders(NextResponse.next());
}

/**
 * Mutates a NextResponse to add standard HTTP security headers.
 * @param {NextResponse} res
 * @returns {NextResponse}
 */
function applySecurityHeaders(res) {
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  return res;
}

// Apply to all routes (not just /admin) so security headers are universal
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
