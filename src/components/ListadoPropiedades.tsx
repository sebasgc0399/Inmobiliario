import type { Propiedad, Moneda } from '@/types';
import CardPropiedad from '@/components/CardPropiedad';

interface Props {
  propiedades: Propiedad[];
  monedaUsuario: Moneda;
}

export default function ListadoPropiedades({ propiedades, monedaUsuario }: Props) {
  if (propiedades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center text-gray-400">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-12 h-12 mb-4"
          aria-hidden="true"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <p className="text-lg font-medium text-gray-500">No se encontraron propiedades</p>
        <p className="text-sm mt-1">Intenta ajustar los filtros de búsqueda.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {propiedades.map((propiedad) => (
        <CardPropiedad key={propiedad.slug} propiedad={propiedad} monedaUsuario={monedaUsuario} />
      ))}
    </div>
  );
}
