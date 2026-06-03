import { NextResponse } from 'next/server';

export function proxy(request) {
  const token = request.cookies.get('admin_token')?.value;
  const { pathname } = request.nextUrl;

  // Protect all routes starting with /admin
  if (pathname.startsWith('/admin')) {
    // Exclude the login page from authentication check
    if (pathname === '/admin/login') {
      // If already authenticated, redirect to admin home page
      if (token) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // If no admin token cookie is present, redirect to the login page
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      // Optional: keep track of redirect origin
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Apply proxy to all admin routes
export const config = {
  matcher: ['/admin/:path*'],
};
