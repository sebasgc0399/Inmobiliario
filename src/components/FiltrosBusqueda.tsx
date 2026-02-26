'use client';

import { Suspense, useState, useEffect, useRef, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ModoNegocio, TipoPropiedad, Moneda } from '@/types';
import SelectPersonalizado from '@/components/SelectPersonalizado';
import ubicacionesData from '@/data/ubicaciones.json';

// ── Tipos de ubicación inferidos del JSON ─────────────────────────────────────

type DepartamentoKey = keyof typeof ubicacionesData['Colombia'];
const PAIS = 'Colombia' as const;
const departamentos = Object.keys(ubicacionesData[PAIS]) as DepartamentoKey[];

// ── Opciones estáticas ────────────────────────────────────────────────────────

const opcionesNegocio: { valor: ModoNegocio | ''; etiqueta: string }[] = [
  { valor: '', etiqueta: 'Compra o alquiler' },
  { valor: 'venta', etiqueta: 'Venta' },
  { valor: 'alquiler', etiqueta: 'Alquiler' },
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
  { valor: 'EUR', etiqueta: '€ EUR', simbolo: '€' },
];

const opcionesHabitaciones: { valor: string; etiqueta: string }[] = [
  { valor: '', etiqueta: 'Cualquier número' },
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
  { valor: '', etiqueta: 'Más recientes' },
  { valor: 'precio_asc', etiqueta: 'Precio: menor a mayor' },
  { valor: 'precio_desc', etiqueta: 'Precio: mayor a menor' },
  { valor: 'destacados', etiqueta: 'Destacados primero' },
];

// ── Estado del formulario ─────────────────────────────────────────────────────

interface Filtros {
  negocio: string;
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

// ── ChipFiltro ────────────────────────────────────────────────────────────────

function ChipFiltro({ etiqueta, onRemover }: { etiqueta: string; onRemover: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
      {etiqueta}
      <button
        type="button"
        onClick={onRemover}
        className="rounded-full p-0.5 hover:bg-blue-100 transition-colors"
        aria-label={`Remover filtro ${etiqueta}`}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}

// ── Componente interno (necesita useSearchParams → dentro de <Suspense>) ──────

function FiltrosInternos() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const montado = useRef(false);

  const [filtros, setFiltros] = useState<Filtros>({
    negocio: searchParams.get('negocio') ?? '',
    tipo: searchParams.get('tipo') ?? '',
    departamento: searchParams.get('departamento') ?? '',
    municipio: searchParams.get('municipio') ?? '',
    moneda: (searchParams.get('moneda') as Moneda) ?? 'COP',
    precioMin: searchParams.get('precioMin') ?? '',
    precioMax: searchParams.get('precioMax') ?? '',
    habitaciones: searchParams.get('habitaciones') ?? '',
    estrato: searchParams.get('estrato') ?? '',
    orden: searchParams.get('orden') ?? '',
  });

  // Municipios disponibles según el departamento seleccionado (valor derivado, no estado)
  const municipiosDisponibles: string[] = filtros.departamento
    ? (ubicacionesData[PAIS][filtros.departamento as DepartamentoKey] ?? [])
    : [];

  const filtrosActivos = Object.entries(filtros).filter(([k, v]) => {
    if (k === 'moneda') return v !== 'COP';
    if (k === 'orden') return false; // orden no reduce resultados, no cuenta como filtro activo
    return Boolean(v);
  }).length;

  const simboloMoneda = opcionesMoneda.find((o) => o.valor === filtros.moneda)?.simbolo ?? '$';

  // Auto-apply con debounce 300ms — no ejecutar en el primer render
  useEffect(() => {
    if (!montado.current) {
      montado.current = true;
      return;
    }
    const timer = setTimeout(() => {
      const sp = new URLSearchParams();
      if (filtros.negocio) sp.set('negocio', filtros.negocio);
      if (filtros.tipo) sp.set('tipo', filtros.tipo);
      if (filtros.departamento) sp.set('departamento', filtros.departamento);
      if (filtros.municipio.trim()) sp.set('municipio', filtros.municipio.trim());
      sp.set('moneda', filtros.moneda);
      if (filtros.precioMin) sp.set('precioMin', filtros.precioMin);
      if (filtros.precioMax) sp.set('precioMax', filtros.precioMax);
      if (filtros.habitaciones) sp.set('habitaciones', filtros.habitaciones);
      if (filtros.estrato) sp.set('estrato', filtros.estrato);
      if (filtros.orden) sp.set('orden', filtros.orden);
      startTransition(() => {
        router.replace(`/?${sp.toString()}`);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [filtros, router]);

  function cambiar<K extends keyof Filtros>(campo: K, valor: string) {
    setFiltros((prev) => {
      const siguiente = { ...prev, [campo]: valor };
      // Al cambiar moneda, limpiar precios
      if (campo === 'moneda') {
        siguiente.precioMin = '';
        siguiente.precioMax = '';
      }
      // Al cambiar departamento, resetear municipio
      if (campo === 'departamento') {
        siguiente.municipio = '';
      }
      return siguiente;
    });
  }

  function limpiar() {
    setFiltros({
      negocio: '',
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

  // ── Estilos reutilizables ───────────────────────────────────────────────────

  const claseInput =
    'w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ' +
    'disabled:opacity-40 disabled:cursor-not-allowed ';

  const bordeActivo = (valor: string) =>
    valor ? 'border-blue-300 bg-blue-50/40' : 'border-gray-200';

  const claseLabel = 'text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block';

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      className={`relative bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-8 transition-opacity duration-150 ${
        isPending ? 'opacity-70' : 'opacity-100'
      }`}
      aria-label="Filtros de búsqueda"
    >
      {/* Barra de progreso superior */}
      <div className="absolute inset-x-0 top-0 rounded-t-2xl overflow-hidden" aria-hidden="true">
        <div
          className={`h-0.5 bg-blue-500 transition-opacity duration-300 ${
            isPending ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-blue-500" aria-hidden="true">
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
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
          >
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold">
              {filtrosActivos}
            </span>
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Fila 1: Clasificación y ubicación */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

        {/* Negocio */}
        <div className="flex flex-col">
          <label htmlFor="negocio" className={claseLabel}>Negocio</label>
          <SelectPersonalizado
            id="negocio"
            valor={filtros.negocio}
            onChange={(val) => cambiar('negocio', val)}
            opciones={opcionesNegocio}
            activo={!!filtros.negocio}
          />
        </div>

        {/* Tipo */}
        <div className="flex flex-col">
          <label htmlFor="tipo" className={claseLabel}>Tipo de propiedad</label>
          <SelectPersonalizado
            id="tipo"
            valor={filtros.tipo}
            onChange={(val) => cambiar('tipo', val)}
            opciones={opcionesTipo}
            activo={!!filtros.tipo}
          />
        </div>

        {/* Departamento */}
        <div className="flex flex-col">
          <label htmlFor="departamento" className={claseLabel}>Departamento</label>
          <SelectPersonalizado
            id="departamento"
            valor={filtros.departamento}
            onChange={(val) => cambiar('departamento', val)}
            opciones={[
              { valor: '', etiqueta: 'Todos los departamentos' },
              ...departamentos.map((d) => ({ valor: d, etiqueta: d })),
            ]}
            activo={!!filtros.departamento}
          />
        </div>

        {/* Municipio — deshabilitado hasta elegir departamento */}
        <div className="flex flex-col">
          <label htmlFor="municipio" className={claseLabel}>Municipio</label>
          <SelectPersonalizado
            id="municipio"
            valor={filtros.municipio}
            onChange={(val) => cambiar('municipio', val)}
            opciones={
              municipiosDisponibles.length > 0
                ? [
                    { valor: '', etiqueta: 'Todos los municipios' },
                    ...municipiosDisponibles.map((m) => ({ valor: m, etiqueta: m })),
                  ]
                : [{ valor: '', etiqueta: 'Primero elige un departamento.' }]
            }
            activo={!!filtros.municipio}
            disabled={!filtros.departamento}
          />
        </div>

      </div>

      {/* Divisor */}
      <div className="border-t border-gray-100 mt-3 pt-3" />

      {/* Fila 2: Filtros secundarios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end gap-3">

        {/* Moneda */}
        <div className="flex flex-col lg:min-w-32">
          <label htmlFor="moneda" className={claseLabel}>Moneda</label>
          <SelectPersonalizado
            id="moneda"
            valor={filtros.moneda}
            onChange={(val) => cambiar('moneda', val)}
            opciones={opcionesMoneda}
            activo={filtros.moneda !== 'COP'}
          />
        </div>

        {/* Habitaciones */}
        <div className="flex flex-col lg:min-w-36">
          <label htmlFor="habitaciones" className={claseLabel}>Habitaciones</label>
          <SelectPersonalizado
            id="habitaciones"
            valor={filtros.habitaciones}
            onChange={(val) => cambiar('habitaciones', val)}
            opciones={opcionesHabitaciones}
            activo={!!filtros.habitaciones}
          />
        </div>

        {/* Estrato */}
        <div className="flex flex-col lg:min-w-36">
          <label htmlFor="estrato" className={claseLabel}>Estrato</label>
          <SelectPersonalizado
            id="estrato"
            valor={filtros.estrato}
            onChange={(val) => cambiar('estrato', val)}
            opciones={opcionesEstrato}
            activo={!!filtros.estrato}
          />
        </div>

        {/* Rango de precio */}
        <div className="flex flex-col sm:col-span-2 lg:col-span-1 lg:min-w-60">
          <label className={claseLabel}>
            Rango de precio ({filtros.moneda})
          </label>
          <div className="flex items-center gap-2">
            <input
              id="precioMin"
              type="number"
              min={0}
              placeholder="Mínimo"
              value={filtros.precioMin}
              onChange={(e) => cambiar('precioMin', e.target.value)}
              className={claseInput + bordeActivo(filtros.precioMin)}
              aria-label="Precio mínimo"
            />
            <span className="text-sm shrink-0 text-gray-400">—</span>
            <input
              id="precioMax"
              type="number"
              min={0}
              placeholder="Máximo"
              value={filtros.precioMax}
              onChange={(e) => cambiar('precioMax', e.target.value)}
              className={claseInput + bordeActivo(filtros.precioMax)}
              aria-label="Precio máximo"
            />
          </div>
        </div>

        {/* Divisor visual en pantallas grandes */}
        <div className="hidden lg:block w-px self-stretch bg-gray-100 mx-1" aria-hidden="true" />

        {/* Ordenamiento */}
        <div className="flex flex-col lg:min-w-44">
          <label htmlFor="orden" className={claseLabel}>Ordenar por</label>
          <SelectPersonalizado
            id="orden"
            valor={filtros.orden}
            onChange={(val) => cambiar('orden', val)}
            opciones={opcionesOrden}
            activo={!!filtros.orden}
          />
        </div>

      </div>

      {/* Chips de filtros activos */}
      {filtrosActivos > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 mt-4 pt-3">
          <span className="text-xs text-gray-400 font-medium shrink-0">Filtros activos:</span>
          {filtros.negocio && (
            <ChipFiltro
              etiqueta={opcionesNegocio.find((o) => o.valor === filtros.negocio)?.etiqueta ?? filtros.negocio}
              onRemover={() => cambiar('negocio', '')}
            />
          )}
          {filtros.tipo && (
            <ChipFiltro
              etiqueta={opcionesTipo.find((o) => o.valor === filtros.tipo)?.etiqueta ?? filtros.tipo}
              onRemover={() => cambiar('tipo', '')}
            />
          )}
          {filtros.departamento && (
            <ChipFiltro etiqueta={filtros.departamento} onRemover={() => cambiar('departamento', '')} />
          )}
          {filtros.municipio && (
            <ChipFiltro etiqueta={filtros.municipio} onRemover={() => cambiar('municipio', '')} />
          )}
          {filtros.habitaciones && (
            <ChipFiltro
              etiqueta={`${filtros.habitaciones}+ hab.`}
              onRemover={() => cambiar('habitaciones', '')}
            />
          )}
          {filtros.estrato && (
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

// ── Export: wrapper con Suspense ──────────────────────────────────────────────

export default function FiltrosBusqueda() {
  return (
    <Suspense>
      <FiltrosInternos />
    </Suspense>
  );
}
