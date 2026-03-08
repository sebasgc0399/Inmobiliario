'use client';

import { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import SelectPersonalizado from '@/components/SelectPersonalizado';
import type { TipoPropiedad } from '@/types';

import type { CamposFormulario } from './tipos';

const OPCIONES_ESTRATO = [
  { valor: '', etiqueta: 'Sin estrato' },
  { valor: '1', etiqueta: 'Estrato 1' },
  { valor: '2', etiqueta: 'Estrato 2' },
  { valor: '3', etiqueta: 'Estrato 3' },
  { valor: '4', etiqueta: 'Estrato 4' },
  { valor: '5', etiqueta: 'Estrato 5' },
  { valor: '6', etiqueta: 'Estrato 6' },
];

const claseInput =
  'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200';

const claseError = 'mt-1 text-sm text-red-600';

const TIPOS_RESIDENCIALES: TipoPropiedad[] = [
  'casa',
  'apartamento',
  'apartaestudio',
  'finca',
];

function parsearNumeroCampo(value: unknown): number | '' {
  if (value === '' || value === null || value === undefined) return '';
  const numero = Number(value);
  return Number.isNaN(numero) ? '' : numero;
}

export default function SeccionCaracteristicas() {
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CamposFormulario>();

  const lineaNegocio = useWatch({ control, name: 'lineaNegocio' });
  const tipo = useWatch({ control, name: 'tipo' });
  const esInversion = lineaNegocio === 'inversion';
  const esTipoResidencial = tipo ? TIPOS_RESIDENCIALES.includes(tipo) : false;

  const mostrarHabitaciones = !esInversion && esTipoResidencial;
  const mostrarBanos = !esInversion;
  const mostrarParqueaderos = !esInversion;
  const mostrarPisosYPiso = !esInversion;
  const mostrarEstrato = !esInversion && esTipoResidencial;
  const mostrarAntiguedad = !esInversion;
  const mostrarPermiteRentaCorta = !esInversion && esTipoResidencial;
  const mostrarInstalaciones = !esInversion;

  const habitacionesObligatorias = mostrarHabitaciones;
  const banosObligatorios = !esInversion && esTipoResidencial;
  const parqueaderosObligatorios = !esInversion && esTipoResidencial;

  const [inputInstalacion, setInputInstalacion] = useState('');
  const instalaciones = watch('caracteristicas.instalaciones') ?? [];

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
      instalaciones.filter((item) => item !== instalacion),
    );
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-semibold text-gray-900">Caracteristicas</h2>

      <div className="grid gap-6">
        {(mostrarHabitaciones || mostrarBanos || mostrarParqueaderos) && (
          <div
            className={`grid gap-4 ${mostrarHabitaciones ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}
          >
            {mostrarHabitaciones && (
              <div>
                <label
                  htmlFor="habitaciones"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Habitaciones
                  {habitacionesObligatorias && (
                    <span aria-hidden="true" className="text-red-500">
                      {' '}
                      *
                    </span>
                  )}
                </label>
                <input
                  id="habitaciones"
                  type="number"
                  min={0}
                  className={claseInput}
                  aria-invalid={errors.caracteristicas?.habitaciones ? 'true' : 'false'}
                  {...register('caracteristicas.habitaciones', {
                    setValueAs: parsearNumeroCampo,
                    ...(habitacionesObligatorias && { required: 'Obligatorio.' }),
                    min: { value: 0, message: 'Minimo 0.' },
                  })}
                />
                {errors.caracteristicas?.habitaciones && (
                  <p className={claseError}>{errors.caracteristicas.habitaciones.message}</p>
                )}
              </div>
            )}

            {mostrarBanos && (
              <div>
                <label htmlFor="banos" className="mb-1 block text-sm font-medium text-gray-700">
                  Banos
                  {banosObligatorios ? (
                    <span aria-hidden="true" className="text-red-500">
                      {' '}
                      *
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400"> (opcional)</span>
                  )}
                </label>
                <input
                  id="banos"
                  type="number"
                  min={0}
                  step={0.5}
                  className={claseInput}
                  aria-invalid={errors.caracteristicas?.banos ? 'true' : 'false'}
                  {...register('caracteristicas.banos', {
                    setValueAs: parsearNumeroCampo,
                    ...(banosObligatorios && { required: 'Obligatorio.' }),
                    min: { value: 0, message: 'Minimo 0.' },
                  })}
                />
                {errors.caracteristicas?.banos && (
                  <p className={claseError}>{errors.caracteristicas.banos.message}</p>
                )}
              </div>
            )}

            {mostrarParqueaderos && (
              <div>
                <label
                  htmlFor="parqueaderos"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Parqueaderos
                  {parqueaderosObligatorios ? (
                    <span aria-hidden="true" className="text-red-500">
                      {' '}
                      *
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400"> (opcional)</span>
                  )}
                </label>
                <input
                  id="parqueaderos"
                  type="number"
                  min={0}
                  className={claseInput}
                  aria-invalid={errors.caracteristicas?.parqueaderos ? 'true' : 'false'}
                  {...register('caracteristicas.parqueaderos', {
                    setValueAs: parsearNumeroCampo,
                    ...(parqueaderosObligatorios && { required: 'Obligatorio.' }),
                    min: { value: 0, message: 'Minimo 0.' },
                  })}
                />
                {errors.caracteristicas?.parqueaderos && (
                  <p className={claseError}>{errors.caracteristicas.parqueaderos.message}</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="metrosCuadrados"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
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
                min: { value: 1, message: 'Minimo 1 m2.' },
                valueAsNumber: true,
              })}
            />
            {errors.caracteristicas?.metrosCuadrados && (
              <p className={claseError}>{errors.caracteristicas.metrosCuadrados.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="metrosConstruidos"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
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

        {!esInversion && (
          <>
            {(mostrarPisosYPiso || mostrarEstrato || mostrarAntiguedad) && (
              <div
                className={`grid gap-4 sm:grid-cols-2 ${mostrarEstrato ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}
              >
                {mostrarPisosYPiso && (
                  <div>
                    <label htmlFor="pisos" className="mb-1 block text-sm font-medium text-gray-700">
                      N. Pisos <span className="text-xs text-gray-400">(opcional)</span>
                    </label>
                    <input
                      id="pisos"
                      type="number"
                      min={1}
                      className={claseInput}
                      {...register('caracteristicas.pisos')}
                    />
                  </div>
                )}
                {mostrarPisosYPiso && (
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
                )}
                {mostrarEstrato && (
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
                )}
                {mostrarAntiguedad && (
                  <div>
                    <label
                      htmlFor="antiguedad"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Antiguedad <span className="text-xs text-gray-400">(anos)</span>
                    </label>
                    <input
                      id="antiguedad"
                      type="number"
                      min={0}
                      className={claseInput}
                      {...register('caracteristicas.antiguedad')}
                    />
                  </div>
                )}
              </div>
            )}

            {mostrarPermiteRentaCorta && (
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
            )}

            {mostrarInstalaciones && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Instalaciones y Amenidades{' '}
                  <span className="text-xs text-gray-400">(opcional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputInstalacion}
                    onChange={(event) => setInputInstalacion(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        agregarInstalacion();
                      }
                    }}
                    placeholder="ej: Piscina, Gimnasio, Ascensor..."
                    className={claseInput}
                  />
                  <button
                    type="button"
                    onClick={agregarInstalacion}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
                {instalaciones.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {instalaciones.map((instalacion) => (
                      <span
                        key={instalacion}
                        className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                      >
                        {instalacion}
                        <button
                          type="button"
                          onClick={() => eliminarInstalacion(instalacion)}
                          className="ml-1 text-gray-400 hover:text-gray-600"
                          aria-label={`Eliminar ${instalacion}`}
                        >
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
