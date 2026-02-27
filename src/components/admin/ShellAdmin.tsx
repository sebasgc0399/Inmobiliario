'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface ShellAdminProps {
  children: ReactNode;
  email: string;
}

export default function ShellAdmin({ children, email }: ShellAdminProps) {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Overlay semitransparente en mobile cuando el sidebar está abierto */}
      {sidebarAbierto && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarAbierto(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar lateral */}
      <Sidebar
        email={email}
        abierto={sidebarAbierto}
        onCerrar={() => setSidebarAbierto(false)}
      />

      {/* Área principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar visible solo en mobile */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarAbierto(true)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Abrir menú de navegación"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-gray-900">IsaHouse Admin</span>
        </header>

        {/* Contenido scrollable */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
