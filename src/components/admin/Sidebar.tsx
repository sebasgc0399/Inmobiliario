'use client';

import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import SidebarLink from './SidebarLink';

// ─── Iconos ──────────────────────────────────────────────────────────────────

const IconoDashboard = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);

const IconoPropiedades = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
  </svg>
);

const IconoLeads = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const IconoAuditoria = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconoCerrarSesion = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
);

// ─── Navegación ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: IconoDashboard },
  { href: '/admin/propiedades', label: 'Propiedades', icon: IconoPropiedades },
  { href: '/admin/leads', label: 'Leads', icon: IconoLeads },
  { href: '/admin/auditoria', label: 'Auditoría', icon: IconoAuditoria },
] as const;

// ─── Componente ───────────────────────────────────────────────────────────────

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
        throw new Error('Error al cerrar sesión en el servidor.');
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
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out md:static md:inset-auto md:z-auto md:translate-x-0 md:transition-none ${
        abierto ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Encabezado del sidebar */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-5">
        <span className="text-base font-bold text-gray-900">IsaHouse Admin</span>
        {/* Botón X solo en mobile */}
        <button
          type="button"
          onClick={onCerrar}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 md:hidden"
          aria-label="Cerrar menú"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navegación principal */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <SidebarLink href={item.href} label={item.label} icon={item.icon} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Perfil y logout */}
      <div className="shrink-0 border-t border-gray-200 p-4 space-y-3">
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 uppercase">
            {email.charAt(0)}
          </div>
          <p className="truncate text-xs text-gray-500">{email}</p>
        </div>

        {errorCierre ? (
          <p className="text-xs text-red-600 px-1">{errorCierre}</p>
        ) : null}

        <button
          type="button"
          onClick={cerrarSesion}
          disabled={cerrandoSesion}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {IconoCerrarSesion}
          {cerrandoSesion ? 'Cerrando sesión...' : 'Cerrar sesión'}
        </button>
      </div>
    </aside>
  );
}
