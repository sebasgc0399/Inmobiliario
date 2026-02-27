'use client';

import { useEffect } from 'react';
import { useFormContext, useWatch, Controller } from 'react-hook-form';

import SelectPersonalizado from '@/components/SelectPersonalizado';
import ubicacionesData from '@/data/ubicaciones.json';
import type { CamposFormulario } from './tipos';

// ── Tipado del JSON de ubicaciones ─────────────────────────────────────────
type DatosUbicaciones = Record<string, Record<string, string[]>>;
const ubicaciones = ubicacionesData as DatosUbicaciones;

// ── Estilos reutilizables ──────────────────────────────────────────────────
const claseInput =
  'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors';

const claseError = 'mt-1 text-sm text-red-600';

// ── Componente ────────────────────────────────────────────────────────────

export default function SeccionUbicacion() {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<CamposFormulario>();

  // Observar país y departamento para los selectores encadenados
  const pais = useWatch({ control, name: 'ubicacion.pais' });
  const departamento = useWatch({ control, name: 'ubicacion.departamento' });

  // Opciones derivadas computadas en el render (no estado — son derivadas del JSON estático)
  const opcionesPaises = Object.keys(ubicaciones).map((p) => ({ valor: p, etiqueta: p }));

  const opcionesDepartamentos =
    pais && ubicaciones[pais]
      ? Object.keys(ubicaciones[pais]).map((d) => ({ valor: d, etiqueta: d }))
      : [];

  const opcionesMunicipios =
    pais && departamento && ubicaciones[pais]?.[departamento]
      ? ubicaciones[pais][departamento].map((m) => ({ valor: m, etiqueta: m }))
      : [];

  // Limpiar municipio al cambiar departamento
  useEffect(() => {
    setValue('ubicacion.municipio', '');
  }, [departamento, setValue]);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-semibold text-gray-900">Ubicación</h2>

      <div className="grid gap-6">

        {/* País */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            País <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="ubicacion.pais"
            rules={{ required: 'El país es obligatorio.' }}
            render={({ field }) => (
              <SelectPersonalizado
                valor={field.value}
                onChange={field.onChange}
                opciones={opcionesPaises}
              />
            )}
          />
          {errors.ubicacion?.pais && <p className={claseError}>{errors.ubicacion.pais.message}</p>}
        </div>

        {/* Departamento / Municipio (encadenados) */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Departamento <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name="ubicacion.departamento"
              rules={{ required: 'El departamento es obligatorio.' }}
              render={({ field }) => (
                <SelectPersonalizado
                  valor={field.value}
                  onChange={field.onChange}
                  opciones={[{ valor: '', etiqueta: 'Seleccionar...' }, ...opcionesDepartamentos]}
                  disabled={!pais}
                />
              )}
            />
            {errors.ubicacion?.departamento && (
              <p className={claseError}>{errors.ubicacion.departamento.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Municipio <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name="ubicacion.municipio"
              rules={{ required: 'El municipio es obligatorio.' }}
              render={({ field }) => (
                <SelectPersonalizado
                  valor={field.value}
                  onChange={field.onChange}
                  opciones={[{ valor: '', etiqueta: 'Seleccionar...' }, ...opcionesMunicipios]}
                  disabled={!departamento}
                />
              )}
            />
            {errors.ubicacion?.municipio && (
              <p className={claseError}>{errors.ubicacion.municipio.message}</p>
            )}
          </div>
        </div>

        {/* Barrio y Dirección */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ubicacion-barrio" className="mb-1 block text-sm font-medium text-gray-700">
              Barrio <span className="text-xs text-gray-400">(opcional)</span>
            </label>
            <input
              id="ubicacion-barrio"
              type="text"
              className={claseInput}
              {...register('ubicacion.barrio')}
            />
          </div>
          <div>
            <label htmlFor="ubicacion-direccion" className="mb-1 block text-sm font-medium text-gray-700">
              Dirección <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <input
              id="ubicacion-direccion"
              type="text"
              aria-invalid={errors.ubicacion?.direccion ? 'true' : 'false'}
              className={claseInput}
              {...register('ubicacion.direccion', {
                required: 'La dirección es obligatoria.',
              })}
            />
            {errors.ubicacion?.direccion && (
              <p className={claseError}>{errors.ubicacion.direccion.message}</p>
            )}
          </div>
        </div>

        {/* Código Postal */}
        <div className="sm:max-w-[200px]">
          <label htmlFor="ubicacion-codigoPostal" className="mb-1 block text-sm font-medium text-gray-700">
            Código Postal <span className="text-xs text-gray-400">(opcional)</span>
          </label>
          <input
            id="ubicacion-codigoPostal"
            type="text"
            className={claseInput}
            {...register('ubicacion.codigoPostal')}
          />
        </div>

        {/* Coordenadas GPS */}
        <fieldset className="rounded-xl border border-gray-100 p-4">
          <legend className="px-2 text-sm font-medium text-gray-600">
            Coordenadas GPS{' '}
            <span className="text-xs font-normal text-gray-400">(opcional)</span>
          </legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ubicacion-latitud" className="mb-1 block text-xs font-medium text-gray-600">
                Latitud
              </label>
              <input
                id="ubicacion-latitud"
                type="number"
                step="any"
                placeholder="6.2442"
                className={claseInput}
                {...register('ubicacion.latitud', {
                  validate: (val) => {
                    if (!val) return true;
                    const n = parseFloat(val);
                    return (n >= -90 && n <= 90) || 'Latitud inválida (−90 a 90).';
                  },
                })}
              />
              {errors.ubicacion?.latitud && (
                <p className={claseError}>{errors.ubicacion.latitud.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="ubicacion-longitud" className="mb-1 block text-xs font-medium text-gray-600">
                Longitud
              </label>
              <input
                id="ubicacion-longitud"
                type="number"
                step="any"
                placeholder="-75.5812"
                className={claseInput}
                {...register('ubicacion.longitud', {
                  validate: (val) => {
                    if (!val) return true;
                    const n = parseFloat(val);
                    return (n >= -180 && n <= 180) || 'Longitud inválida (−180 a 180).';
                  },
                })}
              />
              {errors.ubicacion?.longitud && (
                <p className={claseError}>{errors.ubicacion.longitud.message}</p>
              )}
            </div>
          </div>
        </fieldset>

      </div>
    </section>
  );
}
