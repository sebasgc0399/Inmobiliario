import Link from 'next/link';
import type { LineaNegocio } from '@/types/propiedad';

const TABS: { valor: LineaNegocio; etiqueta: string }[] = [
  { valor: 'tradicional', etiqueta: 'Tradicional' },
  { valor: 'inversion', etiqueta: 'Oportunidades de Inversion' },
];

export default function TabsLineaNegocio({
  lineaNegocioActiva,
}: {
  lineaNegocioActiva: LineaNegocio;
}) {
  return (
    <nav className="flex border-b border-gray-200">
      {TABS.map((tab) => {
        const activo = tab.valor === lineaNegocioActiva;
        return (
          <Link
            key={tab.valor}
            href={`/?lineaNegocio=${tab.valor}`}
            scroll={false}
            aria-current={activo ? 'page' : undefined}
            className={`flex-1 border-b-2 px-4 py-3 text-center text-sm font-medium transition-colors sm:flex-none ${
              activo
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            {tab.etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}
