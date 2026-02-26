'use client';

import { useState, useRef, useEffect } from 'react';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface OpcionSelect {
  valor: string;
  etiqueta: string;
}

interface Props {
  id?: string;
  valor: string;
  onChange: (valor: string) => void;
  opciones: OpcionSelect[];
  activo?: boolean;
  disabled?: boolean;
}

// ── Íconos ────────────────────────────────────────────────────────────────────

function IconoChevron({ abierto }: { abierto: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 text-gray-400 transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

function IconoCheck() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-blue-500"
      aria-hidden="true"
    >
      <path d="M2.5 7l3.5 3.5 6-6" />
    </svg>
  );
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function SelectPersonalizado({ id, valor, onChange, opciones, activo, disabled }: Props) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cierra al hacer clic fuera
  useEffect(() => {
    function manejarClicFuera(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener('mousedown', manejarClicFuera);
    return () => document.removeEventListener('mousedown', manejarClicFuera);
  }, []);

  // Cierra con Escape
  useEffect(() => {
    function manejarTecla(e: KeyboardEvent) {
      if (e.key === 'Escape') setAbierto(false);
    }
    document.addEventListener('keydown', manejarTecla);
    return () => document.removeEventListener('keydown', manejarTecla);
  }, []);

  const etiquetaActual = opciones.find((o) => o.valor === valor)?.etiqueta ?? opciones[0]?.etiqueta ?? '';
  const bordeClase = activo ? 'border-blue-300 bg-blue-50/40' : 'border-gray-200';
  const menuAbierto = abierto && !disabled;

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setAbierto((v) => !v)}
        className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm text-gray-800 bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${bordeClase}`}
        aria-haspopup="listbox"
        aria-expanded={menuAbierto}
      >
        <span className="truncate">{etiquetaActual}</span>
        <IconoChevron abierto={menuAbierto} />
      </button>

      {/* Dropdown */}
      {menuAbierto && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1.5 w-full min-w-max rounded-xl border border-gray-100 bg-white shadow-lg py-1 overflow-hidden"
        >
          {opciones.map((op) => {
            const seleccionada = op.valor === valor;
            return (
              <li
                key={op.valor}
                role="option"
                aria-selected={seleccionada}
                onClick={() => {
                  onChange(op.valor);
                  setAbierto(false);
                }}
                className={`flex items-center justify-between gap-4 px-3 py-2.5 text-sm cursor-pointer transition-colors
                  ${seleccionada ? 'text-blue-600 font-medium bg-blue-50/50' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                {op.etiqueta}
                {seleccionada && <IconoCheck />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
