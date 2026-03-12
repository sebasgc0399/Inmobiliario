import type { Metadata } from 'next';
import FormularioContacto from '@/components/contacto/FormularioContacto';
import { obtenerPropiedadPublicaPorSlug } from '@/lib/propiedades/consultas';
import { formatearPrecioCOP } from '@/lib/utils/formato';
import type { ContextoPropiedadContacto } from '@/types/lead';

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Ponte en contacto con el equipo de IsaHouse. Escribenos por WhatsApp o correo electronico.',
};

const REGEX_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const datosContacto = [
  {
    id: 'direccion',
    etiqueta: 'Direccion',
    valor: 'Calle 10 # 43D-15, El Poblado, Medellin',
    icono: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="mt-0.5 h-5 w-5 shrink-0 text-blue-600"
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
    ),
  },
  {
    id: 'email',
    etiqueta: 'Correo electronico',
    valor: 'contacto@isahouse.co',
    href: 'mailto:contacto@isahouse.co',
    icono: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="mt-0.5 h-5 w-5 shrink-0 text-blue-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
        />
      </svg>
    ),
  },
  {
    id: 'whatsapp',
    etiqueta: 'WhatsApp',
    valor: '+57 (604) 123 4567',
    href: 'https://wa.me/576041234567',
    icono: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="mt-0.5 h-5 w-5 shrink-0 text-green-500"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.532 5.845L0 24l6.336-1.51A11.956 11.956 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.369l-.36-.214-3.727.978.995-3.636-.235-.374A9.818 9.818 0 1112 21.818z" />
      </svg>
    ),
  },
];

function normalizarRef(ref: string | string[] | undefined): string | null {
  if (typeof ref !== 'string') return null;

  const slug = ref.trim().toLowerCase();
  if (!slug) return null;
  if (slug.length > 120) return null;
  if (!REGEX_SLUG.test(slug)) return null;

  return slug;
}

async function obtenerContextoPropiedad(
  ref: string | null
): Promise<ContextoPropiedadContacto | null> {
  if (!ref) return null;

  const propiedad = await obtenerPropiedadPublicaPorSlug(ref);
  if (!propiedad) return null;

  return {
    slug: propiedad.slug,
    titulo: propiedad.titulo,
    tipoInmueble: propiedad.tipoInmueble,
    municipio: propiedad.municipio,
    precio: propiedad.precio,
    lineaNegocio: propiedad.lineaNegocio,
  };
}

export default async function ContactoPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const ref = normalizarRef(params.ref);
  const contextoPropiedad = await obtenerContextoPropiedad(ref);

  return (
    <main>
      {/* Hero de seccion */}
      <section className="border-b border-gray-200 bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-blue-600">
            Estamos aqui para ayudarte
          </p>
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Contacto</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-gray-600">
            Tienes preguntas sobre una propiedad o quieres hablar con un asesor?
            Escribenos y te responderemos a la brevedad.
          </p>
        </div>
      </section>

      {/* Grid de contenido */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Columna izquierda: datos de contacto */}
          <div>
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              Informacion de contacto
            </h2>

            <ul className="space-y-5">
              {datosContacto.map((dato) => (
                <li key={dato.id} className="flex items-start gap-3">
                  {dato.icono}
                  <div>
                    <p className="mb-0.5 text-xs font-medium uppercase tracking-wider text-gray-400">
                      {dato.etiqueta}
                    </p>
                    {dato.href ? (
                      <a
                        href={dato.href}
                        className="text-sm text-gray-800 transition-colors hover:text-blue-600"
                      >
                        {dato.valor}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-800">{dato.valor}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex h-52 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
              <p className="text-sm text-gray-400">Mapa proximamente</p>
            </div>
          </div>

          {/* Columna derecha: formulario */}
          <div>
            {contextoPropiedad ? (
              <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                  Estas consultando esta propiedad
                </p>
                <h3 className="mt-2 text-lg font-semibold text-gray-900">
                  {contextoPropiedad.titulo}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-gray-600">
                    {contextoPropiedad.tipoInmueble}
                  </span>
                  <span>{contextoPropiedad.municipio}</span>
                  <span className="font-semibold text-blue-700">
                    {formatearPrecioCOP(contextoPropiedad.precio)}
                  </span>
                </div>
              </div>
            ) : null}

            <h2 className="text-xl font-bold text-gray-900">Envianos un mensaje</h2>
            <p className="mt-2 text-sm text-gray-600">
              Completa este formulario y nuestro equipo te contactara lo antes
              posible.
            </p>

            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <FormularioContacto
                slugPropiedadInicial={contextoPropiedad?.slug ?? null}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
