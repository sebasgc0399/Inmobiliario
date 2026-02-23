'use client';

import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function BotonCerrarSesion() {
  const router = useRouter();
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const [errorCierre, setErrorCierre] = useState<string | null>(null);

  async function cerrarSesion() {
    setCerrandoSesion(true);
    setErrorCierre(null);

    try {
      const respuesta = await fetch('/api/auth/logout', { method: 'POST' });
      if (!respuesta.ok) {
        throw new Error('No fue posible cerrar la sesión en el servidor.');
      }

      await signOut(auth);
      router.replace('/admin/login');
      router.refresh();
    } catch {
      setErrorCierre('No fue posible cerrar sesión. Intenta nuevamente.');
      setCerrandoSesion(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={cerrarSesion}
        disabled={cerrandoSesion}
        className="inline-flex rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {cerrandoSesion ? 'Cerrando sesión...' : 'Cerrar sesión'}
      </button>
      {errorCierre ? <p className="text-sm text-red-600">{errorCierre}</p> : null}
    </div>
  );
}
