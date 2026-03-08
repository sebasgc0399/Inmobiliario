'use client';

import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import SidebarLink from './SidebarLink';

const IconoDashboard = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
    />
  </svg>
);

const IconoCerrarSesion = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
    />
  </svg>
);

const NAV_ITEMS = [{ href: '/admin', label: 'Dashboard', icon: IconoDashboard }] as const;

interface SidebarProps {
  email: string;
  abierto: boolean;
  onCerrar: () => void;
}

export default function Sidebar({ email, abierto, onCerrar }: SidebarProps) {
  const router = useRouter();
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const [errorCierre, setErrorCierre] = useState<string | null>(null);

  async function cerrarSesion() {
    setCerrandoSesion(true);
    setErrorCierre(null);

    try {
      const respuesta = await fetch('/api/auth/logout', { method: 'POST' });
      if (!respuesta.ok) {
        throw new Error('Error al cerrar sesion en el servidor.');
      }

      await signOut(auth);
      router.replace('/admin/login');
      router.refresh();
    } catch {
      setErrorCierre('No fue posible cerrar sesion. Intenta nuevamente.');
      setCerrandoSesion(false);
    }
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 ease-in-out md:static md:inset-auto md:z-auto md:translate-x-0 md:transition-none ${
        abierto ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-5">
        <span className="text-base font-bold text-gray-900">IsaHouse Admin</span>
        <button
          type="button"
          onClick={onCerrar}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 md:hidden"
          aria-label="Cerrar menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <SidebarLink href={item.href} label={item.label} icon={item.icon} />
            </li>
          ))}
        </ul>
      </nav>

      <div className="shrink-0 space-y-3 border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold uppercase text-blue-700">
            {email.charAt(0)}
          </div>
          <p className="truncate text-xs text-gray-500">{email}</p>
        </div>

        {errorCierre ? <p className="px-1 text-xs text-red-600">{errorCierre}</p> : null}

        <button
          type="button"
          onClick={cerrarSesion}
          disabled={cerrandoSesion}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {IconoCerrarSesion}
          {cerrandoSesion ? 'Cerrando sesion...' : 'Cerrar sesion'}
        </button>
      </div>
    </aside>
  );
}
