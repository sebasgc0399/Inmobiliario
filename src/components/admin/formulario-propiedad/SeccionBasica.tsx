'use client';

import { useEffect, useState } from 'react';
import { useFormContext, useWatch, Controller } from 'react-hook-form';

import SelectPersonalizado from '@/components/SelectPersonalizado';
import { generarSlug } from '@/lib/utils/generarSlug';
import { verificarSlugUnico } from '@/actions/propiedades/verificarSlugUnico';
import type { CamposFormulario } from './tipos';

// ── Opciones de los selects ────────────────────────────────────────────────

const OPCIONES_TIPO = [
  { valor: 'apartamento', etiqueta: 'Apartamento' },
  { valor: 'casa', etiqueta: 'Casa' },
  { valor: 'apartaestudio', etiqueta: 'Apartaestudio' },
  { valor: 'finca', etiqueta: 'Finca' },
  { valor: 'local', etiqueta: 'Local' },
  { valor: 'oficina', etiqueta: 'Oficina' },
  { valor: 'terreno', etiqueta: 'Terreno' },
  { valor: 'bodega', etiqueta: 'Bodega' },
];

const OPCIONES_MODO_NEGOCIO = [
  { valor: 'venta', etiqueta: 'Venta' },
  { valor: 'alquiler', etiqueta: 'Alquiler' },
  { valor: 'venta_alquiler', etiqueta: 'Venta y Alquiler' },
];

const OPCIONES_CONDICION = [
  { valor: 'nuevo', etiqueta: 'Nuevo' },
  { valor: 'usado', etiqueta: 'Usado' },
  { valor: 'sobre_planos', etiqueta: 'Sobre Planos' },
];

// ── Tipos internos ─────────────────────────────────────────────────────────

type EstadoSlug = 'inactivo' | 'verificando' | 'disponible' | 'ocupado';

// ── Props ──────────────────────────────────────────────────────────────────

interface Props {
  modoEdicion?: boolean;
  slugOriginal?: string;    // Slug actual de la propiedad (para ignorar en la validación)
  propiedadId?: string;     // ID de la propiedad (para identificarla en slugUnicos)
}

// ── Estilos reutilizables ──────────────────────────────────────────────────

const claseInput =
  'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors';

const claseError = 'mt-1 text-sm text-red-600';

// ── Componente ────────────────────────────────────────────────────────────

export default function SeccionBasica({
  modoEdicion = false,
  slugOriginal,
  propiedadId,
}: Props) {
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CamposFormulario>();

  // Estado UI — solo para el input de tag en progreso (no es un campo del form)
  const [inputTag, setInputTag] = useState('');

  // En modo edición el slug ya tiene un valor asignado y no debe auto-regenerarse
  // desde el título (cambiar el slug de una propiedad publicada rompería las URLs).
  const [slugEditadoManualmente, setSlugEditadoManualmente] = useState(modoEdicion);

  // Estado de la validación de unicidad del slug (solo activa en modo edición)
  const [estadoSlug, setEstadoSlug] = useState<EstadoSlug>('inactivo');

  const titulo = useWatch({ control, name: 'titulo' });
  const slugValue = useWatch({ control, name: 'slug' });
  const tags = watch('tags');

  // Auto-generar slug desde el título (solo en modo creación y si no fue editado manualmente)
  useEffect(() => {
    if (!slugEditadoManualmente && titulo) {
      setValue('slug', generarSlug(titulo), { shouldValidate: false });
    }
  }, [titulo, slugEditadoManualmente, setValue]);

  // Validación de unicidad del slug con debounce 500ms.
  // Solo activa cuando hay slugOriginal/propiedadId (modo edición) o cuando el slug
  // ha sido escrito manualmente en modo creación.
  useEffect(() => {
    // No validar si el slug es el mismo que el original (no cambió nada)
    if (!slugValue || slugValue === slugOriginal) {
      setEstadoSlug('inactivo');
      return;
    }

    // No activar el debounce si el slug aún se está auto-generando en creación
    // y el usuario no ha interactuado con el campo
    if (!modoEdicion && !slugEditadoManualmente) {
      setEstadoSlug('inactivo');
      return;
    }

    setEstadoSlug('verificando');

    const timer = setTimeout(async () => {
      try {
        const disponible = await verificarSlugUnico(slugValue, propiedadId);
        setEstadoSlug(disponible ? 'disponible' : 'ocupado');
      } catch {
        setEstadoSlug('inactivo');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slugValue, slugOriginal, propiedadId, modoEdicion, slugEditadoManualmente]);

  function agregarTag() {
    const tag = inputTag.trim();
    if (tag && !tags.includes(tag) && tags.length < 20) {
      setValue('tags', [...tags, tag]);
      setInputTag('');
    }
  }

  function eliminarTag(tagAEliminar: string) {
    setValue('tags', tags.filter((t) => t !== tagAEliminar));
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-semibold text-gray-900">Información Básica</h2>

      <div className="grid gap-6">

        {/* Título */}
        <div>
          <label htmlFor="titulo" className="mb-1 block text-sm font-medium text-gray-700">
            Título <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="titulo"
            type="text"
            aria-invalid={errors.titulo ? 'true' : 'false'}
            className={claseInput}
            {...register('titulo', {
              required: 'El título es obligatorio.',
              minLength: { value: 5, message: 'Mínimo 5 caracteres.' },
              maxLength: { value: 200, message: 'Máximo 200 caracteres.' },
            })}
          />
          {errors.titulo && <p className={claseError}>{errors.titulo.message}</p>}
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="mb-1 block text-sm font-medium text-gray-700">
            Slug URL <span aria-hidden="true" className="text-red-500">*</span>
            <span className="ml-2 text-xs font-normal text-gray-400">
              {modoEdicion
                ? '(editable — se validará unicidad al cambiar)'
                : '(auto-generado desde el título — editable)'}
            </span>
          </label>
          <input
            id="slug"
            type="text"
            aria-invalid={errors.slug ? 'true' : 'false'}
            className={`${claseInput} font-mono`}
            {...register('slug', {
              required: 'El slug es obligatorio.',
              pattern: {
                value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                message: 'Solo letras minúsculas, números y guiones.',
              },
              onChange: () => setSlugEditadoManualmente(true),
            })}
          />
          {errors.slug && <p className={claseError}>{errors.slug.message}</p>}

          {/* Indicador de unicidad */}
          {estadoSlug !== 'inactivo' && (
            <p
              className={`mt-1 text-xs font-medium ${
                estadoSlug === 'verificando'
                  ? 'text-gray-500'
                  : estadoSlug === 'disponible'
                  ? 'text-emerald-600'
                  : 'text-red-600'
              }`}
              aria-live="polite"
            >
              {estadoSlug === 'verificando' && 'Verificando disponibilidad…'}
              {estadoSlug === 'disponible' && '✓ Slug disponible'}
              {estadoSlug === 'ocupado' && '✗ Este slug ya está en uso por otra propiedad'}
            </p>
          )}
        </div>

        {/* Código de Propiedad */}
        <div>
          <label htmlFor="codigoPropiedad" className="mb-1 block text-sm font-medium text-gray-700">
            Código de Propiedad <span aria-hidden="true" className="text-red-500">*</span>
            <span className="ml-2 text-xs font-normal text-gray-400">(ej: REF-045)</span>
          </label>
          <input
            id="codigoPropiedad"
            type="text"
            aria-invalid={errors.codigoPropiedad ? 'true' : 'false'}
            className={`${claseInput} font-mono`}
            placeholder="REF-001"
            {...register('codigoPropiedad', {
              required: 'El código es obligatorio.',
              maxLength: { value: 30, message: 'Máximo 30 caracteres.' },
            })}
          />
          {errors.codigoPropiedad && <p className={claseError}>{errors.codigoPropiedad.message}</p>}
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="descripcion" className="mb-1 block text-sm font-medium text-gray-700">
            Descripción <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <textarea
            id="descripcion"
            rows={5}
            aria-invalid={errors.descripcion ? 'true' : 'false'}
            className={`${claseInput} resize-y`}
            {...register('descripcion', {
              required: 'La descripción es obligatoria.',
              minLength: { value: 20, message: 'Mínimo 20 caracteres.' },
            })}
          />
          {errors.descripcion && <p className={claseError}>{errors.descripcion.message}</p>}
        </div>

        {/* Tipo / Modo Negocio / Condición */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tipo</label>
            <Controller
              control={control}
              name="tipo"
              render={({ field }) => (
                <SelectPersonalizado
                  valor={field.value}
                  onChange={field.onChange}
                  opciones={OPCIONES_TIPO}
                />
              )}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Modo de Negocio</label>
            <Controller
              control={control}
              name="modoNegocio"
              render={({ field }) => (
                <SelectPersonalizado
                  valor={field.value}
                  onChange={field.onChange}
                  opciones={OPCIONES_MODO_NEGOCIO}
                />
              )}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Condición</label>
            <Controller
              control={control}
              name="condicion"
              render={({ field }) => (
                <SelectPersonalizado
                  valor={field.value}
                  onChange={field.onChange}
                  opciones={OPCIONES_CONDICION}
                />
              )}
            />
          </div>
        </div>

        {/* Destacado */}
        <div className="flex items-center gap-3">
          <input
            id="destacado"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            {...register('destacado')}
          />
          <label htmlFor="destacado" className="text-sm font-medium text-gray-700">
            Destacar en home y resultados de búsqueda
          </label>
        </div>

        {/* Tour Virtual y Video */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="tourVirtual" className="mb-1 block text-sm font-medium text-gray-700">
              URL Tour Virtual <span className="text-xs text-gray-400">(opcional)</span>
            </label>
            <input
              id="tourVirtual"
              type="url"
              placeholder="https://..."
              className={claseInput}
              {...register('tourVirtual')}
            />
          </div>
          <div>
            <label htmlFor="videoUrl" className="mb-1 block text-sm font-medium text-gray-700">
              URL Video YouTube <span className="text-xs text-gray-400">(opcional)</span>
            </label>
            <input
              id="videoUrl"
              type="url"
              placeholder="https://youtube.com/..."
              className={claseInput}
              {...register('videoUrl')}
            />
          </div>
        </div>

        {/* Etiquetas (tags) */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Etiquetas <span className="text-xs text-gray-400">(opcional — máx 20)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputTag}
              onChange={(e) => setInputTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  agregarTag();
                }
              }}
              placeholder="ej: cerca al metro"
              className={claseInput}
            />
            <button
              type="button"
              onClick={agregarTag}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              +
            </button>
          </div>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => eliminarTag(tag)}
                    className="ml-1 text-blue-400 hover:text-blue-600"
                    aria-label={`Eliminar etiqueta ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Datos del Agente */}
        <fieldset className="rounded-xl border border-gray-100 p-4">
          <legend className="px-2 text-sm font-medium text-gray-600">
            Datos del Agente <span className="text-xs font-normal text-gray-400">(opcional)</span>
          </legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="agente-nombre" className="mb-1 block text-xs font-medium text-gray-600">
                Nombre
              </label>
              <input
                id="agente-nombre"
                type="text"
                className={claseInput}
                {...register('agente.nombre')}
              />
            </div>
            <div>
              <label htmlFor="agente-telefono" className="mb-1 block text-xs font-medium text-gray-600">
                Teléfono
              </label>
              <input
                id="agente-telefono"
                type="tel"
                placeholder="+573001234567"
                className={claseInput}
                {...register('agente.telefono')}
              />
            </div>
            <div>
              <label htmlFor="agente-email" className="mb-1 block text-xs font-medium text-gray-600">
                Email
              </label>
              <input
                id="agente-email"
                type="email"
                className={claseInput}
                {...register('agente.email')}
              />
            </div>
            <div>
              <label htmlFor="agente-whatsapp" className="mb-1 block text-xs font-medium text-gray-600">
                WhatsApp
              </label>
              <input
                id="agente-whatsapp"
                type="tel"
                placeholder="+573001234567"
                className={claseInput}
                {...register('agente.whatsapp')}
              />
            </div>
          </div>
        </fieldset>

      </div>
    </section>
  );
}
