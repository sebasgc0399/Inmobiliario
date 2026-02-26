import 'server-only';

import { propiedadesMock } from '@/data/mockPropiedades';
import { convertirMoneda } from '@/lib/currency';
import { obtenerAdminDb } from '@/lib/firebase/admin';
import { propiedadConverter } from '@/lib/firebase/propiedadConverter';
import type { FiltrosBusquedaServidor, Propiedad } from '@/types';

const LIMITE_RESULTADOS = 100;
type FuenteDatosPropiedadesPublicas = 'firestore' | 'mock';

function obtenerFuenteDatosPropiedadesPublicas(): FuenteDatosPropiedadesPublicas {
  const fuente = process.env.FUENTE_DATOS_PROPIEDADES_PUBLICAS?.trim().toLowerCase();
  return fuente === 'mock' ? 'mock' : 'firestore';
}

function aplicarFiltrosOrdenYLimite(
  propiedades: Propiedad[],
  filtros: FiltrosBusquedaServidor,
): Propiedad[] {
  let resultado = propiedades.filter((propiedad) => propiedad.estadoPublicacion === 'activo');

  if (filtros.negocio) {
    resultado = resultado.filter((propiedad) => propiedad.modoNegocio === filtros.negocio);
  }

  if (filtros.tipo) {
    resultado = resultado.filter((propiedad) => propiedad.tipo === filtros.tipo);
  }

  if (filtros.ciudad) {
    const ciudadFiltro = filtros.ciudad.toLowerCase();
    resultado = resultado.filter((propiedad) =>
      propiedad.ubicacion.ciudad.toLowerCase().includes(ciudadFiltro),
    );
  }

  if (typeof filtros.precioMin === 'number' || typeof filtros.precioMax === 'number') {
    resultado = resultado.filter((propiedad) => {
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

  return [...resultado]
    .sort((a, b) => b.actualizadoEn.getTime() - a.actualizadoEn.getTime())
    .slice(0, LIMITE_RESULTADOS);
}

export async function obtenerPropiedadesPublicas(
  filtros: FiltrosBusquedaServidor,
): Promise<Propiedad[]> {
  if (obtenerFuenteDatosPropiedadesPublicas() === 'mock') {
    return aplicarFiltrosOrdenYLimite(propiedadesMock, filtros);
  }

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
  const propiedades = snapshot.docs.map((doc) => doc.data());

  return aplicarFiltrosOrdenYLimite(propiedades, filtros);
}
