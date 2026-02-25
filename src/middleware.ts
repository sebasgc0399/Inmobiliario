import { NextRequest, NextResponse } from 'next/server';

const NOMBRE_COOKIE_SESION = '__session';

const RUTAS_PUBLICAS_ADMIN = [
  '/admin/login',
  '/admin/restablecer-contrasena',
] as const;

function esRutaPublicaAdmin(pathname: string): boolean {
  return RUTAS_PUBLICAS_ADMIN.some(
    (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (esRutaPublicaAdmin(pathname)) {
    return NextResponse.next();
  }

  const cookieSesion = request.cookies.get(NOMBRE_COOKIE_SESION)?.value;
  if (cookieSesion) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('next', `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*'],
};
