'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import type { CamposFormularioOferta, Moneda } from '@/types';

type ResultadoOferta = { ok: true } | { ok: false; error: string };

interface Props {
  accion: (campos: CamposFormularioOferta) => Promise<ResultadoOferta>;
  whatsappAgente?: string;
  tituloPropiedad: string;
  precioReferencia: string;
  aceptaContraoferta?: boolean;
}

// Estilos reutilizables — coherentes con FormularioContacto
const claseInput =
  'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 ' +
  'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 ' +
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

// ── Tipos del formulario interno ──────────────────────────────────────────────

interface CamposForm {
  nombre: string;
  telefono: string;
  email: string;
  montoOfertado: string; // string en el input, se parsea al enviar
  monedaOferta: Moneda;
  mensaje: string;
  aceptaTerminos: boolean;
}

const OPCIONES_MONEDA: { valor: Moneda; etiqueta: string }[] = [
  { valor: 'COP', etiqueta: 'COP' },
  { valor: 'USD', etiqueta: 'USD' },
  { valor: 'EUR', etiqueta: 'EUR' },
];

// ── Componente ────────────────────────────────────────────────────────────────

export default function FormularioOferta({
  accion,
  whatsappAgente,
  tituloPropiedad,
  precioReferencia,
  aceptaContraoferta,
}: Props) {
  const [resultado, setResultado] = useState<ResultadoOferta | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CamposForm>({
    defaultValues: {
      monedaOferta: 'COP',
      aceptaTerminos: false,
    },
  });

  const onSubmit = (campos: CamposForm) => {
    const monto = Number(campos.montoOfertado);
    if (!Number.isFinite(monto) || monto <= 0) return;

    setResultado(null);
    startTransition(async () => {
      const res = await accion({
        nombre: campos.nombre,
        telefono: campos.telefono,
        email: campos.email,
        montoOfertado: monto,
        monedaOferta: campos.monedaOferta,
        mensaje: campos.mensaje,
        aceptaTerminos: campos.aceptaTerminos,
      });
      setResultado(res);
      if (res.ok) reset();
    });
  };

  const mensajeWhatsApp = encodeURIComponent(
    `Hola, estoy interesado en la propiedad de inversión "${tituloPropiedad}". Me gustaría hacer una oferta.`,
  );

  const numeroWhatsApp = whatsappAgente?.replace(/\D/g, '') ?? '';

  return (
    <div className="space-y-3">
      {/* Precio de referencia */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Precio de lista</p>
        <p className="text-lg font-bold text-amber-900">{precioReferencia}</p>
        {aceptaContraoferta && (
          <p className="text-xs text-amber-600 mt-1">Se aceptan contraofertas</p>
        )}
      </div>

      {resultado?.ok ? (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center">
          <IconoCheck />
          <p className="font-semibold text-emerald-800">Oferta enviada con exito</p>
          <p className="text-sm text-emerald-700 mt-1">
            Nos pondremos en contacto contigo para informarte sobre el proceso.
          </p>
          <button
            onClick={() => setResultado(null)}
            className="mt-4 text-xs text-emerald-600 underline underline-offset-2 hover:text-emerald-800 transition-colors"
          >
            Enviar otra oferta
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="oferta-nombre" className={claseLabel}>Nombre</label>
            <input
              id="oferta-nombre"
              type="text"
              autoComplete="name"
              placeholder="Tu nombre completo"
              className={claseInput + (errors.nombre ? ' border-red-400' : '')}
              aria-invalid={!!errors.nombre}
              {...register('nombre', {
                required: 'El nombre es obligatorio',
                maxLength: { value: 120, message: 'Maximo 120 caracteres' },
              })}
            />
            {errors.nombre && <p className="mt-1 text-xs text-red-600" role="alert">{errors.nombre.message}</p>}
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="oferta-telefono" className={claseLabel}>Telefono</label>
            <input
              id="oferta-telefono"
              type="tel"
              autoComplete="tel"
              placeholder="+57 300 000 0000"
              className={claseInput + (errors.telefono ? ' border-red-400' : '')}
              aria-invalid={!!errors.telefono}
              {...register('telefono', {
                required: 'El telefono es obligatorio',
                pattern: {
                  value: /^[+\d\s\-().]{6,30}$/,
                  message: 'Formato de telefono no valido',
                },
              })}
            />
            {errors.telefono && <p className="mt-1 text-xs text-red-600" role="alert">{errors.telefono.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="oferta-email" className={claseLabel}>Email</label>
            <input
              id="oferta-email"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              className={claseInput + (errors.email ? ' border-red-400' : '')}
              aria-invalid={!!errors.email}
              {...register('email', {
                required: 'El email es obligatorio para ofertas',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Formato de email no valido',
                },
              })}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600" role="alert">{errors.email.message}</p>}
          </div>

          {/* Monto ofertado + Moneda */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label htmlFor="oferta-monto" className={claseLabel}>Monto ofertado</label>
              <input
                id="oferta-monto"
                type="number"
                min="1"
                placeholder="0"
                className={claseInput + (errors.montoOfertado ? ' border-red-400' : '')}
                aria-invalid={!!errors.montoOfertado}
                {...register('montoOfertado', {
                  required: 'El monto es obligatorio',
                  validate: (v) => {
                    const n = Number(v);
                    if (!Number.isFinite(n) || n <= 0) return 'Debe ser mayor a 0';
                    return true;
                  },
                })}
              />
              {errors.montoOfertado && <p className="mt-1 text-xs text-red-600" role="alert">{errors.montoOfertado.message}</p>}
            </div>
            <div>
              <label htmlFor="oferta-moneda" className={claseLabel}>Moneda</label>
              <select
                id="oferta-moneda"
                className={claseInput}
                {...register('monedaOferta')}
              >
                {OPCIONES_MONEDA.map((m) => (
                  <option key={m.valor} value={m.valor}>{m.etiqueta}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mensaje */}
          <div>
            <label htmlFor="oferta-mensaje" className={claseLabel}>Mensaje</label>
            <textarea
              id="oferta-mensaje"
              rows={3}
              placeholder="Comentarios adicionales sobre tu oferta..."
              className={claseInput + ' resize-none' + (errors.mensaje ? ' border-red-400' : '')}
              aria-invalid={!!errors.mensaje}
              {...register('mensaje', {
                required: 'El mensaje es obligatorio',
                maxLength: { value: 1000, message: 'Maximo 1000 caracteres' },
              })}
            />
            {errors.mensaje && <p className="mt-1 text-xs text-red-600" role="alert">{errors.mensaje.message}</p>}
          </div>

          {/* Aceptar términos */}
          <div className="flex items-start gap-2">
            <input
              id="oferta-terminos"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              {...register('aceptaTerminos', {
                required: 'Debes aceptar los terminos',
              })}
            />
            <label htmlFor="oferta-terminos" className="text-xs text-gray-600">
              Acepto que mi informacion sea utilizada para gestionar esta oferta y que el proceso de negociacion esta sujeto a la aprobacion del comite correspondiente.
            </label>
          </div>
          {errors.aceptaTerminos && <p className="text-xs text-red-600" role="alert">{errors.aceptaTerminos.message}</p>}

          {/* Error del servidor */}
          {resultado?.ok === false && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2.5" role="alert">
              {resultado.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {isPending ? 'Enviando oferta...' : 'Enviar oferta'}
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
