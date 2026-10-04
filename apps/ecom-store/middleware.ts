import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { routing } from './i18n/routing';
import { Role } from './lib/types/enum';

const intlMiddleware = createMiddleware(routing);

const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET_KEY!);

type SessionClaims = { user?: { id: string; role: Role } };

/** Landing page for a role once authenticated. */
function homeFor(role: Role | undefined) {
  if (role === Role.ADMIN) return '/admin';
  if (role === Role.ATHLETE) return '/athlete';
  return '/';
}

/** Verify the session cookie at the edge. Returns null when absent/invalid. */
async function readSession(
  request: NextRequest,
): Promise<SessionClaims | null> {
  const cookie = request.cookies.get('session')?.value;
  if (!cookie) return null;

  try {
    const { payload } = await jwtVerify<SessionClaims>(cookie, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only act on locale-prefixed paths; next-intl handles adding the prefix.
  const [, maybeLocale, ...rest] = pathname.split('/');
  const locale = routing.locales.find((l) => l === maybeLocale);
  if (!locale) return intlMiddleware(request);

  const segment = `/${rest.join('/')}`.replace(/\/$/, '') || '/';
  const redirectTo = (target: string) =>
    NextResponse.redirect(new URL(`/${locale}${target}`, request.url));

  // /account is the login page. An authenticated user never needs to render
  // it, so bounce at the edge instead of rendering the page just to redirect.
  if (segment === '/account') {
    const session = await readSession(request);
    if (session?.user) return redirectTo(homeFor(session.user.role));
    return intlMiddleware(request);
  }

  // Guard the dashboards here too, so an unauthorized request never pays for
  // a layout render before being turned away.
  if (segment === '/admin' || segment.startsWith('/admin/')) {
    const session = await readSession(request);
    if (!session?.user) return redirectTo('/account');
    if (session.user.role !== Role.ADMIN) return redirectTo('/');
  }

  if (segment === '/athlete' || segment.startsWith('/athlete/')) {
    const session = await readSession(request);
    if (!session?.user) return redirectTo('/account');
    if (session.user.role !== Role.ATHLETE) return redirectTo('/');
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/',
    '/(en|ar)/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|images|assets|partners|features|png|svg|jpg|jpeg|gif|webp).*)',
  ],
};
