'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import type { ResultadoGuardarLead } from '@/lib/leads/guardarLead';
import type { CamposFormularioContacto } from '@/types/lead';

interface Props {
  accion: (campos: CamposFormularioContacto) => Promise<ResultadoGuardarLead>;
  whatsappAgente?: string;
  tituloPropiedad: string;
}

// Estilos reutilizables — coherentes con FiltrosBusqueda
const claseInput =
  'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 ' +
  'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ' +
  'focus:border-transparent transition-colors';

const claseLabel =
  'text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block';

// ── Íconos ────────────────────────────────────────────────────────────────────

function IconoCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-8 h-8 text-emerald-500 mx-auto mb-3" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconoWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.532 5.845L0 24l6.336-1.51A11.956 11.956 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.369l-.36-.214-3.727.978.995-3.636-.235-.374A9.818 9.818 0 1112 21.818z" />
    </svg>
  );
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function FormularioContacto({ accion, whatsappAgente, tituloPropiedad }: Props) {
  const [resultado, setResultado] = useState<ResultadoGuardarLead | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CamposFormularioContacto>();

  const onSubmit = (campos: CamposFormularioContacto) => {
    setResultado(null);
    startTransition(async () => {
      const res = await accion(campos);
      setResultado(res);
      if (res.ok) reset();
    });
  };

  const mensajeWhatsApp = encodeURIComponent(
    `Hola, estoy interesado en la propiedad "${tituloPropiedad}". ¿Me pueden dar más información?`,
  );

  const numeroWhatsApp = whatsappAgente?.replace(/\D/g, '') ?? '';

  return (
    <div className="space-y-3">
      {resultado?.ok ? (
        // Estado de éxito
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center">
          <IconoCheck />
          <p className="font-semibold text-emerald-800">¡Mensaje enviado!</p>
          <p className="text-sm text-emerald-700 mt-1">
            Nos pondremos en contacto contigo pronto.
          </p>
          <button
            onClick={() => setResultado(null)}
            className="mt-4 text-xs text-emerald-600 underline underline-offset-2 hover:text-emerald-800 transition-colors"
          >
            Enviar otro mensaje
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="contacto-nombre" className={claseLabel}>
              Nombre
            </label>
            <input
              id="contacto-nombre"
              type="text"
              autoComplete="name"
              placeholder="Tu nombre completo"
              className={claseInput + (errors.nombre ? ' border-red-400' : '')}
              aria-invalid={!!errors.nombre}
              aria-describedby={errors.nombre ? 'error-nombre' : undefined}
              {...register('nombre', {
                required: 'El nombre es obligatorio',
                maxLength: { value: 120, message: 'Máximo 120 caracteres' },
              })}
            />
            {errors.nombre && (
              <p id="error-nombre" className="mt-1 text-xs text-red-600" role="alert">
                {errors.nombre.message}
              </p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="contacto-telefono" className={claseLabel}>
              Teléfono
            </label>
            <input
              id="contacto-telefono"
              type="tel"
              autoComplete="tel"
              placeholder="+57 300 000 0000"
              className={claseInput + (errors.telefono ? ' border-red-400' : '')}
              aria-invalid={!!errors.telefono}
              aria-describedby={errors.telefono ? 'error-telefono' : undefined}
              {...register('telefono', {
                required: 'El teléfono es obligatorio',
                pattern: {
                  value: /^[+\d\s\-().]{6,30}$/,
                  message: 'Formato de teléfono no válido',
                },
              })}
            />
            {errors.telefono && (
              <p id="error-telefono" className="mt-1 text-xs text-red-600" role="alert">
                {errors.telefono.message}
              </p>
            )}
          </div>

          {/* Mensaje */}
          <div>
            <label htmlFor="contacto-mensaje" className={claseLabel}>
              Mensaje
            </label>
            <textarea
              id="contacto-mensaje"
              rows={3}
              placeholder={`Me interesa la propiedad "${tituloPropiedad}"...`}
              className={claseInput + ' resize-none' + (errors.mensaje ? ' border-red-400' : '')}
              aria-invalid={!!errors.mensaje}
              aria-describedby={errors.mensaje ? 'error-mensaje' : undefined}
              {...register('mensaje', {
                required: 'El mensaje es obligatorio',
                maxLength: { value: 1000, message: 'Máximo 1000 caracteres' },
              })}
            />
            {errors.mensaje && (
              <p id="error-mensaje" className="mt-1 text-xs text-red-600" role="alert">
                {errors.mensaje.message}
              </p>
            )}
          </div>

          {/* Error del servidor */}
          {resultado?.error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2.5" role="alert">
              {resultado.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {isPending ? 'Enviando...' : 'Enviar mensaje'}
          </button>
        </form>
      )}

      {/* Botón WhatsApp */}
      {whatsappAgente && numeroWhatsApp && (
        <a
          href={`https://wa.me/${numeroWhatsApp}?text=${mensajeWhatsApp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          <IconoWhatsApp />
          Consultar por WhatsApp
        </a>
      )}
    </div>
  );
}
