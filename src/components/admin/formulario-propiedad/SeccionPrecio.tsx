'use client';

import { useFormContext, Controller, useWatch } from 'react-hook-form';

import SelectPersonalizado from '@/components/SelectPersonalizado';
import type { CamposFormulario } from './tipos';
import type { Moneda } from '@/types';

// ── Opciones de moneda ────────────────────────────────────────────────────

const OPCIONES_MONEDA = [
  { valor: 'COP', etiqueta: 'COP — Peso Colombiano' },
  { valor: 'USD', etiqueta: 'USD — Dólar Americano' },
  { valor: 'EUR', etiqueta: 'EUR — Euro' },
];

// Locales para el formato visual del precio
const LOCALES_MONEDA: Record<Moneda, string> = {
  COP: 'es-CO',
  USD: 'en-US',
  EUR: 'de-DE',
};

// ── Estilos reutilizables ──────────────────────────────────────────────────

const claseInput =
  'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors';

const claseError = 'mt-1 text-sm text-red-600';

// ── Componente ────────────────────────────────────────────────────────────

export default function SeccionPrecio() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CamposFormulario>();

  // Valores en tiempo real para el preview formateado
  const valorRaw = useWatch({ control, name: 'precio.valor' });
  const moneda = useWatch({ control, name: 'precio.moneda' }) as Moneda;

  const valorFormateado = (() => {
    const n = Number(valorRaw);
    if (!n || isNaN(n) || n <= 0) return null;
    try {
      return new Intl.NumberFormat(LOCALES_MONEDA[moneda] ?? 'es-CO', {
        style: 'currency',
        currency: moneda ?? 'COP',
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      return null;
    }
  })();

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-semibold text-gray-900">Precio</h2>

      <div className="grid gap-6">

        {/* Valor y Moneda */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="precio-valor" className="mb-1 block text-sm font-medium text-gray-700">
              Valor <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <input
              id="precio-valor"
              type="number"
              min={0}
              className={claseInput}
              aria-invalid={errors.precio?.valor ? 'true' : 'false'}
              {...register('precio.valor', {
                required: 'El valor es obligatorio.',
                min: { value: 1, message: 'Debe ser mayor a 0.' },
                valueAsNumber: true,
              })}
            />
            {/* Preview formateado — solo visual, no afecta el valor del campo */}
            {valorFormateado && (
              <p className="mt-1 text-xs font-medium text-gray-500">{valorFormateado}</p>
            )}
            {errors.precio?.valor && (
              <p className={claseError}>{errors.precio.valor.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Moneda</label>
            <Controller
              control={control}
              name="precio.moneda"
              render={({ field }) => (
                <SelectPersonalizado
                  valor={field.value}
                  onChange={field.onChange}
                  opciones={OPCIONES_MONEDA}
                />
              )}
            />
          </div>
        </div>

        {/* Admin mensual e impuesto predial */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="precio-adminMensual" className="mb-1 block text-sm font-medium text-gray-700">
              Administración Mensual{' '}
              <span className="text-xs text-gray-400">(opcional)</span>
            </label>
            <input
              id="precio-adminMensual"
              type="number"
              min={0}
              className={claseInput}
              {...register('precio.adminMensual')}
            />
          </div>
          <div>
            <label htmlFor="precio-impuestoPredial" className="mb-1 block text-sm font-medium text-gray-700">
              Impuesto Predial Anual{' '}
              <span className="text-xs text-gray-400">(opcional)</span>
            </label>
            <input
              id="precio-impuestoPredial"
              type="number"
              min={0}
              className={claseInput}
              {...register('precio.impuestoPredial')}
            />
          </div>
        </div>

        {/* Negociable */}
        <div className="flex items-center gap-3">
          <input
            id="precio-negociable"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            {...register('precio.negociable')}
          />
          <label htmlFor="precio-negociable" className="text-sm font-medium text-gray-700">
            Precio negociable
          </label>
        </div>

      </div>
    </section>
  );
}
