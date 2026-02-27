import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

import { obtenerPropiedadesAdmin } from '@/lib/propiedades/obtenerPropiedadesAdmin';
import { formatearPrecio } from '@/lib/currency';
import type { EstadoPublicacion } from '@/types';

export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Propiedades | IsaHouse Admin',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const ESTADO_BADGE: Record<EstadoPublicacion, { etiqueta: string; clases: string }> = {
  borrador:  { etiqueta: 'Borrador',  clases: 'bg-gray-100 text-gray-600' },
  activo:    { etiqueta: 'Activo',    clases: 'bg-green-100 text-green-700' },
  inactivo:  { etiqueta: 'Inactivo',  clases: 'bg-yellow-100 text-yellow-700' },
  vendido:   { etiqueta: 'Vendido',   clases: 'bg-blue-100 text-blue-700' },
  arrendado: { etiqueta: 'Arrendado', clases: 'bg-purple-100 text-purple-700' },
};

function formatearFechaCorta(fecha: Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(fecha);
}

function truncarTitulo(titulo: string, max = 40): string {
  return titulo.length > max ? `${titulo.slice(0, max)}…` : titulo;
}

// ── Íconos ────────────────────────────────────────────────────────────────────

function IconoMas() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconoEdificio() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
  );
}

function IconoImagen() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}

function IconoOjo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconoLapiz() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
    </svg>
  );
}

function IconoPapelera() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PropiedadesAdminPage() {
  const propiedades = await obtenerPropiedadesAdmin();

  return (
    <div className="p-6 sm:p-10">
      {/* Header */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Propiedades</h1>
            <p className="mt-1 text-sm text-gray-500">
              {propiedades.length === 0
                ? 'No hay propiedades en el catálogo.'
                : `${propiedades.length} propiedad${propiedades.length === 1 ? '' : 'es'} en total`}
            </p>
          </div>
          <Link
            href="/admin/propiedades/nueva"
            className="inline-flex items-center gap-2 self-start rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:self-auto"
          >
            <IconoMas />
            Nueva propiedad
          </Link>
        </div>
      </section>

      {/* Estado vacío */}
      {propiedades.length === 0 ? (
        <section className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <IconoEdificio />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Sin propiedades aún</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
            El catálogo está vacío. Comienza agregando tu primera propiedad para que aparezca en
            la plataforma.
          </p>
          <Link
            href="/admin/propiedades/nueva"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <IconoMas />
            Agregar primera propiedad
          </Link>
        </section>
      ) : (
        /* Tabla */
        <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Imagen
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Código
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Título
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Tipo
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Precio
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Estado
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actualizado
                  </th>
                  <th scope="col" className="py-3.5 pl-3 pr-6 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {propiedades.map((propiedad) => {
                  const badge = ESTADO_BADGE[propiedad.estadoPublicacion];
                  const imagenSrc = propiedad.imagenPrincipal ?? propiedad.imagenes[0];

                  return (
                    <tr
                      key={propiedad.id ?? propiedad.slug}
                      className="transition-colors hover:bg-gray-50"
                    >
                      {/* Imagen */}
                      <td className="py-4 pl-6 pr-3">
                        <div className="h-[60px] w-[60px] shrink-0 overflow-hidden rounded-md bg-gray-100">
                          {imagenSrc ? (
                            <Image
                              src={imagenSrc}
                              alt={`Imagen de ${propiedad.titulo}`}
                              width={60}
                              height={60}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <IconoImagen />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Código */}
                      <td className="px-3 py-4">
                        <span className="font-mono text-xs font-medium text-gray-700">
                          {propiedad.codigoPropiedad}
                        </span>
                      </td>

                      {/* Título */}
                      <td className="max-w-[200px] px-3 py-4">
                        <span className="text-sm text-gray-900" title={propiedad.titulo}>
                          {truncarTitulo(propiedad.titulo)}
                        </span>
                      </td>

                      {/* Tipo */}
                      <td className="px-3 py-4">
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium capitalize text-gray-700">
                          {propiedad.tipo}
                        </span>
                      </td>

                      {/* Precio */}
                      <td className="px-3 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {formatearPrecio(propiedad.precio.valor, propiedad.precio.moneda)}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.clases}`}
                        >
                          {badge.etiqueta}
                        </span>
                      </td>

                      {/* Actualizado */}
                      <td className="px-3 py-4">
                        <span className="text-sm text-gray-500">
                          {formatearFechaCorta(propiedad.actualizadoEn)}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-4 pl-3 pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/propiedades/${propiedad.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                            title="Ver en sitio público"
                          >
                            <IconoOjo />
                            Ver
                          </Link>

                          <Link
                            href={`/admin/propiedades/${propiedad.id ?? propiedad.slug}/editar`}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                            title="Editar propiedad"
                          >
                            <IconoLapiz />
                            Editar
                          </Link>

                          <button
                            type="button"
                            disabled
                            aria-label="Eliminar propiedad (disponible en Fase 5)"
                            title="Disponible en Fase 5"
                            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 opacity-50"
                          >
                            <IconoPapelera />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
