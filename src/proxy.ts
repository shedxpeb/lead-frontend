import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * This application uses localStorage JWT authentication.
 * The proxy (server-side) cannot read localStorage, so it cannot
 * determine authentication state server-side.
 *
 * Therefore, the proxy only handles basic routing redirects.
 * All authentication is handled client-side by AuthContext and AuthGate.
 */
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect root to login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow all public routes through without authentication check
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next();
  }

  // For all other routes (including protected routes like /dashboard),
  // let them through. AuthGate will handle authentication client-side.
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|api).*)'],
};
