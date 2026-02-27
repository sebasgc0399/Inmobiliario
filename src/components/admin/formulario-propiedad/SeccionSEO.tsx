'use client';

import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import type { CamposFormulario } from './tipos';

// ── Constantes ────────────────────────────────────────────────────────────

const MAX_TITLE = 60;
const MAX_DESC = 160;
const UMBRAL_ADVERTENCIA = 0.8; // 80% del límite = color amarillo

// ── Helper: color del contador ─────────────────────────────────────────────

function claseContador(actual: number, maximo: number): string {
  if (actual === 0) return 'text-gray-400';
  if (actual > maximo) return 'text-red-600 font-semibold';
  if (actual / maximo >= UMBRAL_ADVERTENCIA) return 'text-yellow-600';
  return 'text-green-600';
}

// ── Estilos reutilizables ──────────────────────────────────────────────────

const claseInput =
  'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors';

const claseError = 'mt-1 text-sm text-red-600';

// ── Componente ────────────────────────────────────────────────────────────

export default function SeccionSEO() {
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CamposFormulario>();

  // Estado UI — solo para el input de keyword en progreso
  const [inputKeyword, setInputKeyword] = useState('');

  // Valores en tiempo real para contadores y preview
  const metaTitle = useWatch({ control, name: 'seo.metaTitle' }) ?? '';
  const metaDescription = useWatch({ control, name: 'seo.metaDescription' }) ?? '';
  const keywords = watch('seo.keywords');

  const longTitle = metaTitle.length;
  const longDesc = metaDescription.length;

  function agregarKeyword() {
    const kw = inputKeyword.trim().toLowerCase();
    if (kw && !keywords.includes(kw) && keywords.length < 20) {
      setValue('seo.keywords', [...keywords, kw]);
      setInputKeyword('');
    }
  }

  function eliminarKeyword(kw: string) {
    setValue('seo.keywords', keywords.filter((k) => k !== kw));
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-semibold text-gray-900">SEO</h2>

      <div className="grid gap-6">

        {/* Meta Title con contador */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="seo-metaTitle" className="text-sm font-medium text-gray-700">
              Meta Title{' '}
              <span className="text-xs font-normal text-gray-400">(opcional — máx {MAX_TITLE} caracteres)</span>
            </label>
            <span className={`text-xs transition-colors ${claseContador(longTitle, MAX_TITLE)}`}>
              {longTitle}/{MAX_TITLE}
            </span>
          </div>
          <input
            id="seo-metaTitle"
            type="text"
            maxLength={MAX_TITLE + 10}
            aria-invalid={errors.seo?.metaTitle ? 'true' : 'false'}
            className={claseInput}
            {...register('seo.metaTitle', {
              maxLength: { value: MAX_TITLE, message: `Máximo ${MAX_TITLE} caracteres.` },
            })}
          />
          {errors.seo?.metaTitle && (
            <p className={claseError}>{errors.seo.metaTitle.message}</p>
          )}
        </div>

        {/* Meta Description con contador */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="seo-metaDescription" className="text-sm font-medium text-gray-700">
              Meta Description{' '}
              <span className="text-xs font-normal text-gray-400">(opcional — máx {MAX_DESC} caracteres)</span>
            </label>
            <span className={`text-xs transition-colors ${claseContador(longDesc, MAX_DESC)}`}>
              {longDesc}/{MAX_DESC}
            </span>
          </div>
          <textarea
            id="seo-metaDescription"
            rows={3}
            maxLength={MAX_DESC + 20}
            aria-invalid={errors.seo?.metaDescription ? 'true' : 'false'}
            className={`${claseInput} resize-none`}
            {...register('seo.metaDescription', {
              maxLength: { value: MAX_DESC, message: `Máximo ${MAX_DESC} caracteres.` },
            })}
          />
          {errors.seo?.metaDescription && (
            <p className={claseError}>{errors.seo.metaDescription.message}</p>
          )}
        </div>

        {/* Keywords como tags */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Keywords <span className="text-xs text-gray-400">(opcional)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputKeyword}
              onChange={(e) => setInputKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  agregarKeyword();
                }
              }}
              placeholder="ej: apartamento medellin"
              className={claseInput}
            />
            <button
              type="button"
              onClick={agregarKeyword}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              +
            </button>
          </div>
          {keywords.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {keywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => eliminarKeyword(kw)}
                    className="ml-1 text-purple-400 hover:text-purple-600"
                    aria-label={`Eliminar keyword ${kw}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Preview de snippet de Google */}
        {(metaTitle || metaDescription) && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Preview en Google (mockup)
            </p>
            <p className="cursor-default truncate text-sm font-medium leading-snug text-blue-700">
              {metaTitle || 'Título no definido'}
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">
              {metaDescription || 'La descripción aparecerá aquí...'}
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
