import 'server-only';

import { cache } from 'react';

import { propiedadesMock } from '@/data/mockPropiedades';
import { obtenerAdminDb } from '@/lib/firebase/admin';
import { propiedadConverter } from '@/lib/firebase/propiedadConverter';
import type { Propiedad } from '@/types';

type FuenteDatos = 'firestore' | 'mock';

function obtenerFuenteDatos(): FuenteDatos {
  const fuente = process.env.FUENTE_DATOS_PROPIEDADES_PUBLICAS?.trim().toLowerCase();
  return fuente === 'mock' ? 'mock' : 'firestore';
}

/**
 * Obtiene una propiedad activa por su slug.
 * Usa React.cache para deduplicar la llamada entre generateMetadata y el page component
 * en el mismo request de Next.js.
 * Retorna null si no se encuentra o si no está activa.
 */
export const obtenerPropiedadPorSlug = cache(async (slug: string): Promise<Propiedad | null> => {
  if (obtenerFuenteDatos() === 'mock') {
    return (
      propiedadesMock.find(
        (p) => p.slug === slug && p.estadoPublicacion === 'activo',
      ) ?? null
    );
  }

  const snapshot = await obtenerAdminDb()
    .collection('propiedades')
    .withConverter(propiedadConverter)
    .where('slug', '==', slug)
    .where('estadoPublicacion', '==', 'activo')
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  return snapshot.docs[0].data();
});
