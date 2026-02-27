'use client';

import { auth } from '@/lib/firebase/client';
import { sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';

interface FormularioLoginAdmin {
  email: string;
  password: string;
}

const MENSAJE_ERROR_GENERICO =
  'No fue posible iniciar sesión. Verifica tus credenciales e inténtalo de nuevo.';
const MENSAJE_RESET_GENERICO =
  'Si el correo está registrado, te llegará un enlace para restablecer la contraseña.';

function extraerCodigoError(error: unknown): string | null {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return null;
  }

  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' ? code : null;
}

function resolverDestinoSeguro(nextParam: string | null): string {
  if (!nextParam || !nextParam.startsWith('/admin')) {
    return '/admin';
  }

  return nextParam;
}

function obtenerMensajeErrorLogin(error: unknown): string {
  const code = extraerCodigoError(error);

  switch (code) {
    case 'auth/invalid-email':
      return 'El correo electrónico no es válido.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Credenciales incorrectas. Revisa correo y contraseña.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Espera unos minutos y vuelve a intentar.';
    default:
      return MENSAJE_ERROR_GENERICO;
  }
}

function FormularioLoginAdmin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [mensajeReset, setMensajeReset] = useState<string | null>(null);
  const [cargandoReset, setCargandoReset] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormularioLoginAdmin>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleRestablecerContrasena = async () => {
    setMensajeReset(null);

    const esEmailValido = await trigger('email');
    if (!esEmailValido) {
      return;
    }

    const email = getValues('email').trim();
    const next = searchParams.get('next');
    const url = new URL('/admin/login', window.location.origin);

    if (next?.startsWith('/admin')) {
      url.searchParams.set('next', next);
    }

    setCargandoReset(true);
    try {
      auth.languageCode = 'es';
      await sendPasswordResetEmail(auth, email, {
        url: url.toString(),
        handleCodeInApp: false,
      });
      setMensajeReset(MENSAJE_RESET_GENERICO);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(error);
      }
      setMensajeReset(MENSAJE_RESET_GENERICO);
    } finally {
      setCargandoReset(false);
    }
  };

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setErrorGeneral(null);

    try {
      const credencial = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credencial.user.getIdToken(true);

      const respuesta = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (respuesta.status === 403) {
        await signOut(auth);
        setErrorGeneral('Tu usuario no tiene permisos de administrador.');
        return;
      }

      if (!respuesta.ok) {
        await signOut(auth);

        if (respuesta.status === 401) {
          setErrorGeneral('No fue posible validar la sesión. Inicia sesión nuevamente.');
          return;
        }

        setErrorGeneral('No se pudo crear la sesión de administrador. Intenta de nuevo.');
        return;
      }

      const destino = resolverDestinoSeguro(searchParams.get('next'));
      router.replace(destino);
      router.refresh();
    } catch (error) {
      setErrorGeneral(obtenerMensajeErrorLogin(error));
    }
  });

  return (
    <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Acceso Administrador</h1>
        <p className="mt-2 text-sm text-gray-600">
          Inicia sesión para acceder al panel de administración inmobiliaria.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              aria-invalid={errors.email ? 'true' : 'false'}
              {...register('email', {
                required: 'El correo es obligatorio.',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Ingresa un correo válido.',
                },
              })}
            />
            {errors.email ? (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              aria-invalid={errors.password ? 'true' : 'false'}
              {...register('password', {
                required: 'La contraseña es obligatoria.',
                minLength: {
                  value: 6,
                  message: 'La contraseña debe tener al menos 6 caracteres.',
                },
              })}
            />
            {errors.password ? (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            ) : null}
          </div>

          {errorGeneral ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorGeneral}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? 'Ingresando...' : 'Ingresar al panel'}
          </button>

          <button
            type="button"
            onClick={handleRestablecerContrasena}
            disabled={isSubmitting || cargandoReset}
            className="w-full text-right text-sm font-medium text-blue-700 transition-colors hover:text-blue-800 disabled:cursor-not-allowed disabled:text-blue-300"
          >
            {cargandoReset ? 'Enviando...' : '¿Olvidaste tu contraseña?'}
          </button>

          {mensajeReset ? (
            <p
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
              aria-live="polite"
            >
              {mensajeReset}
            </p>
          ) : null}
        </form>
    </section>
  );
}

export default function LoginAdminPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100" />
            <div className="mt-6 space-y-4">
              <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-10 animate-pulse rounded-lg bg-blue-100" />
            </div>
          </div>
        }
      >
        <FormularioLoginAdmin />
      </Suspense>
    </main>
  );
}
