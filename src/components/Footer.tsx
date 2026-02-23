import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Col 1: Marca */}
          <div>
            <span className="text-white font-bold text-xl tracking-tight">IsaHouse</span>
            <p className="mt-3 text-sm leading-relaxed">
              Tu portal inmobiliario de confianza en Colombia.
              Conectamos personas con el hogar de sus sueños.
            </p>
            <span className="sr-only">
              IsaHouse es la plataforma líder en venta y alquiler de casas, apartamentos, fincas y
              locales comerciales en Medellín, Bogotá y toda Colombia. Encuentra las mejores opciones
              para inversión inmobiliaria.
            </span>
          </div>

          {/* Col 2: Navegación */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Navegación
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="text-sm hover:text-white transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-sm hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Búsquedas populares (SEO) */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Búsquedas populares
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/?negocio=venta&tipo=casa" className="text-sm hover:text-white transition-colors">
                  Casas en Venta
                </Link>
              </li>
              <li>
                <Link href="/?negocio=alquiler&tipo=apartamento" className="text-sm hover:text-white transition-colors">
                  Apartamentos en Arriendo
                </Link>
              </li>
              <li>
                <Link href="/?condicion=sobre_planos" className="text-sm hover:text-white transition-colors">
                  Proyectos Sobre Planos
                </Link>
              </li>
              <li>
                <Link href="/?tipo=finca" className="text-sm hover:text-white transition-colors">
                  Fincas de Recreo
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contacto */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Contacto
            </h3>
            <ul className="space-y-3 text-sm">
              <li>Calle 10 # 43D-15, El Poblado, Medellín</li>
              <li>contacto@isahouse.co</li>
              <li className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-green-400 shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.532 5.845L0 24l6.336-1.51A11.956 11.956 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.369l-.36-.214-3.727.978.995-3.636-.235-.374A9.818 9.818 0 1112 21.818z" />
                </svg>
                +57 (604) 123 4567
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Borde + copyright */}
      <div className="border-t border-gray-800 py-5 text-center text-xs text-gray-600">
        © 2026 IsaHouse. Todos los derechos reservados.
      </div>
    </footer>
  );
}
