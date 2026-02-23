import { NextRequest, NextResponse } from 'next/server';

const NOMBRE_COOKIE_SESION = '__session';
const RUTA_LOGIN_ADMIN = '/admin/login';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === RUTA_LOGIN_ADMIN || pathname.startsWith(`${RUTA_LOGIN_ADMIN}/`)) {
    return NextResponse.next();
  }

  const cookieSesion = request.cookies.get(NOMBRE_COOKIE_SESION)?.value;
  if (cookieSesion) {
    return NextResponse.next();
  }

  const loginUrl = new URL(RUTA_LOGIN_ADMIN, request.url);
  loginUrl.searchParams.set('next', `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*'],
};
