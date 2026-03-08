'use client';

import { auth } from '@/lib/firebase/client';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

type EstadoPagina = 'verificando' | 'formulario' | 'exito' | 'error_fatal';

interface FormularioRestablecerContrasena {
  nuevaContrasena: string;
  confirmarContrasena: string;
}

interface ReglaContrasena {
  id: string;
  descripcion: string;
  regex: RegExp;
}

const REGLAS_CONTRASENA: ReglaContrasena[] = [
  { id: 'longitud', descripcion: 'Al menos 10 caracteres', regex: /.{10,}/ },
  { id: 'mayuscula', descripcion: 'Al menos una mayuscula', regex: /[A-Z]/ },
  { id: 'minuscula', descripcion: 'Al menos una minuscula', regex: /[a-z]/ },
  { id: 'numero', descripcion: 'Al menos un numero', regex: /[0-9]/ },
  { id: 'especial', descripcion: 'Al menos un caracter especial', regex: /[^A-Za-z0-9]/ },
];

const MENSAJE_ENLACE_INVALIDO =
  'Esta pagina no es valida. Usa el enlace que recibiste por correo electronico.';

function extraerCodigoError(error: unknown): string | null {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return null;
  }

  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' ? code : null;
}

function obtenerMensajeErrorVerificacion(error: unknown): string {
  const code = extraerCodigoError(error);

  switch (code) {
    case 'auth/expired-action-code':
      return 'El enlace para restablecer la contrasena ha expirado. Solicita uno nuevo desde el inicio de sesion.';
    case 'auth/invalid-action-code':
      return 'El enlace no es valido o ya fue utilizado. Solicita un nuevo enlace de restablecimiento.';
    case 'auth/user-disabled':
      return 'Esta cuenta de usuario ha sido deshabilitada.';
    case 'auth/user-not-found':
      return 'No existe una cuenta asociada a este correo electronico.';
    default:
      return 'El enlace de restablecimiento no es valido. Solicita uno nuevo.';
  }
}

function obtenerMensajeErrorConfirmacion(error: unknown): string {
  const code = extraerCodigoError(error);

  switch (code) {
    case 'auth/expired-action-code':
      return 'El enlace expiro mientras completabas el formulario. Solicita uno nuevo.';
    case 'auth/invalid-action-code':
      return 'El enlace ya fue utilizado. Solicita un nuevo enlace de restablecimiento.';
    case 'auth/user-disabled':
      return 'Esta cuenta ha sido deshabilitada.';
    case 'auth/weak-password':
      return 'La contrasena no cumple los requisitos minimos de seguridad.';
    default:
      return 'No fue posible actualizar la contrasena. Intenta nuevamente.';
  }
}

function FormularioRestablecerContrasena() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');
  const enlaceInvalido = mode !== 'resetPassword' || !oobCode;

  const [estadoPagina, setEstadoPagina] = useState<EstadoPagina>('verificando');
  const [emailVerificado, setEmailVerificado] = useState('');
  const [mensajeErrorFatal, setMensajeErrorFatal] = useState('');
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormularioRestablecerContrasena>({
    defaultValues: {
      nuevaContrasena: '',
      confirmarContrasena: '',
    },
  });

  const valorContrasena = useWatch({
    control,
    name: 'nuevaContrasena',
    defaultValue: '',
  });
  const estadoActual = enlaceInvalido ? 'error_fatal' : estadoPagina;
  const mensajeFatalActual = enlaceInvalido ? MENSAJE_ENLACE_INVALIDO : mensajeErrorFatal;

  useEffect(() => {
    if (enlaceInvalido) {
      return;
    }

    let cancelado = false;

    async function verificarCodigo() {
      const codigo = oobCode as string;

      try {
        const email = await verifyPasswordResetCode(auth, codigo);
        if (!cancelado) {
          setEmailVerificado(email);
          setEstadoPagina('formulario');
        }
      } catch (error) {
        if (!cancelado) {
          setMensajeErrorFatal(obtenerMensajeErrorVerificacion(error));
          setEstadoPagina('error_fatal');
        }
      }
    }

    verificarCodigo();

    return () => {
      cancelado = true;
    };
  }, [enlaceInvalido, oobCode]);

  const onSubmit = handleSubmit(async ({ nuevaContrasena }) => {
    setErrorEnvio(null);

    try {
      await confirmPasswordReset(auth, oobCode as string, nuevaContrasena);
      setEstadoPagina('exito');
    } catch (error) {
      setErrorEnvio(obtenerMensajeErrorConfirmacion(error));
    }
  });

  return (
    <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {estadoActual === 'verificando' ? (
        <div className="space-y-3">
          <div className="h-7 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-gray-100" />
          <div className="mt-4 space-y-2">
            <div className="h-9 w-full animate-pulse rounded-lg bg-gray-100" />
            <div className="h-9 w-full animate-pulse rounded-lg bg-gray-100" />
          </div>
        </div>
      ) : null}

      {estadoActual === 'error_fatal' ? (
        <>
          <h1 className="text-2xl font-semibold text-gray-900">Enlace no valido</h1>
          <p className="mt-2 text-sm text-gray-600">{mensajeFatalActual}</p>
          <div className="mt-6">
            <Link
              href="/admin/login"
              className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Volver al inicio de sesion
            </Link>
          </div>
        </>
      ) : null}

      {estadoActual === 'formulario' ? (
        <>
          <h1 className="text-2xl font-semibold text-gray-900">Nueva contrasena</h1>
          <p className="mt-2 text-sm text-gray-600">
            Establece una nueva contrasena para{' '}
            <strong className="font-medium text-gray-800">{emailVerificado}</strong>.
          </p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
            <div>
              <label
                htmlFor="nuevaContrasena"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Nueva contrasena
              </label>
              <input
                id="nuevaContrasena"
                type="password"
                autoComplete="new-password"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                aria-invalid={errors.nuevaContrasena ? 'true' : 'false'}
                {...register('nuevaContrasena', {
                  required: 'La contrasena es obligatoria.',
                  validate: (valor) => {
                    const fallidas = REGLAS_CONTRASENA.filter((regla) => !regla.regex.test(valor));
                    if (fallidas.length > 0) {
                      return `La contrasena debe cumplir: ${fallidas.map((regla) => regla.descripcion.toLowerCase()).join(', ')}.`;
                    }

                    return true;
                  },
                })}
              />
              {errors.nuevaContrasena ? (
                <p className="mt-1 text-sm text-red-600">{errors.nuevaContrasena.message}</p>
              ) : null}
            </div>

            {valorContrasena.length > 0 ? (
              <ul
                className="space-y-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                aria-label="Requisitos de contrasena"
              >
                {REGLAS_CONTRASENA.map((regla) => {
                  const cumple = regla.regex.test(valorContrasena);

                  return (
                    <li
                      key={regla.id}
                      className={`flex items-center gap-2 text-xs transition-colors ${
                        cumple ? 'text-emerald-600' : 'text-gray-400'
                      }`}
                    >
                      <span aria-hidden="true">{cumple ? 'OK' : 'NO'}</span>
                      {regla.descripcion}
                    </li>
                  );
                })}
              </ul>
            ) : null}

            <div>
              <label
                htmlFor="confirmarContrasena"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Confirmar contrasena
              </label>
              <input
                id="confirmarContrasena"
                type="password"
                autoComplete="new-password"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                aria-invalid={errors.confirmarContrasena ? 'true' : 'false'}
                {...register('confirmarContrasena', {
                  required: 'Confirma tu nueva contrasena.',
                  validate: (valor, { nuevaContrasena }) =>
                    valor === nuevaContrasena || 'Las contrasenas no coinciden.',
                })}
              />
              {errors.confirmarContrasena ? (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmarContrasena.message}
                </p>
              ) : null}
            </div>

            {errorEnvio ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorEnvio}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar nueva contrasena'}
            </button>

            <Link
              href="/admin/login"
              className="block text-center text-sm text-gray-500 transition-colors hover:text-gray-700"
            >
              Cancelar y volver al inicio de sesion
            </Link>
          </form>
        </>
      ) : null}

      {estadoActual === 'exito' ? (
        <>
          <h1 className="text-2xl font-semibold text-gray-900">Contrasena actualizada</h1>
          <p className="mt-2 text-sm text-gray-600">
            Tu contrasena fue cambiada correctamente. Ya puedes iniciar sesion con tus
            nuevas credenciales.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/login"
              className="inline-flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Ir al inicio de sesion
            </Link>
          </div>
        </>
      ) : null}
    </section>
  );
}

export default function RestablecerContrasenaPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="h-7 w-48 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100" />
            <div className="mt-4 space-y-2">
              <div className="h-9 w-full animate-pulse rounded-lg bg-gray-100" />
              <div className="h-9 w-full animate-pulse rounded-lg bg-gray-100" />
            </div>
          </div>
        }
      >
        <FormularioRestablecerContrasena />
      </Suspense>
    </main>
  );
}
