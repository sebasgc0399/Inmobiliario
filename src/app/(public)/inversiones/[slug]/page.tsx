import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

import { obtenerPropiedadPorSlug } from '@/lib/propiedades/obtenerPropiedadPorSlug';
import { obtenerPropiedadesPublicas } from '@/lib/propiedades/obtenerPropiedadesPublicas';
import { crearOferta } from '@/actions/leads/crearOferta';
import { convertirMoneda, formatearPrecio } from '@/lib/currency';

import GaleriaPropiedad from '@/components/detalle/GaleriaPropiedad';
import FormularioOferta from '@/components/detalle/FormularioOferta';
import MapaUbicacion from '@/components/detalle/MapaUbicacion';
import CardPropiedad from '@/components/CardPropiedad';

import type { DatosInversion, Moneda, Propiedad, TipoPropiedad } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MONEDAS_VALIDAS: ReadonlyArray<Moneda> = ['COP', 'USD', 'EUR'];

function parseMoneda(valor?: string): Moneda {
  if (valor && MONEDAS_VALIDAS.includes(valor as Moneda)) return valor as Moneda;
  return 'COP';
}

function sanitizarDatosInversion(inversion?: DatosInversion) {
  if (!inversion) return undefined;

  const { entidadBancaria, notasInternas, ...resto } = inversion;
  void entidadBancaria;
  void notasInternas;

  return resto;
}

function construirPropiedadPublica(propiedad: Propiedad) {
  const inversionPublica = sanitizarDatosInversion(propiedad.inversion);
  const { inversion, ...propiedadBase } = propiedad;
  void inversion;

  return {
    ...propiedadBase,
    ...(inversionPublica ? { inversion: inversionPublica } : {}),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const propiedad = await obtenerPropiedadPorSlug(slug);

  if (!propiedad || propiedad.lineaNegocio !== 'inversion') {
    return { title: 'Propiedad no encontrada' };
  }

  const title = propiedad.seo?.metaTitle ?? `Oportunidad de Inversion: ${propiedad.titulo}`;
  const description =
    propiedad.seo?.metaDescription ??
    `Oportunidad de inversion - ${propiedad.tipo} en ${propiedad.ubicacion.municipio}. ${propiedad.descripcion.slice(0, 150)}...`;
  const imagen = propiedad.imagenPrincipal ?? propiedad.imagenes[0];

  return {
    title,
    description,
    keywords: [
      ...(propiedad.seo?.keywords ?? []),
      'inversion inmobiliaria',
      'oportunidad de inversion',
      'inmueble embargado',
    ],
    openGraph: {
      title,
      description,
      images: imagen ? [{ url: imagen, width: 1200, height: 630, alt: title }] : [],
      type: 'website',
    },
  };
}

interface InversionesRelacionadasProps {
  municipioActual: string;
  tipoActual: TipoPropiedad;
  slugExcluir: string;
  moneda: Moneda;
}

async function InversionesRelacionadas({
  municipioActual,
  tipoActual,
  slugExcluir,
  moneda,
}: InversionesRelacionadasProps) {
  let relacionadas = await obtenerPropiedadesPublicas({
    moneda,
    municipio: municipioActual,
    lineaNegocio: 'inversion',
  });
  relacionadas = relacionadas.filter((propiedad) => propiedad.slug !== slugExcluir);

  if (relacionadas.length === 0) {
    const porTipo = await obtenerPropiedadesPublicas({
      moneda,
      tipo: tipoActual,
      lineaNegocio: 'inversion',
    });
    relacionadas = porTipo.filter((propiedad) => propiedad.slug !== slugExcluir);
  }

  if (relacionadas.length === 0) return null;

  return (
    <section className="mt-16" aria-labelledby="relacionadas-titulo">
      <h2 id="relacionadas-titulo" className="mb-6 text-xl font-bold text-gray-900">
        Otras oportunidades de inversion
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {relacionadas.slice(0, 4).map((propiedad) => (
          <CardPropiedad key={propiedad.slug} propiedad={propiedad} monedaUsuario={moneda} />
        ))}
      </div>
    </section>
  );
}

function IconoUbicacion() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
      aria-hidden="true"
    >
      <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 14 6 14s6-8.75 6-14c0-3.314-2.686-6-6-6z" />
      <circle cx="12" cy="8" r="2.5" />
    </svg>
  );
}

function IconoCama() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-amber-600"
      aria-hidden="true"
    >
      <path d="M2 11V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5" />
      <path d="M16 11V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5" />
      <rect x="2" y="11" width="20" height="8" rx="1" />
      <line x1="2" y1="15" x2="22" y2="15" />
    </svg>
  );
}

function IconoBano() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-amber-600"
      aria-hidden="true"
    >
      <path d="M9 6C9 4.343 7.657 3 6 3S3 4.343 3 6v7h18v-2a5 5 0 0 0-5-5H9z" />
      <path d="M3 13v3a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4v-3" />
    </svg>
  );
}

function IconoArea() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-amber-600"
      aria-hidden="true"
    >
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}

function IconoCoche() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-amber-600"
      aria-hidden="true"
    >
      <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      <path d="M5 17H3v-6l2-5h11l2 5h1a1 1 0 0 1 1 1v5h-2m-4 0H9" />
      <path d="M6 6l-1 5h12l-1-5" />
    </svg>
  );
}

function IconoCheck() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 h-3.5 w-3.5 shrink-0"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function IconoDocumento() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 text-amber-600"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function IconoEscudo() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-amber-600"
      aria-hidden="true"
    >
      <path d="M12 3l7 3v6c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V6l7-3z" />
      <path d="M9.5 12.5l1.5 1.5 3.5-4" />
    </svg>
  );
}

function IconoFinanciacion() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-amber-600"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 15h3" />
    </svg>
  );
}

const condicionMap: Record<string, string> = {
  nuevo: 'Nuevo',
  usado: 'Usado',
  sobre_planos: 'Sobre planos',
};

export default async function PaginaDetalleInversion({
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

  if (propiedad.lineaNegocio !== 'inversion') {
    redirect(`/propiedades/${slug}`);
  }

  const propiedadPublica = construirPropiedadPublica(propiedad);

  const valorMostrar = convertirMoneda(
    propiedadPublica.precio.valor,
    propiedadPublica.precio.moneda,
    moneda,
  );
  const precioFormateado = formatearPrecio(valorMostrar, moneda);
  const accionOferta = crearOferta.bind(
    null,
    propiedadPublica.slug,
    propiedadPublica.codigoPropiedad,
    moneda,
  );

  const ubicacionCompleta = [
    propiedadPublica.ubicacion.barrio,
    propiedadPublica.ubicacion.municipio,
    propiedadPublica.ubicacion.departamento,
  ]
    .filter(Boolean)
    .join(', ');

  const { caracteristicas } = propiedadPublica;
  const documentosRequeridos = propiedadPublica.inversion?.documentosRequeridos ?? [];
  const aceptaContraoferta = propiedadPublica.inversion?.aceptaContraoferta ?? false;
  const observacionesBanco = propiedadPublica.inversion?.observacionesBanco?.trim();

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <GaleriaPropiedad imagenes={propiedadPublica.imagenes} titulo={propiedadPublica.titulo} />

      <div className="mt-8 lg:grid lg:grid-cols-3 lg:gap-10">
        <div className="space-y-10 lg:col-span-2">
          <nav
            aria-label="Ruta de navegacion"
            className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400"
          >
            <Link href="/" className="transition-colors hover:text-amber-600">
              Inicio
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/inversiones" className="transition-colors hover:text-amber-600">
              Inversiones
            </Link>
            <span aria-hidden="true">/</span>
            <span className="max-w-xs truncate text-gray-600" aria-current="page">
              {propiedadPublica.titulo}
            </span>
          </nav>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white">
                Oportunidad de Inversion
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                {condicionMap[propiedadPublica.condicion]}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 font-mono text-xs font-semibold text-gray-500">
                REF: {propiedadPublica.codigoPropiedad}
              </span>
              {aceptaContraoferta && (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Acepta contraofertas
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
              {propiedadPublica.titulo}
            </h1>

            <div>
              <p className="text-3xl font-bold text-amber-600">
                {precioFormateado}
                {propiedadPublica.precio.negociable && (
                  <span className="ml-2 text-sm font-medium text-emerald-600">
                    (Negociable)
                  </span>
                )}
              </p>
              {(propiedadPublica.precio.adminMensual || propiedadPublica.precio.impuestoPredial) && (
                <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-500">
                  {propiedadPublica.precio.adminMensual && (
                    <span>
                      Admin: {formatearPrecio(propiedadPublica.precio.adminMensual, 'COP')}/mes
                    </span>
                  )}
                  {propiedadPublica.precio.impuestoPredial && (
                    <span>
                      Predial:{' '}
                      {formatearPrecio(propiedadPublica.precio.impuestoPredial, 'COP')}/ano
                    </span>
                  )}
                </div>
              )}
            </div>

            <p className="flex items-start gap-1.5 text-sm text-gray-600">
              <IconoUbicacion />
              {ubicacionCompleta}
            </p>

            {propiedadPublica.tags && propiedadPublica.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {propiedadPublica.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs text-amber-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {caracteristicas.habitaciones != null && (
              <div className="space-y-1 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-center">
                <IconoCama />
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {caracteristicas.habitaciones}
                </p>
                <p className="text-xs text-gray-500">
                  {caracteristicas.habitaciones === 1 ? 'Habitacion' : 'Habitaciones'}
                </p>
              </div>
            )}
            {caracteristicas.banos != null && (
              <div className="space-y-1 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-center">
                <IconoBano />
                <p className="mt-1 text-2xl font-bold text-gray-900">{caracteristicas.banos}</p>
                <p className="text-xs text-gray-500">
                  {caracteristicas.banos === 1 ? 'Bano' : 'Banos'}
                </p>
              </div>
            )}
            <div className="space-y-1 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-center">
              <IconoArea />
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {caracteristicas.metrosConstruidos ?? caracteristicas.metrosCuadrados}
              </p>
              <p className="text-xs text-gray-500">m2 construidos</p>
            </div>
            {caracteristicas.parqueaderos != null && (
              <div className="space-y-1 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-center">
                <IconoCoche />
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {caracteristicas.parqueaderos}
                </p>
                <p className="text-xs text-gray-500">
                  {caracteristicas.parqueaderos === 1 ? 'Parqueadero' : 'Parqueaderos'}
                </p>
              </div>
            )}
          </div>

          <section aria-labelledby="descripcion-titulo">
            <h2 id="descripcion-titulo" className="mb-3 text-lg font-bold text-gray-900">
              Descripcion
            </h2>
            <p className="whitespace-pre-line leading-relaxed text-gray-700">
              {propiedadPublica.descripcion}
            </p>
          </section>

          {documentosRequeridos.length > 0 && (
            <section
              aria-labelledby="documentos-titulo"
              className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6"
            >
              <h2
                id="documentos-titulo"
                className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900"
              >
                <IconoDocumento />
                Documentos requeridos para ofertar
              </h2>
              <ul className="space-y-2">
                {documentosRequeridos.map((documento) => (
                  <li key={documento} className="flex gap-2 text-sm text-gray-700">
                    <IconoCheck />
                    <span>{documento}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/inversiones/como-funciona"
                className="mt-4 inline-block text-sm font-medium text-amber-700 underline underline-offset-2 transition-colors hover:text-amber-900"
              >
                Conoce el proceso completo
              </Link>
            </section>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <section
              aria-labelledby="condiciones-titulo"
              className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2">
                <IconoEscudo />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                  Notas legales
                </p>
              </div>
              <h2 id="condiciones-titulo" className="text-lg font-bold text-gray-900">
                Condiciones del inmueble
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-700">
                {observacionesBanco ??
                  'La informacion publicada resume el estado comercial y documental disponible para esta oportunidad. La validacion juridica definitiva se completa dentro del proceso formal de oferta.'}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li className="flex gap-2">
                  <IconoCheck />
                  <span>
                    La identidad de la entidad titular se confirma solo dentro del proceso
                    privado de cierre.
                  </span>
                </li>
                <li className="flex gap-2">
                  <IconoCheck />
                  <span>
                    Toda oferta queda sujeta a revision documental y aprobacion del comite
                    correspondiente.
                  </span>
                </li>
              </ul>
            </section>

            <section
              aria-labelledby="financiacion-titulo"
              className="rounded-3xl border border-amber-200 bg-gradient-to-br from-white to-amber-50 p-6 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2">
                <IconoFinanciacion />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                  Financiacion
                </p>
              </div>
              <h2 id="financiacion-titulo" className="text-lg font-bold text-gray-900">
                Opciones de credito disponibles
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-700">
                Podemos orientar tu proceso con credito hipotecario, leasing o revision
                financiera previa. La aprobacion final depende del perfil del comprador y
                de la politica vigente de la entidad aliada.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li className="flex gap-2">
                  <IconoCheck />
                  <span>Documento de identidad y datos de contacto actualizados.</span>
                </li>
                <li className="flex gap-2">
                  <IconoCheck />
                  <span>Soportes de ingresos o declaracion de renta reciente.</span>
                </li>
                <li className="flex gap-2">
                  <IconoCheck />
                  <span>Capacidad de cuota inicial y estudio de credito preliminar.</span>
                </li>
              </ul>
            </section>
          </div>

          <section aria-labelledby="caracteristicas-titulo">
            <h2 id="caracteristicas-titulo" className="mb-3 text-lg font-bold text-gray-900">
              Caracteristicas
            </h2>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-3 rounded-2xl border border-gray-100 bg-gray-50/50 p-5 sm:grid-cols-2">
              <div className="flex justify-between border-b border-gray-100 pb-2 sm:border-0 sm:pb-0">
                <dt className="text-sm text-gray-500">Tipo de inmueble</dt>
                <dd className="text-sm font-medium capitalize text-gray-900">
                  {propiedadPublica.tipo}
                </dd>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2 sm:border-0 sm:pb-0">
                <dt className="text-sm text-gray-500">Area total del lote</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {caracteristicas.metrosCuadrados} m2
                </dd>
              </div>
              {caracteristicas.metrosConstruidos && (
                <div className="flex justify-between border-b border-gray-100 pb-2 sm:border-0 sm:pb-0">
                  <dt className="text-sm text-gray-500">Area construida</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {caracteristicas.metrosConstruidos} m2
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
                  <dd className="text-sm font-medium text-gray-900">{caracteristicas.piso}</dd>
                </div>
              )}
              {caracteristicas.pisos !== undefined && (
                <div className="flex justify-between border-b border-gray-100 pb-2 sm:border-0 sm:pb-0">
                  <dt className="text-sm text-gray-500">Pisos del edificio</dt>
                  <dd className="text-sm font-medium text-gray-900">{caracteristicas.pisos}</dd>
                </div>
              )}
              {caracteristicas.antiguedad !== undefined && (
                <div className="flex justify-between border-b border-gray-100 pb-2 sm:border-0 sm:pb-0">
                  <dt className="text-sm text-gray-500">Antiguedad</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {caracteristicas.antiguedad === 0
                      ? 'Nuevo'
                      : `${caracteristicas.antiguedad} ${caracteristicas.antiguedad === 1 ? 'ano' : 'anos'}`}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Codigo de referencia</dt>
                <dd className="font-mono text-sm font-medium text-gray-900">
                  {propiedadPublica.codigoPropiedad}
                </dd>
              </div>
            </dl>
          </section>

          {caracteristicas.instalaciones.length > 0 && (
            <section aria-labelledby="instalaciones-titulo">
              <h2 id="instalaciones-titulo" className="mb-3 text-lg font-bold text-gray-900">
                Instalaciones
              </h2>
              <div className="flex flex-wrap gap-2">
                {caracteristicas.instalaciones.map((instalacion) => (
                  <span
                    key={instalacion}
                    className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700"
                  >
                    <IconoCheck />
                    {instalacion}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6">
            <h2 className="mb-2 text-lg font-bold text-gray-900">
              Como funciona la compra de inmuebles de oportunidad
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Conoce el proceso paso a paso para adquirir inmuebles bancarios a precios
              por debajo del mercado y presentar una oferta formal con respaldo documental.
            </p>
            <Link
              href="/inversiones/como-funciona"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
            >
              Ver proceso completo
            </Link>
          </section>

          <section aria-labelledby="mapa-titulo">
            <h2 id="mapa-titulo" className="mb-3 text-lg font-bold text-gray-900">
              Ubicacion en el mapa
            </h2>
            <MapaUbicacion ubicacion={propiedadPublica.ubicacion} />
          </section>
        </div>

        <div className="mt-10 lg:mt-0">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
              <div className="mb-4 rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                  Oferta formal
                </p>
                <h2 className="mt-2 text-lg font-bold text-gray-900">
                  Presenta tu propuesta economica
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Este formulario inicia el proceso formal de negociacion para esta
                  oportunidad bancaria.
                </p>
              </div>
              <FormularioOferta
                accion={accionOferta}
                whatsappAgente={propiedadPublica.agente?.whatsapp}
                tituloPropiedad={propiedadPublica.titulo}
                precioBase={precioFormateado}
                monedaOferta={moneda}
                aceptaContraoferta={aceptaContraoferta}
              />
            </div>

            {propiedadPublica.agente && (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Asesor
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {propiedadPublica.agente.nombre}
                </p>
                {propiedadPublica.agente.email && (
                  <p className="mt-0.5 text-xs text-gray-500">
                    {propiedadPublica.agente.email}
                  </p>
                )}
                {propiedadPublica.agente.telefono && (
                  <a
                    href={`tel:${propiedadPublica.agente.telefono}`}
                    className="mt-0.5 block text-xs text-amber-600 transition-colors hover:text-amber-800"
                  >
                    {propiedadPublica.agente.telefono}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <InversionesRelacionadas
          municipioActual={propiedadPublica.ubicacion.municipio}
          tipoActual={propiedadPublica.tipo}
          slugExcluir={propiedadPublica.slug}
          moneda={moneda}
        />
      </Suspense>
    </main>
  );
}
