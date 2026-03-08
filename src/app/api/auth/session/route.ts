import { obtenerAdminAuth } from '@/lib/firebase/admin';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const NOMBRE_COOKIE_SESION = '__session';
const DURACION_SESION_MS = 1 * 24 * 60 * 60 * 1000;
const DURACION_SESION_SEGUNDOS = DURACION_SESION_MS / 1000;

interface CuerpoSesion {
  idToken: string;
}

function esCuerpoSesionValido(cuerpo: unknown): cuerpo is CuerpoSesion {
  if (typeof cuerpo !== 'object' || cuerpo === null || !('idToken' in cuerpo)) {
    return false;
  }

  const idToken = (cuerpo as { idToken?: unknown }).idToken;
  return typeof idToken === 'string' && idToken.trim().length > 0;
}

function esErrorAuthFirebase(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return false;
  }

  const codigo = (error as { code?: unknown }).code;
  return typeof codigo === 'string' && codigo.startsWith('auth/');
}

function esSolicitudMismaOrigen(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) {
    return false;
  }

  return origin === new URL(request.url).origin;
}

function esContenidoJson(request: Request): boolean {
  const contentType = request.headers.get('content-type');
  return contentType?.toLowerCase().includes('application/json') ?? false;
}

export async function POST(request: Request) {
  if (!esSolicitudMismaOrigen(request)) {
    return NextResponse.json(
      { ok: false, error: 'Origen no permitido.' },
      { status: 403 },
    );
  }

  if (!esContenidoJson(request)) {
    return NextResponse.json(
      { ok: false, error: 'La solicitud debe enviarse como JSON.' },
      { status: 415 },
    );
  }

  let cuerpo: unknown;

  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Solicitud inválida.' },
      { status: 400 },
    );
  }

  if (!esCuerpoSesionValido(cuerpo)) {
    return NextResponse.json(
      { ok: false, error: 'El idToken es obligatorio.' },
      { status: 400 },
    );
  }

  const { idToken } = cuerpo;

  let tokenDecodificado;
  try {
    tokenDecodificado = await obtenerAdminAuth().verifyIdToken(idToken, true);
  } catch (error) {
    if (esErrorAuthFirebase(error)) {
      return NextResponse.json(
        { ok: false, error: 'Token inválido o revocado.' },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { ok: false, error: 'No fue posible validar el token.' },
      { status: 500 },
    );
  }

  if (tokenDecodificado.admin !== true) {
    return NextResponse.json(
      { ok: false, error: 'Usuario sin permisos de administrador.' },
      { status: 403 },
    );
  }

  try {
    const sessionCookie = await obtenerAdminAuth().createSessionCookie(idToken, {
      expiresIn: DURACION_SESION_MS,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: NOMBRE_COOKIE_SESION,
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: DURACION_SESION_SEGUNDOS,
    });

    return response;
  } catch (error) {
    if (esErrorAuthFirebase(error)) {
      return NextResponse.json(
        { ok: false, error: 'No fue posible crear la sesión.' },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { ok: false, error: 'Error interno al crear sesión.' },
      { status: 500 },
    );
  }
}
