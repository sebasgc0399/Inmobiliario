import { Suspense } from 'react';
import FiltrosBusqueda from '@/components/FiltrosBusqueda';
import HeroBanner from '@/components/HeroBanner';
import ListadoPropiedadesAsync from '@/components/ListadoPropiedadesAsync';
import SkeletonListado from '@/components/SkeletonListado';
import type { FiltrosBusquedaServidor, Moneda, ModoNegocio, TipoPropiedad } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SearchParams {
  negocio?: string;
  tipo?: string;
  ciudad?: string;
  moneda?: string;
  precioMin?: string;
  precioMax?: string;
}

const MONEDAS_VALIDAS: ReadonlyArray<Moneda> = ['COP', 'USD', 'EUR'];
const NEGOCIOS_VALIDOS: ReadonlyArray<ModoNegocio> = ['venta', 'alquiler', 'venta_alquiler'];
const TIPOS_VALIDOS: ReadonlyArray<TipoPropiedad> = [
  'casa',
  'apartamento',
  'apartaestudio',
  'finca',
  'local',
  'oficina',
  'terreno',
  'bodega',
];

function parseMoneda(valor?: string): Moneda {
  if (valor && MONEDAS_VALIDAS.includes(valor as Moneda)) {
    return valor as Moneda;
  }

  return 'COP';
}

function parseModoNegocio(valor?: string): ModoNegocio | undefined {
  if (valor && NEGOCIOS_VALIDOS.includes(valor as ModoNegocio)) {
    return valor as ModoNegocio;
  }

  return undefined;
}

function parseTipoPropiedad(valor?: string): TipoPropiedad | undefined {
  if (valor && TIPOS_VALIDOS.includes(valor as TipoPropiedad)) {
    return valor as TipoPropiedad;
  }

  return undefined;
}

function parseNumeroPositivo(valor?: string): number | undefined {
  if (!valor) {
    return undefined;
  }

  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero < 0) {
    return undefined;
  }

  return numero;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const monedaActual = parseMoneda(params.moneda);

  const filtros: FiltrosBusquedaServidor = {
    moneda: monedaActual,
    negocio: parseModoNegocio(params.negocio),
    tipo: parseTipoPropiedad(params.tipo),
    ciudad: params.ciudad?.trim() || undefined,
    precioMin: parseNumeroPositivo(params.precioMin),
    precioMax: parseNumeroPositivo(params.precioMax),
  };

  const keyFiltros = [
    params.negocio,
    params.tipo,
    params.ciudad,
    params.moneda,
    params.precioMin,
    params.precioMax,
  ].join('|');

  return (
    <>
      <HeroBanner />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="-mt-10 relative z-10">
          <FiltrosBusqueda />
        </div>
        <Suspense key={keyFiltros} fallback={<SkeletonListado />}>
          <ListadoPropiedadesAsync filtros={filtros} monedaUsuario={monedaActual} />
        </Suspense>
      </main>
    </>
  );
}
