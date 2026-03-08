'use client';

import { Suspense, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams, type ReadonlyURLSearchParams } from 'next/navigation';

import type { LineaNegocio, Moneda, TipoPropiedad } from '@/types';
import SelectPersonalizado from '@/components/SelectPersonalizado';
import ubicacionesData from '@/data/ubicaciones.json';

type DepartamentoKey = keyof typeof ubicacionesData.Colombia;

const PAIS = 'Colombia' as const;
const departamentos = Object.keys(ubicacionesData[PAIS]) as DepartamentoKey[];

const opcionesLinea: { valor: LineaNegocio | ''; etiqueta: string }[] = [
  { valor: '', etiqueta: 'Todas las lineas' },
  { valor: 'tradicional', etiqueta: 'Venta tradicional' },
  { valor: 'inversion', etiqueta: 'Oportunidades de inversion' },
];

const opcionesTipo: { valor: TipoPropiedad | ''; etiqueta: string }[] = [
  { valor: '', etiqueta: 'Cualquier tipo' },
  { valor: 'apartamento', etiqueta: 'Apartamento' },
  { valor: 'apartaestudio', etiqueta: 'Apartaestudio' },
  { valor: 'casa', etiqueta: 'Casa' },
  { valor: 'finca', etiqueta: 'Finca' },
  { valor: 'local', etiqueta: 'Local' },
  { valor: 'oficina', etiqueta: 'Oficina' },
  { valor: 'terreno', etiqueta: 'Terreno' },
  { valor: 'bodega', etiqueta: 'Bodega' },
];

const opcionesMoneda: { valor: Moneda; etiqueta: string; simbolo: string }[] = [
  { valor: 'COP', etiqueta: '$ COP', simbolo: '$' },
  { valor: 'USD', etiqueta: '$ USD', simbolo: '$' },
  { valor: 'EUR', etiqueta: 'EUR', simbolo: 'EUR' },
];

const opcionesHabitaciones: { valor: string; etiqueta: string }[] = [
  { valor: '', etiqueta: 'Cualquier numero' },
  { valor: '1', etiqueta: '1+' },
  { valor: '2', etiqueta: '2+' },
  { valor: '3', etiqueta: '3+' },
  { valor: '4', etiqueta: '4+' },
];

const opcionesEstrato: { valor: string; etiqueta: string }[] = [
  { valor: '', etiqueta: 'Cualquier estrato' },
  { valor: '1', etiqueta: 'Estrato 1' },
  { valor: '2', etiqueta: 'Estrato 2' },
  { valor: '3', etiqueta: 'Estrato 3' },
  { valor: '4', etiqueta: 'Estrato 4' },
  { valor: '5', etiqueta: 'Estrato 5' },
  { valor: '6', etiqueta: 'Estrato 6' },
];

const opcionesOrden: { valor: string; etiqueta: string }[] = [
  { valor: '', etiqueta: 'Mas recientes' },
  { valor: 'precio_asc', etiqueta: 'Precio: menor a mayor' },
  { valor: 'precio_desc', etiqueta: 'Precio: mayor a menor' },
  { valor: 'destacados', etiqueta: 'Destacados primero' },
];

interface Filtros {
  linea: string;
  tipo: string;
  departamento: string;
  municipio: string;
  moneda: Moneda;
  precioMin: string;
  precioMax: string;
  habitaciones: string;
  estrato: string;
  orden: string;
}

interface FiltrosBusquedaProps {
  lineaNegocioContexto?: LineaNegocio;
}

function esMoneda(valor: string | null): valor is Moneda {
  return valor === 'COP' || valor === 'USD' || valor === 'EUR';
}

function obtenerRutaBase(lineaNegocioContexto?: LineaNegocio, lineaActual?: string): string {
  const linea = lineaNegocioContexto ?? lineaActual;
  return linea === 'inversion' ? '/inversiones' : '/';
}

function serializarDesdeUrl(
  searchParams: ReadonlyURLSearchParams,
  lineaNegocioContexto?: LineaNegocio,
): Filtros {
  const monedaDesdeUrl = searchParams.get('moneda');
  const esContextoInversion = lineaNegocioContexto === 'inversion';

  return {
    linea: lineaNegocioContexto ?? searchParams.get('linea') ?? '',
    tipo: searchParams.get('tipo') ?? '',
    departamento: searchParams.get('departamento') ?? '',
    municipio: searchParams.get('municipio') ?? '',
    moneda: esMoneda(monedaDesdeUrl) ? monedaDesdeUrl : 'COP',
    precioMin: searchParams.get('precioMin') ?? '',
    precioMax: searchParams.get('precioMax') ?? '',
    habitaciones: esContextoInversion ? '' : searchParams.get('habitaciones') ?? '',
    estrato: esContextoInversion ? '' : searchParams.get('estrato') ?? '',
    orden: searchParams.get('orden') ?? '',
  };
}

function construirSearchParams(
  filtros: Filtros,
  lineaNegocioContexto?: LineaNegocio,
): URLSearchParams {
  const searchParams = new URLSearchParams();
  const esContextoFijo = lineaNegocioContexto !== undefined;
  const esContextoInversion = lineaNegocioContexto === 'inversion';

  if (!esContextoFijo && filtros.linea) {
    searchParams.set('linea', filtros.linea);
  }

  if (filtros.tipo) searchParams.set('tipo', filtros.tipo);
  if (filtros.departamento) searchParams.set('departamento', filtros.departamento);
  if (filtros.municipio.trim()) searchParams.set('municipio', filtros.municipio.trim());
  searchParams.set('moneda', filtros.moneda);
  if (filtros.precioMin) searchParams.set('precioMin', filtros.precioMin);
  if (filtros.precioMax) searchParams.set('precioMax', filtros.precioMax);

  if (!esContextoInversion && filtros.habitaciones) {
    searchParams.set('habitaciones', filtros.habitaciones);
  }

  if (!esContextoInversion && filtros.estrato) {
    searchParams.set('estrato', filtros.estrato);
  }

  if (filtros.orden) searchParams.set('orden', filtros.orden);

  return searchParams;
}

function ChipFiltro({ etiqueta, onRemover }: { etiqueta: string; onRemover: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
      {etiqueta}
      <button
        type="button"
        onClick={onRemover}
        className="rounded-full p-0.5 transition-colors hover:bg-blue-100"
        aria-label={`Remover filtro ${etiqueta}`}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}

function FiltrosInternos({ lineaNegocioContexto }: FiltrosBusquedaProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const montado = useRef(false);

  const [filtros, setFiltros] = useState<Filtros>(() =>
    serializarDesdeUrl(searchParams, lineaNegocioContexto),
  );

  const esContextoFijo = lineaNegocioContexto !== undefined;
  const esContextoInversion = lineaNegocioContexto === 'inversion';
  const mostrarSelectorLinea = !esContextoFijo;
  const mostrarHabitaciones = !esContextoInversion;
  const mostrarEstrato = !esContextoInversion;

  const municipiosDisponibles: string[] = filtros.departamento
    ? (ubicacionesData[PAIS][filtros.departamento as DepartamentoKey] ?? [])
    : [];

  const filtrosActivos = Object.entries(filtros).filter(([clave, valor]) => {
    if (clave === 'moneda') return valor !== 'COP';
    if (clave === 'orden') return false;
    if (!mostrarSelectorLinea && clave === 'linea') return false;
    if (!mostrarHabitaciones && clave === 'habitaciones') return false;
    if (!mostrarEstrato && clave === 'estrato') return false;
    return Boolean(valor);
  }).length;

  const simboloMoneda = opcionesMoneda.find((opcion) => opcion.valor === filtros.moneda)?.simbolo ?? '$';

  useEffect(() => {
    if (!esContextoFijo) {
      return;
    }

    const filtrosNormalizados = serializarDesdeUrl(searchParams, lineaNegocioContexto);
    const actual = searchParams.toString();
    const siguiente = construirSearchParams(filtrosNormalizados, lineaNegocioContexto).toString();

    if (actual === siguiente) {
      return;
    }

    const rutaBase = obtenerRutaBase(lineaNegocioContexto, filtrosNormalizados.linea);

    startTransition(() => {
      router.replace(siguiente ? `${rutaBase}?${siguiente}` : rutaBase);
    });
  }, [esContextoFijo, lineaNegocioContexto, router, searchParams, startTransition]);

  useEffect(() => {
    if (!montado.current) {
      montado.current = true;
      return;
    }

    const timer = setTimeout(() => {
      const siguienteSearchParams = construirSearchParams(filtros, lineaNegocioContexto);
      const siguiente = siguienteSearchParams.toString();
      const actual = searchParams.toString();

      if (siguiente === actual) {
        return;
      }

      const rutaBase = obtenerRutaBase(lineaNegocioContexto, filtros.linea);

      startTransition(() => {
        router.replace(siguiente ? `${rutaBase}?${siguiente}` : rutaBase);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [filtros, lineaNegocioContexto, router, searchParams, startTransition]);

  function cambiar<K extends keyof Filtros>(campo: K, valor: string) {
    setFiltros((previo) => {
      const siguiente = { ...previo, [campo]: valor };

      if (campo === 'moneda') {
        siguiente.precioMin = '';
        siguiente.precioMax = '';
      }

      if (campo === 'departamento') {
        siguiente.municipio = '';
      }

      return siguiente;
    });
  }

  function limpiar() {
    setFiltros({
      linea: lineaNegocioContexto ?? '',
      tipo: '',
      departamento: '',
      municipio: '',
      moneda: 'COP',
      precioMin: '',
      precioMax: '',
      habitaciones: '',
      estrato: '',
      orden: '',
    });
  }

  const claseInput =
    'w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 ' +
    'transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 ' +
    'disabled:cursor-not-allowed disabled:opacity-40 ';

  const bordeActivo = (valor: string) =>
    valor ? 'border-blue-300 bg-blue-50/40' : 'border-gray-200';

  const claseLabel =
    'mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400';

  return (
    <div
      className={`relative mb-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-opacity duration-150 ${
        isPending ? 'opacity-70' : 'opacity-100'
      }`}
      aria-label="Filtros de busqueda"
    >
      <div className="absolute inset-x-0 top-0 overflow-hidden rounded-t-2xl" aria-hidden="true">
        <div
          className={`h-0.5 bg-blue-500 transition-opacity duration-300 ${
            isPending ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-blue-500"
            aria-hidden="true"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          Filtrar propiedades
        </p>
        {filtrosActivos > 0 && (
          <button
            type="button"
            onClick={limpiar}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-800"
          >
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">
              {filtrosActivos}
            </span>
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {mostrarSelectorLinea && (
          <div className="flex flex-col">
            <label htmlFor="linea" className={claseLabel}>
              Linea
            </label>
            <SelectPersonalizado
              id="linea"
              valor={filtros.linea}
              onChange={(valor) => cambiar('linea', valor)}
              opciones={opcionesLinea}
              activo={!!filtros.linea}
            />
          </div>
        )}

        <div className="flex flex-col">
          <label htmlFor="tipo" className={claseLabel}>
            Tipo de propiedad
          </label>
          <SelectPersonalizado
            id="tipo"
            valor={filtros.tipo}
            onChange={(valor) => cambiar('tipo', valor)}
            opciones={opcionesTipo}
            activo={!!filtros.tipo}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="departamento" className={claseLabel}>
            Departamento
          </label>
          <SelectPersonalizado
            id="departamento"
            valor={filtros.departamento}
            onChange={(valor) => cambiar('departamento', valor)}
            opciones={[
              { valor: '', etiqueta: 'Todos los departamentos' },
              ...departamentos.map((departamento) => ({
                valor: departamento,
                etiqueta: departamento,
              })),
            ]}
            activo={!!filtros.departamento}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="municipio" className={claseLabel}>
            Municipio
          </label>
          <SelectPersonalizado
            key={filtros.departamento || 'sin-departamento'}
            id="municipio"
            valor={filtros.municipio}
            onChange={(valor) => cambiar('municipio', valor)}
            opciones={
              municipiosDisponibles.length > 0
                ? [
                    { valor: '', etiqueta: 'Todos los municipios' },
                    ...municipiosDisponibles.map((municipio) => ({
                      valor: municipio,
                      etiqueta: municipio,
                    })),
                  ]
                : [{ valor: '', etiqueta: 'Primero elige un departamento.' }]
            }
            activo={!!filtros.municipio}
            disabled={!filtros.departamento}
          />
          {!filtros.departamento && (
            <p className="mt-1 text-xs text-gray-500">
              Selecciona un departamento para habilitar municipio.
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 border-t border-gray-100 pt-3" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end">
        <div className="flex flex-col lg:min-w-32">
          <label htmlFor="moneda" className={claseLabel}>
            Moneda
          </label>
          <SelectPersonalizado
            id="moneda"
            valor={filtros.moneda}
            onChange={(valor) => cambiar('moneda', valor)}
            opciones={opcionesMoneda}
            activo={filtros.moneda !== 'COP'}
          />
        </div>

        {mostrarHabitaciones && (
          <div className="flex flex-col lg:min-w-36">
            <label htmlFor="habitaciones" className={claseLabel}>
              Habitaciones
            </label>
            <SelectPersonalizado
              id="habitaciones"
              valor={filtros.habitaciones}
              onChange={(valor) => cambiar('habitaciones', valor)}
              opciones={opcionesHabitaciones}
              activo={!!filtros.habitaciones}
            />
          </div>
        )}

        {mostrarEstrato && (
          <div className="flex flex-col lg:min-w-36">
            <label htmlFor="estrato" className={claseLabel}>
              Estrato
            </label>
            <SelectPersonalizado
              id="estrato"
              valor={filtros.estrato}
              onChange={(valor) => cambiar('estrato', valor)}
              opciones={opcionesEstrato}
              activo={!!filtros.estrato}
            />
          </div>
        )}

        <div className="flex flex-col sm:col-span-2 lg:min-w-60">
          <label className={claseLabel}>Rango de precio ({filtros.moneda})</label>
          <div className="flex items-center gap-2">
            <input
              id="precioMin"
              type="number"
              min={0}
              placeholder="Minimo"
              value={filtros.precioMin}
              onChange={(evento) => cambiar('precioMin', evento.target.value)}
              className={claseInput + bordeActivo(filtros.precioMin)}
              aria-label="Precio minimo"
            />
            <span className="shrink-0 text-sm text-gray-400">-</span>
            <input
              id="precioMax"
              type="number"
              min={0}
              placeholder="Maximo"
              value={filtros.precioMax}
              onChange={(evento) => cambiar('precioMax', evento.target.value)}
              className={claseInput + bordeActivo(filtros.precioMax)}
              aria-label="Precio maximo"
            />
          </div>
        </div>

        <div className="mx-1 hidden w-px self-stretch bg-gray-100 lg:block" aria-hidden="true" />

        <div className="flex flex-col lg:min-w-44">
          <label htmlFor="orden" className={claseLabel}>
            Ordenar por
          </label>
          <SelectPersonalizado
            id="orden"
            valor={filtros.orden}
            onChange={(valor) => cambiar('orden', valor)}
            opciones={opcionesOrden}
            activo={!!filtros.orden}
          />
        </div>
      </div>

      {filtrosActivos > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
          <span className="shrink-0 text-xs font-medium text-gray-400">Filtros activos:</span>

          {mostrarSelectorLinea && filtros.linea && (
            <ChipFiltro
              etiqueta={opcionesLinea.find((opcion) => opcion.valor === filtros.linea)?.etiqueta ?? filtros.linea}
              onRemover={() => cambiar('linea', '')}
            />
          )}

          {filtros.tipo && (
            <ChipFiltro
              etiqueta={opcionesTipo.find((opcion) => opcion.valor === filtros.tipo)?.etiqueta ?? filtros.tipo}
              onRemover={() => cambiar('tipo', '')}
            />
          )}

          {filtros.departamento && (
            <ChipFiltro etiqueta={filtros.departamento} onRemover={() => cambiar('departamento', '')} />
          )}

          {filtros.municipio && (
            <ChipFiltro etiqueta={filtros.municipio} onRemover={() => cambiar('municipio', '')} />
          )}

          {mostrarHabitaciones && filtros.habitaciones && (
            <ChipFiltro
              etiqueta={`${filtros.habitaciones}+ hab.`}
              onRemover={() => cambiar('habitaciones', '')}
            />
          )}

          {mostrarEstrato && filtros.estrato && (
            <ChipFiltro
              etiqueta={`Estrato ${filtros.estrato}`}
              onRemover={() => cambiar('estrato', '')}
            />
          )}

          {filtros.moneda !== 'COP' && !filtros.precioMin && !filtros.precioMax && (
            <ChipFiltro
              etiqueta={`Moneda: ${filtros.moneda}`}
              onRemover={() => cambiar('moneda', 'COP')}
            />
          )}

          {filtros.precioMin && (
            <ChipFiltro
              etiqueta={`Desde ${simboloMoneda}${Number(filtros.precioMin).toLocaleString()} ${filtros.moneda}`}
              onRemover={() => cambiar('precioMin', '')}
            />
          )}

          {filtros.precioMax && (
            <ChipFiltro
              etiqueta={`Hasta ${simboloMoneda}${Number(filtros.precioMax).toLocaleString()} ${filtros.moneda}`}
              onRemover={() => cambiar('precioMax', '')}
            />
          )}
        </div>
      )}
    </div>
  );
}

function FiltrosConKey({ lineaNegocioContexto }: FiltrosBusquedaProps) {
  const searchParams = useSearchParams();
  const key = `${lineaNegocioContexto ?? 'sin-contexto'}:${searchParams.toString()}`;

  return <FiltrosInternos key={key} lineaNegocioContexto={lineaNegocioContexto} />;
}

export default function FiltrosBusqueda({ lineaNegocioContexto }: FiltrosBusquedaProps) {
  return (
    <Suspense>
      <FiltrosConKey lineaNegocioContexto={lineaNegocioContexto} />
    </Suspense>
  );
}
