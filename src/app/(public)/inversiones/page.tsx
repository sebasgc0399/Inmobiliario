import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

import ListadoPropiedadesAsync from '@/components/ListadoPropiedadesAsync';
import SkeletonListado from '@/components/SkeletonListado';
import type { Estrato, FiltrosBusquedaServidor, Moneda, OrdenPropiedades, TipoPropiedad } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Oportunidades de Inversion Inmobiliaria | IsaHouse',
  description:
    'Descubre inmuebles embargados y oportunidades de inversion inmobiliaria en Colombia a precios por debajo del mercado. Proceso seguro y transparente.',
  keywords: [
    'inversion inmobiliaria',
    'inmuebles embargados',
    'oportunidades de inversion',
    'propiedades embargadas Colombia',
    'remate inmobiliario',
  ],
};

// ── Parseo de searchParams ────────────────────────────────────────────────────

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
  'casa', 'apartamento', 'apartaestudio', 'finca', 'local', 'oficina', 'terreno', 'bodega',
];
const ORDENES_VALIDOS: ReadonlyArray<OrdenPropiedades> = ['recientes', 'precio_asc', 'precio_desc', 'destacados'];
const ESTRATOS_VALIDOS = [1, 2, 3, 4, 5, 6] as const;

function parseMoneda(valor?: string): Moneda {
  if (valor && MONEDAS_VALIDAS.includes(valor as Moneda)) return valor as Moneda;
  return 'COP';
}

function parseTipoPropiedad(valor?: string): TipoPropiedad | undefined {
  if (valor && TIPOS_VALIDOS.includes(valor as TipoPropiedad)) return valor as TipoPropiedad;
  return undefined;
}

function parseNumeroPositivo(valor?: string): number | undefined {
  if (!valor) return undefined;
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero < 0) return undefined;
  return numero;
}

function parseOrden(valor?: string): OrdenPropiedades | undefined {
  if (valor && ORDENES_VALIDOS.includes(valor as OrdenPropiedades)) return valor as OrdenPropiedades;
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PaginaInversiones({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const monedaActual = parseMoneda(params.moneda);

  const filtros: FiltrosBusquedaServidor = {
    moneda: monedaActual,
    lineaNegocio: 'inversion', // Siempre filtra por inversión
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
      {/* Hero Banner de Inversiones */}
      <section className="relative h-[40vh] w-full overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80"
          alt="Oportunidades de inversion inmobiliaria"
          fill
          className="object-cover"
          priority={true}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/70 to-black/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="inline-block bg-amber-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
            Oportunidades
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
            Inversiones Inmobiliarias
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/90 max-w-2xl drop-shadow">
            Inmuebles embargados a precios por debajo del mercado. Proceso seguro y transparente.
          </p>
          <Link
            href="/inversiones/como-funciona"
            className="mt-6 inline-flex items-center gap-2 bg-white/90 hover:bg-white text-amber-900 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            Como funciona el proceso
          </Link>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="mt-8">
          <Suspense key={keyFiltros} fallback={<SkeletonListado />}>
            <ListadoPropiedadesAsync filtros={filtros} monedaUsuario={monedaActual} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
