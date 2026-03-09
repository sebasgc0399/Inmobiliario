import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { obtenerPropiedadPublicaPorSlug } from '@/lib/propiedades/consultas';
import { formatearPrecioCOP } from '@/lib/utils/formato';

const obtenerPropiedad = cache((slug: string) =>
  obtenerPropiedadPublicaPorSlug(slug)
);

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const propiedad = await obtenerPropiedad(slug);

  if (!propiedad) return { title: 'Propiedad no encontrada' };

  return {
    title: propiedad.titulo,
    description:
      propiedad.descripcion ??
      `${propiedad.tipoInmueble} en ${propiedad.municipio} - ${formatearPrecioCOP(propiedad.precio)}`,
  };
}

export default async function PaginaDetallePropiedad({ params }: Props) {
  const { slug } = await params;
  const propiedad = await obtenerPropiedad(slug);

  if (!propiedad) notFound();

  const imagenPrincipal =
    propiedad.imagenPrincipal ?? propiedad.imagenes[0] ?? null;
  const thumbnails = propiedad.imagenes.filter(
    (img) => img !== imagenPrincipal
  );

  const ubicacion = [propiedad.municipio, propiedad.departamento]
    .filter(Boolean)
    .join(', ');

  const caracteristicas: { etiqueta: string; valor: string }[] = [];
  if (propiedad.areaConstruidaM2 != null)
    caracteristicas.push({
      etiqueta: 'Area construida',
      valor: `${propiedad.areaConstruidaM2} m\u00B2`,
    });
  if (propiedad.areaTerrenoM2 != null)
    caracteristicas.push({
      etiqueta: 'Area terreno',
      valor: `${propiedad.areaTerrenoM2} m\u00B2`,
    });
  if (propiedad.estrato != null)
    caracteristicas.push({
      etiqueta: 'Estrato',
      valor: `${propiedad.estrato}`,
    });
  if (propiedad.lineaNegocio === 'tradicional') {
    if (propiedad.habitaciones != null)
      caracteristicas.push({
        etiqueta: 'Habitaciones',
        valor: `${propiedad.habitaciones}`,
      });
    if (propiedad.banos != null)
      caracteristicas.push({
        etiqueta: 'Banos',
        valor: `${propiedad.banos}`,
      });
    if (propiedad.parqueaderos != null)
      caracteristicas.push({
        etiqueta: 'Parqueaderos',
        valor: `${propiedad.parqueaderos}`,
      });
  }

  return (
    <main>
      {/* Navegacion de retorno */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-blue-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          Volver al catalogo
        </Link>
      </div>

      {/* Contenido principal */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Columna izquierda: galeria */}
          <div>
            {imagenPrincipal ? (
              <>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
                  <Image
                    src={imagenPrincipal}
                    alt={propiedad.titulo}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </div>
                {thumbnails.length > 0 && (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {thumbnails.slice(0, 4).map((img, i) => (
                      <div
                        key={i}
                        className="relative aspect-square overflow-hidden rounded-lg bg-gray-100"
                      >
                        <Image
                          src={img}
                          alt={`${propiedad.titulo} - imagen ${i + 2}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 25vw, 12.5vw"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Columna derecha: informacion */}
          <div>
            {/* Tipo + badge linea de negocio */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                {propiedad.tipoInmueble}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  propiedad.lineaNegocio === 'inversion'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-blue-50 text-blue-700'
                }`}
              >
                {propiedad.lineaNegocio === 'inversion'
                  ? 'Inversion'
                  : 'Tradicional'}
              </span>
            </div>

            {/* Titulo */}
            <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              {propiedad.titulo}
            </h1>

            {/* Ubicacion */}
            {ubicacion && (
              <div className="mt-2">
                <p className="flex items-center gap-1 text-sm text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                  {ubicacion}
                </p>
                {propiedad.barrio && (
                  <p className="ml-5 text-xs text-gray-400">
                    {propiedad.barrio}
                  </p>
                )}
              </div>
            )}

            {/* Precio */}
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-600">
                {formatearPrecioCOP(propiedad.precio)}
              </span>
              {propiedad.precioNegociable && (
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                  Negociable
                </span>
              )}
            </div>

            {/* Caracteristicas fisicas */}
            {caracteristicas.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {caracteristicas.map((c) => (
                  <div
                    key={c.etiqueta}
                    className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                  >
                    <p className="text-lg font-semibold text-gray-900">
                      {c.valor}
                    </p>
                    <p className="text-xs text-gray-500">{c.etiqueta}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Descripcion */}
            {propiedad.descripcion && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Descripcion
                </h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                  {propiedad.descripcion}
                </p>
              </div>
            )}

            {/* Observaciones publicas */}
            {propiedad.observacionesPublicas && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Observaciones
                </h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                  {propiedad.observacionesPublicas}
                </p>
              </div>
            )}

            {/* CTA */}
            <div className="mt-8">
              <Link
                href={`/contacto?ref=${propiedad.slug}`}
                className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto"
              >
                Solicitar informacion
              </Link>
              <p className="mt-2 text-xs text-gray-400">
                Ref: {propiedad.codigoReferencia}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
