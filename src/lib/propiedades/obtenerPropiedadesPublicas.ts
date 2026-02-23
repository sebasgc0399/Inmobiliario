import 'server-only';

import { convertirMoneda } from '@/lib/currency';
import { obtenerAdminDb } from '@/lib/firebase/admin';
import { propiedadConverter } from '@/lib/firebase/propiedadConverter';
import type { FiltrosBusquedaServidor, Propiedad } from '@/types';

const LIMITE_RESULTADOS = 100;

export async function obtenerPropiedadesPublicas(
  filtros: FiltrosBusquedaServidor,
): Promise<Propiedad[]> {
  let consulta = obtenerAdminDb()
    .collection('propiedades')
    .withConverter(propiedadConverter)
    .where('estadoPublicacion', '==', 'activo');

  if (filtros.negocio) {
    consulta = consulta.where('modoNegocio', '==', filtros.negocio);
  }

  if (filtros.tipo) {
    consulta = consulta.where('tipo', '==', filtros.tipo);
  }

  const snapshot = await consulta.orderBy('actualizadoEn', 'desc').limit(LIMITE_RESULTADOS).get();
  let propiedades = snapshot.docs.map((doc) => doc.data());

  if (filtros.ciudad) {
    const ciudadFiltro = filtros.ciudad.toLowerCase();
    propiedades = propiedades.filter((propiedad) =>
      propiedad.ubicacion.ciudad.toLowerCase().includes(ciudadFiltro),
    );
  }

  if (typeof filtros.precioMin === 'number' || typeof filtros.precioMax === 'number') {
    propiedades = propiedades.filter((propiedad) => {
      const valorConvertido = convertirMoneda(
        propiedad.precio.valor,
        propiedad.precio.moneda,
        filtros.moneda,
      );

      if (typeof filtros.precioMin === 'number' && valorConvertido < filtros.precioMin) {
        return false;
      }

      if (typeof filtros.precioMax === 'number' && valorConvertido > filtros.precioMax) {
        return false;
      }

      return true;
    });
  }

  return propiedades;
}
