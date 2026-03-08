import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const NOMBRE_COOKIE_SESION = '__session';

function esSolicitudMismaOrigen(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) {
    return false;
  }

  return origin === new URL(request.url).origin;
}

export async function POST(request: Request) {
  if (!esSolicitudMismaOrigen(request)) {
    return NextResponse.json(
      { ok: false, error: 'Origen no permitido.' },
      { status: 403 },
    );
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: NOMBRE_COOKIE_SESION,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
