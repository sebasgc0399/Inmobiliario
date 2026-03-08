import Link from 'next/link';

const enlaces = [
  { href: '/', label: 'Inicio' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
] as const;

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <span className="text-xl font-bold tracking-tight text-white">IsaHouse</span>
          <p className="mt-3 max-w-sm text-sm leading-relaxed">
            Presencia institucional y base tecnica activa mientras se reconstruye la
            plataforma sobre un modelo mas simple.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
            Navegacion
          </h2>
          <ul className="mt-4 space-y-2">
            {enlaces.map((enlace) => (
              <li key={enlace.href}>
                <Link
                  href={enlace.href}
                  className="text-sm transition-colors hover:text-white"
                >
                  {enlace.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
            Contacto
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>Medellin, Colombia</li>
            <li>contacto@isahouse.co</li>
            <li>+57 (604) 123 4567</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 px-4 py-5 text-center text-xs text-gray-600 sm:px-6 lg:px-8">
        (c) 2026 IsaHouse. Infraestructura base en linea.
      </div>
    </footer>
  );
}
