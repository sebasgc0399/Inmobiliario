import 'server-only';

import { obtenerAdminDb } from '@/lib/firebase/admin';
import { propiedadConverter } from '@/lib/firebase/propiedadConverter';
import type { Propiedad } from '@/types';

/**
 * Obtiene una propiedad por su ID para el panel de administración.
 * Retorna cualquier estadoPublicacion (borrador, activo, vendido, etc.).
 * Retorna null si el documento no existe.
 */
export async function obtenerPropiedadAdmin(id: string): Promise<Propiedad | null> {
  const doc = await obtenerAdminDb()
    .collection('propiedades')
    .withConverter(propiedadConverter)
    .doc(id)
    .get();

  if (!doc.exists) return null;

  return doc.data() ?? null;
}
