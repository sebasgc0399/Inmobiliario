import 'server-only';

import type { DecodedIdToken } from 'firebase-admin/auth';
import { cookies } from 'next/headers';

import { obtenerAdminAuth } from '@/lib/firebase/admin';

const NOMBRE_COOKIE_SESION = '__session';

/**
 * Verifica que la petición proviene de un administrador autenticado.
 * Debe llamarse al inicio de cada Server Action del panel admin.
 *
 * @returns El token decodificado (contiene `uid` y otros claims).
 * @throws Error si la sesión no existe, ha expirado o el usuario no tiene claim admin.
 */
export async function validarSesionAdmin(): Promise<DecodedIdToken> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(NOMBRE_COOKIE_SESION)?.value;

  if (!sessionCookie) {
    throw new Error('No autorizado: sesión no encontrada.');
  }

  let token: DecodedIdToken;
  try {
    token = await obtenerAdminAuth().verifySessionCookie(sessionCookie, true);
  } catch {
    throw new Error('No autorizado: sesión inválida o expirada.');
  }

  if (token.admin !== true) {
    throw new Error('No autorizado: permisos insuficientes.');
  }

  return token;
}
