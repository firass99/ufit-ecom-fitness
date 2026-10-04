import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/',
    '/(en|ar)/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|images|assets|partners|features|png|svg|jpg|jpeg|gif|webp).*)',
  ],
};

/* import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { Role } from './lib/types/enum';

const intlMiddleware = createMiddleware(routing);

// Define protected routes and their allowed roles
const protectedRoutes = [
  {
    path: '',
    roles: [Role.ADMIN, Role.ATHLETE, Role.COACH, Role.NUTRITIONIST],
  },
  {
    path: '',
    roles: [Role.ADMIN],
  }
  // Add more protected routes as needed
];

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/produts', '/services', '/about', '/account'];

export async function middleware(request: NextRequest) {
  // First, handle internationalization
  const intlResponse = intlMiddleware(request);

  // Check if the current path needs protection
  const path = request.nextUrl.pathname;
  const locale = path.startsWith('/en') ? '/en' : path.startsWith('/ar') ? '/ar' : '';
  const pathWithoutLocale = locale ? path.substring(locale.length) : path;

  // Find if the current path matches any protected route pattern
  const matchedRoute = protectedRoutes.find(route =>
    pathWithoutLocale.startsWith(route.path)
  );

  if (!matchedRoute) {
    // Not a protected route, proceed with intl middleware
    return intlResponse;
  }

  // This is a protected route, check for session
  const sessionCookie = request.cookies.get('session');

  if (!sessionCookie?.value) {
    // No session found, redirect to login
    const loginUrl = new URL(locale ? `${locale}/` : '/', request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify the JWT token
    const secretKey = process.env.SESSION_SECRET_KEY!;
    const encodedKey = new TextEncoder().encode(secretKey);

    const { payload } = await jwtVerify(sessionCookie.value, encodedKey, {
      algorithms: ['HS256'],
    });

    // Check if user has the required role for this route
    const userRole = (payload as any).user?.role;
    if (matchedRoute.roles.includes(userRole as Role)) {
      // User has permission, proceed with the request
      return intlResponse;
    } else {
      // User doesn't have the required role
      // Redirect to dashboard or home based on their role
      const redirectUrl = new URL(locale ? `${locale}/` : '/', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    // Invalid token, redirect to login
    const loginUrl = new URL(locale ? `${locale}/` : '/', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/',
    '/(en|ar)/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|images|assets|partners|features|png|svg|jpg|jpeg|gif|webp).*)',
  ],
};
 */
