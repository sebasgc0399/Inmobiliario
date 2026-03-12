'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { enviarLeadContacto } from '@/app/actions/enviarLeadContacto';
import type { CampoLeadFormulario } from '@/types/lead';

interface FormularioContactoProps {
  slugPropiedadInicial?: string | null;
}

interface ValoresFormularioContacto {
  nombre: string;
  telefono: string;
  email: string;
  mensaje: string;
}

const CAMPOS_FORMULARIO: CampoLeadFormulario[] = [
  'nombre',
  'telefono',
  'email',
  'mensaje',
];

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_TELEFONO = /^[0-9+()\-\s]+$/;

export default function FormularioContacto({
  slugPropiedadInicial = null,
}: FormularioContactoProps) {
  const [mensajeGeneral, setMensajeGeneral] = useState<string | null>(null);
  const [tipoMensaje, setTipoMensaje] = useState<'exito' | 'error' | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ValoresFormularioContacto>({
    defaultValues: {
      nombre: '',
      telefono: '',
      email: '',
      mensaje: '',
    },
  });

  const onSubmit = handleSubmit(async (valores) => {
    setMensajeGeneral(null);
    setTipoMensaje(null);
    clearErrors();

    const resultado = await enviarLeadContacto({
      nombre: valores.nombre,
      telefono: valores.telefono,
      email: valores.email,
      mensaje: valores.mensaje,
      slugPropiedad: slugPropiedadInicial,
    });

    if (!resultado.ok) {
      for (const campo of CAMPOS_FORMULARIO) {
        const mensajeCampo = resultado.errores?.[campo];
        if (mensajeCampo) {
          setError(campo, {
            type: 'server',
            message: mensajeCampo,
          });
        }
      }

      setTipoMensaje('error');
      setMensajeGeneral(resultado.mensaje);
      return;
    }

    reset();
    setTipoMensaje('exito');
    setMensajeGeneral(resultado.mensaje);
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <div>
        <label htmlFor="nombre" className="mb-1 block text-sm font-medium text-gray-700">
          Nombre
        </label>
        <input
          id="nombre"
          type="text"
          autoComplete="name"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          aria-invalid={errors.nombre ? 'true' : 'false'}
          {...register('nombre', {
            required: 'El nombre es obligatorio.',
            minLength: {
              value: 2,
              message: 'El nombre debe tener al menos 2 caracteres.',
            },
            maxLength: {
              value: 120,
              message: 'El nombre no puede superar 120 caracteres.',
            },
          })}
        />
        {errors.nombre ? (
          <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="telefono" className="mb-1 block text-sm font-medium text-gray-700">
          Telefono
        </label>
        <input
          id="telefono"
          type="tel"
          autoComplete="tel"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          aria-invalid={errors.telefono ? 'true' : 'false'}
          {...register('telefono', {
            required: 'El telefono es obligatorio.',
            minLength: {
              value: 7,
              message: 'El telefono debe tener al menos 7 caracteres.',
            },
            maxLength: {
              value: 30,
              message: 'El telefono no puede superar 30 caracteres.',
            },
            pattern: {
              value: REGEX_TELEFONO,
              message: 'Ingresa un telefono valido.',
            },
          })}
        />
        {errors.telefono ? (
          <p className="mt-1 text-sm text-red-600">{errors.telefono.message}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
          Correo electronico (opcional)
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          aria-invalid={errors.email ? 'true' : 'false'}
          {...register('email', {
            validate: (valor) => {
              const limpio = valor.trim();
              if (!limpio) return true;
              if (limpio.length > 160) return 'El correo no puede superar 160 caracteres.';
              if (!REGEX_EMAIL.test(limpio)) return 'Ingresa un correo valido.';
              return true;
            },
          })}
        />
        {errors.email ? (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="mensaje" className="mb-1 block text-sm font-medium text-gray-700">
          Mensaje
        </label>
        <textarea
          id="mensaje"
          rows={5}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          aria-invalid={errors.mensaje ? 'true' : 'false'}
          {...register('mensaje', {
            required: 'El mensaje es obligatorio.',
            minLength: {
              value: 10,
              message: 'El mensaje debe tener al menos 10 caracteres.',
            },
            maxLength: {
              value: 1000,
              message: 'El mensaje no puede superar 1000 caracteres.',
            },
          })}
        />
        {errors.mensaje ? (
          <p className="mt-1 text-sm text-red-600">{errors.mensaje.message}</p>
        ) : null}
      </div>

      {mensajeGeneral ? (
        <p
          className={`rounded-lg border px-3 py-2 text-sm ${
            tipoMensaje === 'exito'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
          aria-live="polite"
        >
          {mensajeGeneral}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
      </button>
    </form>
  );
}
