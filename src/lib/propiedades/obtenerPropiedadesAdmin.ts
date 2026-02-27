import 'server-only';

import { obtenerAdminDb } from '@/lib/firebase/admin';
import { propiedadConverter } from '@/lib/firebase/propiedadConverter';
import type { Propiedad } from '@/types';

// V2 (>500 props): migrar a paginación con cursor (startAfter) cuando el volumen lo requiera
const LIMITE_ADMIN = 500;

/**
 * Devuelve todas las propiedades del catálogo para el panel de administración,
 * independientemente de su estadoPublicacion.
 *
 * A diferencia de obtenerPropiedadesPublicas, no aplica filtros de negocio ni
 * de estado — el admin necesita visibilidad total del inventario.
 */
export async function obtenerPropiedadesAdmin(): Promise<Propiedad[]> {
  const snapshot = await obtenerAdminDb()
    .collection('propiedades')
    .withConverter(propiedadConverter)
    .orderBy('actualizadoEn', 'desc')
    .limit(LIMITE_ADMIN)
    .get();

  return snapshot.docs.map((doc) => doc.data());
}
