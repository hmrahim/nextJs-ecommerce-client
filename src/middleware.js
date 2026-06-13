import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/orders',
  '/settings',
  '/checkout',
];

const AUTH_ROUTES = [
  '/auth/login',
  '/auth/register',
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // PERFORMANCE FIX:
  // Agey middleware PROTI page navigation e getToken() (JWT decode) chalato,
  // tai homepage / product / category / etc. route gulo te o slow hoye jeto.
  // Ekhn shudhu protected ba auth route hole tobei token check korbe.
  if (!isProtected && !isAuthRoute) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = !!token;

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Matcher narrow kora holo - shudhu jei route gulo guard korte hobe
// se gulo tei middleware run hobe. Static assets, _next, api, image etc. skip.
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/settings/:path*',
    '/checkout/:path*',
    '/auth/login',
    '/auth/register',
  ],
};
