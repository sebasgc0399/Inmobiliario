import Image from 'next/image';
import type { PropiedadPublica } from '@/types/propiedad';
import { formatearPrecioCOP } from '@/lib/utils/formato';

export default function CardPropiedadPublica({
  propiedad,
}: {
  propiedad: PropiedadPublica;
}) {
  const ubicacion = [propiedad.municipio, propiedad.departamento]
    .filter(Boolean)
    .join(', ');

  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Imagen */}
      <div className="relative aspect-[4/3] bg-gray-100">
        {propiedad.imagenPrincipal ? (
          <Image
            src={propiedad.imagenPrincipal}
            alt={propiedad.titulo}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-300"
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

      {/* Contenido */}
      <div className="p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
          {propiedad.tipoInmueble}
        </p>

        <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-gray-900">
          {propiedad.titulo}
        </h3>

        {ubicacion && (
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
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
        )}

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-blue-600">
            {formatearPrecioCOP(propiedad.precio)}
          </span>
          {propiedad.precioNegociable && (
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
              Negociable
            </span>
          )}
        </div>

        {/* Detalles secundarios */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
          {propiedad.areaConstruidaM2 != null && (
            <span className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                />
              </svg>
              {propiedad.areaConstruidaM2} m&sup2;
            </span>
          )}

          {/* Habitaciones y banos solo para tradicional */}
          {propiedad.lineaNegocio === 'tradicional' && (
            <>
              {propiedad.habitaciones != null && (
                <span className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
                    />
                  </svg>
                  {propiedad.habitaciones} hab.
                </span>
              )}
              {propiedad.banos != null && (
                <span className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {propiedad.banos} {propiedad.banos === 1 ? 'bano' : 'banos'}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
