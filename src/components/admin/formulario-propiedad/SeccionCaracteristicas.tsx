'use client';

import { useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';

import SelectPersonalizado from '@/components/SelectPersonalizado';
import type { CamposFormulario } from './tipos';

// ── Opciones de estrato ───────────────────────────────────────────────────

const OPCIONES_ESTRATO = [
  { valor: '', etiqueta: 'Sin estrato' },
  { valor: '1', etiqueta: 'Estrato 1' },
  { valor: '2', etiqueta: 'Estrato 2' },
  { valor: '3', etiqueta: 'Estrato 3' },
  { valor: '4', etiqueta: 'Estrato 4' },
  { valor: '5', etiqueta: 'Estrato 5' },
  { valor: '6', etiqueta: 'Estrato 6' },
];

// ── Estilos reutilizables ──────────────────────────────────────────────────

const claseInput =
  'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors';

const claseError = 'mt-1 text-sm text-red-600';

// ── Componente ────────────────────────────────────────────────────────────

export default function SeccionCaracteristicas() {
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CamposFormulario>();

  // Estado UI — solo para el input de instalación en progreso
  const [inputInstalacion, setInputInstalacion] = useState('');
  const instalaciones = watch('caracteristicas.instalaciones');

  function agregarInstalacion() {
    const item = inputInstalacion.trim();
    if (item && !instalaciones.includes(item)) {
      setValue('caracteristicas.instalaciones', [...instalaciones, item]);
      setInputInstalacion('');
    }
  }

  function eliminarInstalacion(instalacion: string) {
    setValue(
      'caracteristicas.instalaciones',
      instalaciones.filter((i) => i !== instalacion),
    );
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-semibold text-gray-900">Características</h2>

      <div className="grid gap-6">

        {/* Campos numéricos obligatorios: habitaciones, baños, parqueaderos */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="habitaciones" className="mb-1 block text-sm font-medium text-gray-700">
              Habitaciones <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <input
              id="habitaciones"
              type="number"
              min={0}
              className={claseInput}
              aria-invalid={errors.caracteristicas?.habitaciones ? 'true' : 'false'}
              {...register('caracteristicas.habitaciones', {
                required: 'Obligatorio.',
                min: { value: 0, message: 'Mínimo 0.' },
                valueAsNumber: true,
              })}
            />
            {errors.caracteristicas?.habitaciones && (
              <p className={claseError}>{errors.caracteristicas.habitaciones.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="banos" className="mb-1 block text-sm font-medium text-gray-700">
              Baños <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <input
              id="banos"
              type="number"
              min={0}
              step={0.5}
              className={claseInput}
              aria-invalid={errors.caracteristicas?.banos ? 'true' : 'false'}
              {...register('caracteristicas.banos', {
                required: 'Obligatorio.',
                min: { value: 0, message: 'Mínimo 0.' },
                valueAsNumber: true,
              })}
            />
            {errors.caracteristicas?.banos && (
              <p className={claseError}>{errors.caracteristicas.banos.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="parqueaderos" className="mb-1 block text-sm font-medium text-gray-700">
              Parqueaderos <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <input
              id="parqueaderos"
              type="number"
              min={0}
              className={claseInput}
              aria-invalid={errors.caracteristicas?.parqueaderos ? 'true' : 'false'}
              {...register('caracteristicas.parqueaderos', {
                required: 'Obligatorio.',
                min: { value: 0, message: 'Mínimo 0.' },
                valueAsNumber: true,
              })}
            />
            {errors.caracteristicas?.parqueaderos && (
              <p className={claseError}>{errors.caracteristicas.parqueaderos.message}</p>
            )}
          </div>
        </div>

        {/* Metros cuadrados */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="metrosCuadrados" className="mb-1 block text-sm font-medium text-gray-700">
              Metros Cuadrados <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <input
              id="metrosCuadrados"
              type="number"
              min={1}
              step={0.01}
              className={claseInput}
              aria-invalid={errors.caracteristicas?.metrosCuadrados ? 'true' : 'false'}
              {...register('caracteristicas.metrosCuadrados', {
                required: 'Obligatorio.',
                min: { value: 1, message: 'Mínimo 1 m².' },
                valueAsNumber: true,
              })}
            />
            {errors.caracteristicas?.metrosCuadrados && (
              <p className={claseError}>{errors.caracteristicas.metrosCuadrados.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="metrosConstruidos" className="mb-1 block text-sm font-medium text-gray-700">
              Metros Construidos <span className="text-xs text-gray-400">(opcional)</span>
            </label>
            <input
              id="metrosConstruidos"
              type="number"
              min={0}
              step={0.01}
              className={claseInput}
              {...register('caracteristicas.metrosConstruidos')}
            />
          </div>
        </div>

        {/* Campos opcionales: pisos, piso, estrato, antigüedad */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <label htmlFor="pisos" className="mb-1 block text-sm font-medium text-gray-700">
              N.° Pisos <span className="text-xs text-gray-400">(opcional)</span>
            </label>
            <input
              id="pisos"
              type="number"
              min={1}
              className={claseInput}
              {...register('caracteristicas.pisos')}
            />
          </div>
          <div>
            <label htmlFor="piso" className="mb-1 block text-sm font-medium text-gray-700">
              Piso <span className="text-xs text-gray-400">(opcional)</span>
            </label>
            <input
              id="piso"
              type="number"
              min={0}
              className={claseInput}
              {...register('caracteristicas.piso')}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Estrato <span className="text-xs text-gray-400">(opcional)</span>
            </label>
            <Controller
              control={control}
              name="caracteristicas.estrato"
              render={({ field }) => (
                <SelectPersonalizado
                  valor={field.value}
                  onChange={field.onChange}
                  opciones={OPCIONES_ESTRATO}
                />
              )}
            />
          </div>
          <div>
            <label htmlFor="antiguedad" className="mb-1 block text-sm font-medium text-gray-700">
              Antigüedad <span className="text-xs text-gray-400">(años)</span>
            </label>
            <input
              id="antiguedad"
              type="number"
              min={0}
              className={claseInput}
              {...register('caracteristicas.antiguedad')}
            />
          </div>
        </div>

        {/* Permite renta corta */}
        <div className="flex items-center gap-3">
          <input
            id="permiteRentaCorta"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            {...register('caracteristicas.permiteRentaCorta')}
          />
          <label htmlFor="permiteRentaCorta" className="text-sm font-medium text-gray-700">
            Apto para renta corta (Airbnb, Booking, etc.)
          </label>
        </div>

        {/* Instalaciones y amenidades */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Instalaciones y Amenidades{' '}
            <span className="text-xs text-gray-400">(opcional)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputInstalacion}
              onChange={(e) => setInputInstalacion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  agregarInstalacion();
                }
              }}
              placeholder="ej: Piscina, Gimnasio, Ascensor..."
              className={claseInput}
            />
            <button
              type="button"
              onClick={agregarInstalacion}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              +
            </button>
          </div>
          {instalaciones.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {instalaciones.map((inst) => (
                <span
                  key={inst}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                >
                  {inst}
                  <button
                    type="button"
                    onClick={() => eliminarInstalacion(inst)}
                    className="ml-1 text-gray-400 hover:text-gray-600"
                    aria-label={`Eliminar ${inst}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
