'use client';

import Link from 'next/link';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/', label: 'Inicio' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
] as const;

function IconoAdmin({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? 'h-5 w-5'}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l7.5 3v6c0 5.25-3.6 8.82-7.5 9.99C8.1 20.82 4.5 17.25 4.5 12V6L12 3z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 11.25a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0zm2.25 3.75v2.25"
      />
    </svg>
  );
}

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold tracking-tight text-blue-600">
          IsaHouse
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/admin/login"
            className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 md:inline-flex"
            aria-label="Ir a inicio de sesion de administrador"
          >
            <IconoAdmin className="h-4 w-4" />
            <span className="hidden lg:inline">Admin</span>
          </Link>

          <Link
            href="/admin/login"
            className="inline-flex rounded-md p-2 text-gray-600 transition-colors hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 md:hidden"
            aria-label="Ir a inicio de sesion de administrador"
          >
            <IconoAdmin className="h-6 w-6" />
          </Link>

          <button
            type="button"
            className="rounded-md p-2 text-gray-600 transition-colors hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 md:hidden"
            onClick={() => setMenuAbierto((abierto) => !abierto)}
            aria-label={menuAbierto ? 'Cerrar menu' : 'Abrir menu'}
          >
            {menuAbierto ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuAbierto ? (
        <div className="border-t border-gray-100 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-1 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
                onClick={() => setMenuAbierto(false)}
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 rounded-md py-1 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onClick={() => setMenuAbierto(false)}
              aria-label="Ir a inicio de sesion de administrador"
            >
              <IconoAdmin className="h-4 w-4" />
              Admin
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
