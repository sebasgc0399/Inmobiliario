'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import type { CamposFormularioOferta, Moneda } from '@/types';

type ResultadoOferta = { ok: true } | { ok: false; error: string };
type DatosOfertaCliente = Omit<CamposFormularioOferta, 'monedaOferta'>;

interface CamposOfertaForm {
  nombre: string;
  telefono: string;
  email: string;
  montoOfertado: string;
  mensaje: string;
  aceptaTerminos: boolean;
}

interface Props {
  accion: (campos: DatosOfertaCliente) => Promise<ResultadoOferta>;
  whatsappAgente?: string;
  tituloPropiedad: string;
  precioBase: string;
  monedaOferta: Moneda;
  aceptaContraoferta?: boolean;
}

const claseInput =
  'w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 ' +
  'placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-4 ' +
  'focus:ring-amber-100 transition-colors';

const claseLabel =
  'mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500';

function IconoCheck() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      className="mx-auto mb-3 h-8 w-8 text-emerald-500"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconoWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.532 5.845L0 24l6.336-1.51A11.956 11.956 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.369l-.36-.214-3.727.978.995-3.636-.235-.374A9.818 9.818 0 1112 21.818z" />
    </svg>
  );
}

const VALORES_INICIALES: CamposOfertaForm = {
  nombre: '',
  telefono: '',
  email: '',
  montoOfertado: '',
  mensaje: '',
  aceptaTerminos: false,
};

export default function FormularioOferta({
  accion,
  whatsappAgente,
  tituloPropiedad,
  precioBase,
  monedaOferta,
  aceptaContraoferta,
}: Props) {
  const [resultado, setResultado] = useState<ResultadoOferta | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CamposOfertaForm>({
    mode: 'onBlur',
    defaultValues: VALORES_INICIALES,
  });

  function onSubmit(campos: CamposOfertaForm) {
    const montoOfertado = Number(campos.montoOfertado);

    if (!Number.isFinite(montoOfertado) || montoOfertado <= 0) {
      return;
    }

    setResultado(null);
    startTransition(async () => {
      const respuesta = await accion({
        nombre: campos.nombre.trim(),
        telefono: campos.telefono.trim(),
        email: campos.email.trim(),
        montoOfertado,
        mensaje: campos.mensaje.trim(),
        aceptaTerminos: campos.aceptaTerminos,
      });

      setResultado(respuesta);

      if (respuesta.ok) {
        reset(VALORES_INICIALES);
      }
    });
  }

  const numeroWhatsApp = whatsappAgente?.replace(/\D/g, '') ?? '';
  const mensajeWhatsApp = encodeURIComponent(
    `Hola, quiero resolver dudas sobre la oferta formal de "${tituloPropiedad}".`,
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
          Precio base
        </p>
        <p className="mt-1 text-2xl font-bold text-amber-950">{precioBase}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-amber-700">
            Oferta en {monedaOferta}
          </span>
          {aceptaContraoferta && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
              Se aceptan contraofertas
            </span>
          )}
        </div>
      </div>

      {resultado?.ok ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <IconoCheck />
          <p className="font-semibold text-emerald-800">Oferta formal enviada con exito</p>
          <p className="mt-1 text-sm text-emerald-700">
            Registramos tu propuesta y el equipo comercial continuara el proceso contigo.
          </p>
          <button
            type="button"
            onClick={() => setResultado(null)}
            className="mt-4 text-xs font-medium text-emerald-700 underline underline-offset-2 transition-colors hover:text-emerald-900"
          >
            Enviar otra oferta
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="oferta-nombre" className={claseLabel}>
              Nombre completo
            </label>
            <input
              id="oferta-nombre"
              type="text"
              autoComplete="name"
              placeholder="Tu nombre completo"
              className={claseInput + (errors.nombre ? ' border-red-400 ring-0' : '')}
              aria-invalid={errors.nombre ? 'true' : 'false'}
              {...register('nombre', {
                required: 'El nombre es obligatorio.',
                maxLength: { value: 120, message: 'Maximo 120 caracteres.' },
              })}
            />
            {errors.nombre && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.nombre.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="oferta-telefono" className={claseLabel}>
                Telefono
              </label>
              <input
                id="oferta-telefono"
                type="tel"
                autoComplete="tel"
                placeholder="+57 300 000 0000"
                className={claseInput + (errors.telefono ? ' border-red-400 ring-0' : '')}
                aria-invalid={errors.telefono ? 'true' : 'false'}
                {...register('telefono', {
                  required: 'El telefono es obligatorio.',
                  pattern: {
                    value: /^[+\d\s\-().]{6,30}$/,
                    message: 'Formato de telefono no valido.',
                  },
                })}
              />
              {errors.telefono && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {errors.telefono.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="oferta-email" className={claseLabel}>
                Correo
              </label>
              <input
                id="oferta-email"
                type="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                className={claseInput + (errors.email ? ' border-red-400 ring-0' : '')}
                aria-invalid={errors.email ? 'true' : 'false'}
                {...register('email', {
                  required: 'El correo es obligatorio.',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Formato de correo no valido.',
                  },
                  maxLength: { value: 254, message: 'Maximo 254 caracteres.' },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="oferta-monto" className={claseLabel}>
              Monto a ofertar
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                {monedaOferta}
              </span>
              <input
                id="oferta-monto"
                type="number"
                min="1"
                step="0.01"
                inputMode="decimal"
                placeholder="Ingresa tu propuesta"
                className={
                  'w-full rounded-2xl border border-gray-200 bg-white py-3 pl-16 pr-4 text-sm text-gray-900 ' +
                  'placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-100 transition-colors' +
                  (errors.montoOfertado ? ' border-red-400 ring-0' : '')
                }
                aria-invalid={errors.montoOfertado ? 'true' : 'false'}
                {...register('montoOfertado', {
                  required: 'El monto es obligatorio.',
                  validate: (valor) => {
                    const monto = Number(valor);
                    if (!Number.isFinite(monto) || monto <= 0) {
                      return 'Debes ingresar un monto mayor a 0.';
                    }
                    return true;
                  },
                })}
              />
            </div>
            {errors.montoOfertado && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.montoOfertado.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="oferta-mensaje" className={claseLabel}>
              Mensaje o condiciones
            </label>
            <textarea
              id="oferta-mensaje"
              rows={4}
              placeholder="Indica plazo de pago, fuente de fondos o condiciones relevantes para sustentar tu oferta."
              className={
                claseInput + ' resize-none' + (errors.mensaje ? ' border-red-400 ring-0' : '')
              }
              aria-invalid={errors.mensaje ? 'true' : 'false'}
              {...register('mensaje', {
                required: 'El mensaje es obligatorio.',
                maxLength: { value: 1000, message: 'Maximo 1000 caracteres.' },
              })}
            />
            {errors.mensaje && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.mensaje.message}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <input
                id="oferta-terminos"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                {...register('aceptaTerminos', {
                  required: 'Debes aceptar los terminos del proceso.',
                })}
              />
              <label htmlFor="oferta-terminos" className="text-xs leading-5 text-gray-600">
                Confirmo que esta es una oferta formal y autorizo el uso de mis datos para
                gestionar el proceso comercial, documental y financiero asociado al inmueble.
              </label>
            </div>
            {errors.aceptaTerminos && (
              <p className="mt-2 text-xs text-red-600" role="alert">
                {errors.aceptaTerminos.message}
              </p>
            )}
          </div>

          {resultado?.ok === false && (
            <p
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {resultado.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-2xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-300"
          >
            {isPending ? 'Enviando oferta formal...' : 'Enviar Oferta Formal'}
          </button>
        </form>
      )}

      {whatsappAgente && numeroWhatsApp && (
        <a
          href={`https://wa.me/${numeroWhatsApp}?text=${mensajeWhatsApp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
        >
          <IconoWhatsApp />
          Resolver dudas por WhatsApp
        </a>
      )}
    </div>
  );
}
