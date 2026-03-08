'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import type { CamposFormulario } from './tipos';

// ── Estilos reutilizables ──────────────────────────────────────────────────

const claseInput =
  'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-colors';

const claseError = 'mt-1 text-sm text-red-600';

// ── Componente ────────────────────────────────────────────────────────────

export default function SeccionInversion() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CamposFormulario>();

  const [inputDocumento, setInputDocumento] = useState('');
  const documentos = watch('inversion.documentosRequeridos');

  function agregarDocumento() {
    const doc = inputDocumento.trim();
    if (doc && !documentos.includes(doc) && documentos.length < 20) {
      setValue('inversion.documentosRequeridos', [...documentos, doc]);
      setInputDocumento('');
    }
  }

  function eliminarDocumento(docAEliminar: string) {
    setValue(
      'inversion.documentosRequeridos',
      documentos.filter((d) => d !== docAEliminar),
    );
  }

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/30 p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold text-amber-900">
        Datos de Inversión
      </h2>
      <p className="mb-6 text-sm text-amber-700">
        Información exclusiva del inmueble bancario. La entidad bancaria nunca se muestra al público.
      </p>

      <div className="grid gap-6">
        {/* Entidad Bancaria (obligatorio) */}
        <div>
          <label htmlFor="inv-entidad" className="mb-1 block text-sm font-medium text-gray-700">
            Entidad Bancaria <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="inv-entidad"
            type="text"
            aria-invalid={errors.inversion?.entidadBancaria ? 'true' : 'false'}
            className={claseInput}
            placeholder="Nombre del banco (solo visible para admin)"
            {...register('inversion.entidadBancaria', {
              required: 'La entidad bancaria es obligatoria para inversiones.',
            })}
          />
          {errors.inversion?.entidadBancaria && (
            <p className={claseError}>{errors.inversion.entidadBancaria.message}</p>
          )}
        </div>

        {/* Referencia y Precio Listado Banco */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="inv-referencia" className="mb-1 block text-sm font-medium text-gray-700">
              Referencia de la Entidad <span className="text-xs text-gray-400">(opcional)</span>
            </label>
            <input
              id="inv-referencia"
              type="text"
              className={`${claseInput} font-mono`}
              placeholder="Expediente o referencia"
              {...register('inversion.referenciaEntidad')}
            />
          </div>
          <div>
            <label htmlFor="inv-precio-banco" className="mb-1 block text-sm font-medium text-gray-700">
              Precio Listado del Banco <span className="text-xs text-gray-400">(opcional)</span>
            </label>
            <input
              id="inv-precio-banco"
              type="number"
              min="0"
              className={claseInput}
              placeholder="Precio original del banco"
              {...register('inversion.precioListadoBanco')}
            />
          </div>
        </div>

        {/* Acepta Contraoferta */}
        <div className="flex items-center gap-3">
          <input
            id="inv-contraoferta"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            {...register('inversion.aceptaContraoferta')}
          />
          <label htmlFor="inv-contraoferta" className="text-sm font-medium text-gray-700">
            Acepta ofertas por debajo del precio de lista
          </label>
        </div>

        {/* Documentos Requeridos */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Documentos Requeridos <span className="text-xs text-gray-400">(opcional — máx 20)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputDocumento}
              onChange={(e) => setInputDocumento(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  agregarDocumento();
                }
              }}
              placeholder="ej: Cédula de ciudadanía"
              className={claseInput}
            />
            <button
              type="button"
              onClick={agregarDocumento}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              +
            </button>
          </div>
          {documentos.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {documentos.map((doc) => (
                <span
                  key={doc}
                  className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800"
                >
                  {doc}
                  <button
                    type="button"
                    onClick={() => eliminarDocumento(doc)}
                    className="ml-1 text-amber-500 hover:text-amber-700"
                    aria-label={`Eliminar documento ${doc}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Notas Internas */}
        <div>
          <label htmlFor="inv-notas" className="mb-1 block text-sm font-medium text-gray-700">
            Notas Internas <span className="text-xs text-gray-400">(solo visible para admin)</span>
          </label>
          <textarea
            id="inv-notas"
            rows={3}
            className={`${claseInput} resize-y`}
            placeholder="Notas sobre el proceso con el banco, contactos, etc."
            {...register('inversion.notasInternas')}
          />
        </div>
      </div>
    </section>
  );
}
