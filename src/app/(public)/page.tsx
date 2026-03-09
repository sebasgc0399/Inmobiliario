import type { Metadata } from 'next';
import type { LineaNegocio } from '@/types/propiedad';
import { obtenerPropiedadesPublicasPorLineaNegocio } from '@/lib/propiedades/consultas';
import TabsLineaNegocio from '@/components/propiedades/TabsLineaNegocio';
import CardPropiedadPublica from '@/components/propiedades/CardPropiedadPublica';
import EstadoVacioPropiedades from '@/components/propiedades/EstadoVacioPropiedades';

export const metadata: Metadata = {
  title: 'Propiedades',
  description:
    'Encuentra propiedades en venta en Colombia. Explora nuestro catalogo de inmuebles tradicionales y oportunidades de inversion.',
};

const LINEAS_VALIDAS: LineaNegocio[] = ['tradicional', 'inversion'];

function esLineaNegocioValida(valor: unknown): valor is LineaNegocio {
  return typeof valor === 'string' && LINEAS_VALIDAS.includes(valor as LineaNegocio);
}

export default async function PaginaInicio({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const lineaNegocio: LineaNegocio = esLineaNegocioValida(params.lineaNegocio)
    ? params.lineaNegocio
    : 'tradicional';

  const propiedades = await obtenerPropiedadesPublicasPorLineaNegocio(lineaNegocio);

  return (
    <main>
      {/* Hero */}
      <section className="border-b border-gray-200 bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-medium uppercase tracking-wider text-blue-600">
            IsaHouse
          </p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            Propiedades disponibles
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-600">
            Explora nuestro catalogo de inmuebles en Colombia. Encuentra la
            propiedad que se adapte a tus necesidades.
          </p>
        </div>
      </section>

      {/* Catalogo */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <TabsLineaNegocio lineaNegocioActiva={lineaNegocio} />

        {propiedades.length === 0 ? (
          <EstadoVacioPropiedades />
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {propiedades.map((propiedad) => (
              <CardPropiedadPublica key={propiedad.id} propiedad={propiedad} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
