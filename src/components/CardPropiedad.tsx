import Image from 'next/image';
import Link from 'next/link';
import type { Propiedad, ModoNegocio, Moneda } from '@/types';
import { convertirMoneda, formatearPrecio } from '@/lib/currency';

const badgeConfig: Record<ModoNegocio, { etiqueta: string; clases: string }> = {
  venta: {
    etiqueta: 'Venta',
    clases: 'bg-blue-600 text-white',
  },
  alquiler: {
    etiqueta: 'Alquiler',
    clases: 'bg-emerald-600 text-white',
  },
  venta_alquiler: {
    etiqueta: 'Venta / Alquiler',
    clases: 'bg-violet-600 text-white',
  },
};

// ── Íconos (SVG inline — sin dependencias externas) ───────────────────────────

function IconoCama() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 shrink-0"
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
      className="w-4 h-4 shrink-0"
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
      className="w-4 h-4 shrink-0"
      aria-hidden="true"
    >
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
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
      className="w-3.5 h-3.5 mt-0.5 shrink-0"
      aria-hidden="true"
    >
      <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 14 6 14s6-8.75 6-14c0-3.314-2.686-6-6-6z" />
      <circle cx="12" cy="8" r="2.5" />
    </svg>
  );
}

// ── Componente ────────────────────────────────────────────────────────────────

interface Props {
  propiedad: Propiedad;
  monedaUsuario: Moneda;
}

export default function CardPropiedad({ propiedad, monedaUsuario }: Props) {
  const {
    slug,
    titulo,
    modoNegocio,
    precio,
    ubicacion,
    caracteristicas,
    imagenPrincipal,
    imagenes,
  } = propiedad;

  const valorMostrar = convertirMoneda(precio.valor, precio.moneda, monedaUsuario);

  const imagen = imagenPrincipal ?? imagenes[0] ?? '/placeholder-propiedad.jpg';
  const badge = badgeConfig[modoNegocio];
  const ubicacionTexto = [ubicacion.barrio, ubicacion.ciudad]
    .filter(Boolean)
    .join(', ');

  return (
    <Link
      href={`/propiedades/${slug}`}
      className="group block rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      {/* Imagen principal */}
      <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-gray-100">
        <Image
          src={imagen}
          alt={`Fotografía de ${titulo}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badge modo de negocio */}
        <span
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm ${badge.clases}`}
        >
          {badge.etiqueta}
        </span>
      </div>

      {/* Información */}
      <div className="p-4 flex flex-col gap-2">
        {/* Precio */}
        <p className="text-xl font-bold text-gray-900 leading-none">
          {formatearPrecio(valorMostrar, monedaUsuario)}
          {modoNegocio === 'alquiler' && (
            <span className="text-sm font-normal text-gray-500"> /mes</span>
          )}
        </p>

        {/* Título */}
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
          {titulo}
        </h3>

        {/* Ubicación */}
        <p className="flex items-start gap-1 text-xs text-gray-500">
          <IconoUbicacion />
          {ubicacionTexto}
        </p>

        <hr className="border-gray-100" />

        {/* Características principales */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-0.5">
          <span className="flex items-center gap-1.5">
            <IconoCama />
            {caracteristicas.habitaciones} hab.
          </span>
          <span className="flex items-center gap-1.5">
            <IconoBano />
            {caracteristicas.banos} baños
          </span>
          <span className="flex items-center gap-1.5">
            <IconoArea />
            {caracteristicas.metrosCuadrados} m²
          </span>
        </div>
      </div>
    </Link>
  );
}
