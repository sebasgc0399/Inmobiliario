import 'server-only';

import type { LineaNegocio, PropiedadPublica } from '@/types/propiedad';
import { obtenerAdminFirestore } from '@/lib/firebase/admin';
import { documentoAPropiedad, type PropiedadFirestore } from './conversor';
import { sanitizarPropiedad, sanitizarPropiedades } from './sanitizar';

const COLECCION = 'propiedades';

/** Todas las propiedades activas, ordenadas por última actualización. */
export async function obtenerPropiedadesPublicas(): Promise<PropiedadPublica[]> {
  const snapshot = await obtenerAdminFirestore()
    .collection(COLECCION)
    .where('estadoPublicacion', '==', 'activo')
    .orderBy('actualizadoEn', 'desc')
    .get();

  return sanitizarPropiedades(
    snapshot.docs.map((doc) =>
      documentoAPropiedad(doc.id, doc.data() as PropiedadFirestore)
    )
  );
}

/** Propiedades activas filtradas por línea de negocio. */
export async function obtenerPropiedadesPublicasPorLineaNegocio(
  lineaNegocio: LineaNegocio
): Promise<PropiedadPublica[]> {
  const snapshot = await obtenerAdminFirestore()
    .collection(COLECCION)
    .where('estadoPublicacion', '==', 'activo')
    .where('lineaNegocio', '==', lineaNegocio)
    .orderBy('actualizadoEn', 'desc')
    .get();

  return sanitizarPropiedades(
    snapshot.docs.map((doc) =>
      documentoAPropiedad(doc.id, doc.data() as PropiedadFirestore)
    )
  );
}

/** Una sola propiedad activa por slug. Retorna null si no existe. */
export async function obtenerPropiedadPublicaPorSlug(
  slug: string
): Promise<PropiedadPublica | null> {
  const snapshot = await obtenerAdminFirestore()
    .collection(COLECCION)
    .where('slug', '==', slug)
    .where('estadoPublicacion', '==', 'activo')
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return sanitizarPropiedad(
    documentoAPropiedad(doc.id, doc.data() as PropiedadFirestore)
  );
}

/** Propiedades activas marcadas como destacadas. */
export async function obtenerPropiedadesDestacadas(): Promise<PropiedadPublica[]> {
  const snapshot = await obtenerAdminFirestore()
    .collection(COLECCION)
    .where('estadoPublicacion', '==', 'activo')
    .where('destacado', '==', true)
    .orderBy('actualizadoEn', 'desc')
    .get();

  return sanitizarPropiedades(
    snapshot.docs.map((doc) =>
      documentoAPropiedad(doc.id, doc.data() as PropiedadFirestore)
    )
  );
}
