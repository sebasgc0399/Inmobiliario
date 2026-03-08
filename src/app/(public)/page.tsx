import { Suspense } from 'react';
import Link from 'next/link';

import FiltrosBusqueda from '@/components/FiltrosBusqueda';
import HeroBanner from '@/components/HeroBanner';
import ListadoPropiedadesAsync from '@/components/ListadoPropiedadesAsync';
import SkeletonListado from '@/components/SkeletonListado';
import type {
  Estrato,
  FiltrosBusquedaServidor,
  Moneda,
  OrdenPropiedades,
  TipoPropiedad,
} from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SearchParams {
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
const ORDENES_VALIDOS: ReadonlyArray<OrdenPropiedades> = [
  'recientes',
  'precio_asc',
  'precio_desc',
  'destacados',
];
const ESTRATOS_VALIDOS = [1, 2, 3, 4, 5, 6] as const;

function parseMoneda(valor?: string): Moneda {
  if (valor && MONEDAS_VALIDAS.includes(valor as Moneda)) {
    return valor as Moneda;
  }

  return 'COP';
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

function parseOrden(valor?: string): OrdenPropiedades | undefined {
  if (valor && ORDENES_VALIDOS.includes(valor as OrdenPropiedades)) {
    return valor as OrdenPropiedades;
  }

  return undefined;
}

function parseEstrato(valor?: string): Estrato | undefined {
  const numero = Number(valor);
  if (ESTRATOS_VALIDOS.includes(numero as Estrato)) {
    return numero as Estrato;
  }

  return undefined;
}

function parseHabitacionesMin(valor?: string): number | undefined {
  const numero = Number(valor);
  if (Number.isInteger(numero) && numero >= 1 && numero <= 10) {
    return numero;
  }

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
    lineaNegocio: 'tradicional',
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
          <FiltrosBusqueda lineaNegocioContexto="tradicional" />
        </div>

        <section className="mb-8 rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                Nuevo frente de negocio
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                Explora oportunidades de inversion bancaria
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Si buscas activos provenientes de entidades bancarias y compras por oferta,
                visita nuestro catalogo especializado de inversiones.
              </p>
            </div>

            <Link
              href="/inversiones"
              className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
            >
              Ver oportunidades de inversion bancaria
            </Link>
          </div>
        </section>

        <Suspense key={keyFiltros} fallback={<SkeletonListado />}>
          <ListadoPropiedadesAsync filtros={filtros} monedaUsuario={monedaActual} />
        </Suspense>
      </main>
    </>
  );
}
