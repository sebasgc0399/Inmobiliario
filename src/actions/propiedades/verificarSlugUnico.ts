'use server';

import 'server-only';

import { obtenerAdminDb } from '@/lib/firebase/admin';

/**
 * Verifica si un slug está disponible para usar.
 *
 * No requiere sesión de admin — es solo lectura de un índice público de slugs.
 * La ruta /admin/* ya está protegida por el middleware.
 * La unicidad real se garantiza mediante la transacción en actualizarPropiedad.
 *
 * @param slug          El slug a verificar.
 * @param propiedadIdActual  Si se provee, ignora el slug si pertenece a esta propiedad
 *                          (para no marcar como "ocupado" el slug actual al editar).
 * @returns true si el slug está disponible; false si está en uso por otra propiedad.
 */
export async function verificarSlugUnico(
  slug: string,
  propiedadIdActual?: string,
): Promise<boolean> {
  if (!slug || slug.trim() === '') return true;

  const slugLimpio = slug.trim().toLowerCase();

  const snap = await obtenerAdminDb().collection('slugUnicos').doc(slugLimpio).get();

  if (!snap.exists) return true; // Slug libre

  const datos = snap.data() as { propiedadId: string } | undefined;

  // Si el slug pertenece a la propiedad que se está editando → disponible
  if (propiedadIdActual && datos?.propiedadId === propiedadIdActual) return true;

  return false; // Slug ocupado por otra propiedad
}
