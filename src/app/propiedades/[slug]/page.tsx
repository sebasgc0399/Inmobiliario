import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

import { obtenerPropiedadPorSlug } from '@/lib/propiedades/obtenerPropiedadPorSlug';
import { obtenerPropiedadesPublicas } from '@/lib/propiedades/obtenerPropiedadesPublicas';
import { guardarLead } from '@/lib/leads/guardarLead';
import { convertirMoneda, formatearPrecio } from '@/lib/currency';

import GaleriaPropiedad from '@/components/detalle/GaleriaPropiedad';
import FormularioContacto from '@/components/detalle/FormularioContacto';
import MapaUbicacion from '@/components/detalle/MapaUbicacion';
import CardPropiedad from '@/components/CardPropiedad';

import type { Moneda, TipoPropiedad } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ── Moneda ────────────────────────────────────────────────────────────────────

const MONEDAS_VALIDAS: ReadonlyArray<Moneda> = ['COP', 'USD', 'EUR'];

function parseMoneda(valor?: string): Moneda {
  if (valor && MONEDAS_VALIDAS.includes(valor as Moneda)) return valor as Moneda;
  return 'COP';
}

// ── SEO ───────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const propiedad = await obtenerPropiedadPorSlug(slug);

  if (!propiedad) {
    return { title: 'Propiedad no encontrada' };
  }

  const title = propiedad.seo?.metaTitle ?? propiedad.titulo;
  const description =
    propiedad.seo?.metaDescription ??
    `${propiedad.tipo.charAt(0).toUpperCase() + propiedad.tipo.slice(1)} en ${
      propiedad.modoNegocio === 'venta' ? 'venta' : 'alquiler'
    } en ${propiedad.ubicacion.ciudad}. ${propiedad.descripcion.slice(0, 150)}...`;
  const imagen = propiedad.imagenPrincipal ?? propiedad.imagenes[0];

  return {
    title,
    description,
    keywords: propiedad.seo?.keywords,
    openGraph: {
      title,
      description,
      images: imagen ? [{ url: imagen, width: 1200, height: 630, alt: title }] : [],
      type: 'website',
    },
  };
}

// ── Propiedades relacionadas (async Server Component interno) ─────────────────

interface PropiedadesRelacionadasProps {
  ciudadActual: string;
  tipoActual: TipoPropiedad;
  slugExcluir: string;
  moneda: Moneda;
}

async function PropiedadesRelacionadas({
  ciudadActual,
  tipoActual,
  slugExcluir,
  moneda,
}: PropiedadesRelacionadasProps) {
  // Intentar por ciudad primero
  let relacionadas = await obtenerPropiedadesPublicas({ moneda, ciudad: ciudadActual });
  relacionadas = relacionadas.filter((p) => p.slug !== slugExcluir);

  // Si no hay resultados, intentar por tipo de propiedad
  if (relacionadas.length === 0) {
    const porTipo = await obtenerPropiedadesPublicas({ moneda, tipo: tipoActual });
    relacionadas = porTipo.filter((p) => p.slug !== slugExcluir);
  }

  // Ocultar sección limpiamente si no hay nada
  if (relacionadas.length === 0) return null;

  const primeras = relacionadas.slice(0, 4);

  return (
    <section className="mt-16" aria-labelledby="relacionadas-titulo">
      <h2 id="relacionadas-titulo" className="text-xl font-bold text-gray-900 mb-6">
        Propiedades similares en {ciudadActual}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {primeras.map((p) => (
          <CardPropiedad key={p.slug} propiedad={p} monedaUsuario={moneda} />
        ))}
      </div>
    </section>
  );
}

// ── Íconos ────────────────────────────────────────────────────────────────────

function IconoUbicacion() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 text-gray-400 mt-0.5" aria-hidden="true">
      <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 14 6 14s6-8.75 6-14c0-3.314-2.686-6-6-6z" />
      <circle cx="12" cy="8" r="2.5" />
    </svg>
  );
}

function IconoCama() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-blue-600" aria-hidden="true">
      <path d="M2 11V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5" />
      <path d="M16 11V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5" />
      <rect x="2" y="11" width="20" height="8" rx="1" />
      <line x1="2" y1="15" x2="22" y2="15" />
    </svg>
  );
}

function IconoBano() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-blue-600" aria-hidden="true">
      <path d="M9 6C9 4.343 7.657 3 6 3S3 4.343 3 6v7h18v-2a5 5 0 0 0-5-5H9z" />
      <path d="M3 13v3a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4v-3" />
    </svg>
  );
}

function IconoArea() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-blue-600" aria-hidden="true">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}

function IconoCoche() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-blue-600" aria-hidden="true">
      <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      <path d="M5 17H3v-6l2-5h11l2 5h1a1 1 0 0 1 1 1v5h-2m-4 0H9" />
      <path d="M6 6l-1 5h12l-1-5" />
    </svg>
  );
}

function IconoCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

// ── Mapas de etiquetas ────────────────────────────────────────────────────────

const condicionMap: Record<string, string> = {
  nuevo: 'Nuevo',
  usado: 'Usado',
  sobre_planos: 'Sobre planos',
};

const modoNegocioMap: Record<string, string> = {
  venta: 'Venta',
  alquiler: 'Alquiler',
  venta_alquiler: 'Venta / Alquiler',
};

const badgeNegocioClases: Record<string, string> = {
  venta: 'bg-blue-600 text-white',
  alquiler: 'bg-emerald-600 text-white',
  venta_alquiler: 'bg-violet-600 text-white',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PaginaDetallePropiedad({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ moneda?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const moneda = parseMoneda(sp.moneda);

  const propiedad = await obtenerPropiedadPorSlug(slug);
  if (!propiedad) notFound();

  const valorMostrar = convertirMoneda(propiedad.precio.valor, propiedad.precio.moneda, moneda);
  const precioFormateado = formatearPrecio(valorMostrar, moneda);

  // Server Action pre-vinculado para que el cliente no controle slug/codigo
  const accionContacto = guardarLead.bind(null, propiedad.slug, propiedad.codigoPropiedad);

  const ubicacionCompleta = [
    propiedad.ubicacion.barrio,
    propiedad.ubicacion.ciudad,
    propiedad.ubicacion.departamento,
  ]
    .filter(Boolean)
    .join(', ');

  const { caracteristicas } = propiedad;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">

      {/* Galería */}
      <GaleriaPropiedad imagenes={propiedad.imagenes} titulo={propiedad.titulo} />

      {/* Layout 2/3 + 1/3 */}
      <div className="mt-8 lg:grid lg:grid-cols-3 lg:gap-10">

        {/* ── Columna izquierda ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-10">

          {/* Breadcrumb */}
          <nav aria-label="Ruta de navegación" className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Inicio
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Propiedades
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-gray-600 truncate max-w-xs" aria-current="page">
              {propiedad.titulo}
            </span>
          </nav>

          {/* Header de la propiedad */}
          <div className="space-y-3">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  badgeNegocioClases[propiedad.modoNegocio]
                }`}
              >
                {modoNegocioMap[propiedad.modoNegocio]}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                {condicionMap[propiedad.condicion]}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 font-mono">
                REF: {propiedad.codigoPropiedad}
              </span>
              {propiedad.destacado && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                  Destacado
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {propiedad.titulo}
            </h1>

            {/* Precio */}
            <div>
              <p className="text-3xl font-bold text-blue-600">
                {precioFormateado}
                {propiedad.modoNegocio === 'alquiler' && (
                  <span className="text-base font-normal text-gray-500"> /mes</span>
                )}
                {propiedad.precio.negociable && (
                  <span className="ml-2 text-sm font-medium text-emerald-600">
                    (Negociable)
                  </span>
                )}
              </p>
              {(propiedad.precio.adminMensual || propiedad.precio.impuestoPredial) && (
                <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500">
                  {propiedad.precio.adminMensual && (
                    <span>
                      Admin:{' '}
                      {formatearPrecio(propiedad.precio.adminMensual, 'COP')}/mes
                    </span>
                  )}
                  {propiedad.precio.impuestoPredial && (
                    <span>
                      Predial:{' '}
                      {formatearPrecio(propiedad.precio.impuestoPredial, 'COP')}/año
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Ubicación */}
            <p className="flex items-start gap-1.5 text-gray-600 text-sm">
              <IconoUbicacion />
              {ubicacionCompleta}
            </p>

            {/* Tags */}
            {propiedad.tags && propiedad.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {propiedad.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 border border-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stats principales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 text-center space-y-1">
              <IconoCama />
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {caracteristicas.habitaciones}
              </p>
              <p className="text-xs text-gray-500">
                {caracteristicas.habitaciones === 1 ? 'Habitación' : 'Habitaciones'}
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 text-center space-y-1">
              <IconoBano />
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {caracteristicas.banos}
              </p>
              <p className="text-xs text-gray-500">
                {caracteristicas.banos === 1 ? 'Baño' : 'Baños'}
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 text-center space-y-1">
              <IconoArea />
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {caracteristicas.metrosConstruidos ?? caracteristicas.metrosCuadrados}
              </p>
              <p className="text-xs text-gray-500">m² construidos</p>
            </div>
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 text-center space-y-1">
              <IconoCoche />
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {caracteristicas.parqueaderos}
              </p>
              <p className="text-xs text-gray-500">
                {caracteristicas.parqueaderos === 1 ? 'Parqueadero' : 'Parqueaderos'}
              </p>
            </div>
          </div>

          {/* Descripción */}
          <section aria-labelledby="descripcion-titulo">
            <h2
              id="descripcion-titulo"
              className="text-lg font-bold text-gray-900 mb-3"
            >
              Descripción
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {propiedad.descripcion}
            </p>
          </section>

          {/* Características detalladas */}
          <section aria-labelledby="caracteristicas-titulo">
            <h2
              id="caracteristicas-titulo"
              className="text-lg font-bold text-gray-900 mb-3"
            >
              Características
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
              <div className="flex justify-between border-b border-gray-100 pb-2 sm:border-0 sm:pb-0">
                <dt className="text-sm text-gray-500">Tipo de inmueble</dt>
                <dd className="text-sm font-medium text-gray-900 capitalize">
                  {propiedad.tipo}
                </dd>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2 sm:border-0 sm:pb-0">
                <dt className="text-sm text-gray-500">Área total del lote</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {caracteristicas.metrosCuadrados} m²
                </dd>
              </div>
              {caracteristicas.metrosConstruidos && (
                <div className="flex justify-between border-b border-gray-100 pb-2 sm:border-0 sm:pb-0">
                  <dt className="text-sm text-gray-500">Área construida</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {caracteristicas.metrosConstruidos} m²
                  </dd>
                </div>
              )}
              {caracteristicas.estrato && (
                <div className="flex justify-between border-b border-gray-100 pb-2 sm:border-0 sm:pb-0">
                  <dt className="text-sm text-gray-500">Estrato</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    Estrato {caracteristicas.estrato}
                  </dd>
                </div>
              )}
              {caracteristicas.piso !== undefined && (
                <div className="flex justify-between border-b border-gray-100 pb-2 sm:border-0 sm:pb-0">
                  <dt className="text-sm text-gray-500">Piso</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {caracteristicas.piso}
                  </dd>
                </div>
              )}
              {caracteristicas.pisos !== undefined && (
                <div className="flex justify-between border-b border-gray-100 pb-2 sm:border-0 sm:pb-0">
                  <dt className="text-sm text-gray-500">Pisos del edificio</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {caracteristicas.pisos}
                  </dd>
                </div>
              )}
              {caracteristicas.antiguedad !== undefined && (
                <div className="flex justify-between border-b border-gray-100 pb-2 sm:border-0 sm:pb-0">
                  <dt className="text-sm text-gray-500">Antigüedad</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {caracteristicas.antiguedad === 0
                      ? 'Nuevo'
                      : `${caracteristicas.antiguedad} ${
                          caracteristicas.antiguedad === 1 ? 'año' : 'años'
                        }`}
                  </dd>
                </div>
              )}
              {caracteristicas.permiteRentaCorta !== undefined && (
                <div className="flex justify-between border-b border-gray-100 pb-2 sm:border-0 sm:pb-0">
                  <dt className="text-sm text-gray-500">Renta corta (Airbnb)</dt>
                  <dd
                    className={`text-sm font-medium ${
                      caracteristicas.permiteRentaCorta
                        ? 'text-emerald-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {caracteristicas.permiteRentaCorta ? 'Permitida' : 'No permitida'}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Código de referencia</dt>
                <dd className="text-sm font-mono font-medium text-gray-900">
                  {propiedad.codigoPropiedad}
                </dd>
              </div>
            </dl>
          </section>

          {/* Amenidades */}
          {caracteristicas.amenidades.length > 0 && (
            <section aria-labelledby="amenidades-titulo">
              <h2
                id="amenidades-titulo"
                className="text-lg font-bold text-gray-900 mb-3"
              >
                Amenidades
              </h2>
              <div className="flex flex-wrap gap-2">
                {caracteristicas.amenidades.map((amenidad) => (
                  <span
                    key={amenidad}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium"
                  >
                    <IconoCheck />
                    {amenidad}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Mapa */}
          <section aria-labelledby="mapa-titulo">
            <h2 id="mapa-titulo" className="text-lg font-bold text-gray-900 mb-3">
              Ubicación en el mapa
            </h2>
            <MapaUbicacion ubicacion={propiedad.ubicacion} />
          </section>
        </div>

        {/* ── Sidebar derecho (sticky) ─────────────────────────────────── */}
        <div className="mt-10 lg:mt-0">
          <div className="sticky top-24 space-y-4">
            {/* Tarjeta de contacto */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">
                ¿Te interesa esta propiedad?
              </h2>
              <FormularioContacto
                accion={accionContacto}
                whatsappAgente={propiedad.agente?.whatsapp}
                tituloPropiedad={propiedad.titulo}
              />
            </div>

            {/* Info del agente */}
            {propiedad.agente && (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Asesor
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {propiedad.agente.nombre}
                </p>
                {propiedad.agente.email && (
                  <p className="text-xs text-gray-500 mt-0.5">{propiedad.agente.email}</p>
                )}
                {propiedad.agente.telefono && (
                  <a
                    href={`tel:${propiedad.agente.telefono}`}
                    className="text-xs text-blue-600 hover:text-blue-800 transition-colors mt-0.5 block"
                  >
                    {propiedad.agente.telefono}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Propiedades relacionadas */}
      <Suspense fallback={null}>
        <PropiedadesRelacionadas
          ciudadActual={propiedad.ubicacion.ciudad}
          tipoActual={propiedad.tipo}
          slugExcluir={propiedad.slug}
          moneda={moneda}
        />
      </Suspense>
    </main>
  );
}
