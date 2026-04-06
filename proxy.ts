import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { middleware as refreshSupabaseSession } from './lib/supabase/middleware';

const LINKEDIN_URL = process.env.NEXT_PUBLIC_LINKEDIN_URL;
const TITULO_URL = process.env.NEXT_PUBLIC_TITULO_URL;

function shouldSkipProxy(pathname: string) {
  return (
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico' ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt'
  );
}

export default async function proxy(request: NextRequest) {
  const { hostname, pathname } = request.nextUrl;

  if (shouldSkipProxy(pathname)) {
    return NextResponse.next();
  }

  if (hostname.startsWith('linkedin.')) {
    const destination = LINKEDIN_URL ?? new URL('/', request.url).toString();
    return NextResponse.redirect(destination, 308);
  }

  if (hostname.startsWith('titulo.')) {
    const destination = TITULO_URL ?? new URL('/', request.url).toString();
    return NextResponse.redirect(destination, 308);
  }

  return refreshSupabaseSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};