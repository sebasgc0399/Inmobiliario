'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-blue-600 font-bold text-xl tracking-tight">
          IsaHouse
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">
            Inicio
          </Link>
          <Link href="/nosotros" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">
            Nosotros
          </Link>
          <Link href="/contacto" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">
            Contacto
          </Link>
        </nav>

        {/* CTA + Login Admin + botón hamburguesa */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="hidden md:inline-flex bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Publicar Inmueble
          </Link>

          {/* Divisor + ícono Login Admin (solo desktop) */}
          <div className="hidden md:flex items-center border-l border-gray-200 pl-3">
            <Link
              href="/admin/login"
              className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-md"
              aria-label="Acceso administrador"
              title="Acceso Admin"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </Link>
          </div>

          {/* Botón hamburguesa (solo mobile) */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          >
            {menuAbierto ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {menuAbierto && (
        <div className="md:hidden border-t border-gray-100 bg-white py-3 px-4 flex flex-col gap-3">
          <Link
            href="/"
            className="text-gray-700 hover:text-blue-600 text-sm font-medium py-1 transition-colors"
            onClick={() => setMenuAbierto(false)}
          >
            Inicio
          </Link>
          <Link
            href="/nosotros"
            className="text-gray-700 hover:text-blue-600 text-sm font-medium py-1 transition-colors"
            onClick={() => setMenuAbierto(false)}
          >
            Nosotros
          </Link>
          <Link
            href="/contacto"
            className="text-gray-700 hover:text-blue-600 text-sm font-medium py-1 transition-colors"
            onClick={() => setMenuAbierto(false)}
          >
            Contacto
          </Link>
          <Link
            href="/admin"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg text-center transition-colors"
            onClick={() => setMenuAbierto(false)}
          >
            Publicar Inmueble
          </Link>

          {/* Separador + Acceso Admin */}
          <div className="border-t border-gray-100 pt-2 mt-1">
            <Link
              href="/admin/login"
              className="flex items-center gap-2 text-gray-500 hover:text-blue-600 text-sm font-medium py-1 transition-colors"
              onClick={() => setMenuAbierto(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
              Acceso Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
