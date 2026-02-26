import { Suspense } from 'react';
import FiltrosBusqueda from '@/components/FiltrosBusqueda';
import HeroBanner from '@/components/HeroBanner';
import ListadoPropiedadesAsync from '@/components/ListadoPropiedadesAsync';
import SkeletonListado from '@/components/SkeletonListado';
import type { Estrato, FiltrosBusquedaServidor, Moneda, ModoNegocio, OrdenPropiedades, TipoPropiedad } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SearchParams {
  negocio?: string;
  tipo?: string;
  municipio?: string;
  departamento?: string;
  moneda?: string;
  precioMin?: string;
  precioMax?: string;
  habitaciones?: string;
  estrato?: string;
  orden?: string;
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

const ORDENES_VALIDOS: ReadonlyArray<OrdenPropiedades> = [
  'recientes',
  'precio_asc',
  'precio_desc',
  'destacados',
];
const ESTRATOS_VALIDOS = [1, 2, 3, 4, 5, 6] as const;

function parseOrden(valor?: string): OrdenPropiedades | undefined {
  if (valor && ORDENES_VALIDOS.includes(valor as OrdenPropiedades)) {
    return valor as OrdenPropiedades;
  }
  return undefined;
}

function parseEstrato(valor?: string): Estrato | undefined {
  const n = Number(valor);
  if (ESTRATOS_VALIDOS.includes(n as Estrato)) return n as Estrato;
  return undefined;
}

function parseHabitacionesMin(valor?: string): number | undefined {
  const n = Number(valor);
  if (Number.isInteger(n) && n >= 1 && n <= 10) return n;
  return undefined;
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
    municipio: params.municipio?.trim() || undefined,
    departamento: params.departamento?.trim() || undefined,
    precioMin: parseNumeroPositivo(params.precioMin),
    precioMax: parseNumeroPositivo(params.precioMax),
    habitacionesMin: parseHabitacionesMin(params.habitaciones),
    estrato: parseEstrato(params.estrato),
    orden: parseOrden(params.orden),
  };

  const keyFiltros = [
    params.negocio,
    params.tipo,
    params.municipio,
    params.departamento,
    params.moneda,
    params.precioMin,
    params.precioMax,
    params.habitaciones,
    params.estrato,
    params.orden,
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
