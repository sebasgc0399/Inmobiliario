import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Ponte en contacto con el equipo de IsaHouse. Estamos en El Poblado, Medellín. Escríbenos por WhatsApp o correo electrónico.',
};

const datosContacto = [
  {
    id: 'direccion',
    etiqueta: 'Dirección',
    valor: 'Calle 10 # 43D-15, El Poblado, Medellín',
    icono: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-blue-600 shrink-0 mt-0.5"
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
    etiqueta: 'Correo electrónico',
    valor: 'contacto@isahouse.co',
    href: 'mailto:contacto@isahouse.co',
    icono: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-blue-600 shrink-0 mt-0.5"
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
        className="h-5 w-5 text-green-500 shrink-0 mt-0.5"
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

export default function ContactoPage() {
  return (
    <main>

      {/* Hero de sección */}
      <section className="bg-gray-50 border-b border-gray-200 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-3">
            Estamos aquí para ayudarte
          </p>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contacto</h1>
          <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
            ¿Tienes preguntas sobre una propiedad o quieres hablar con un asesor?
            Escríbenos y te responderemos a la brevedad.
          </p>
        </div>
      </section>

      {/* Grid de contenido */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Columna izquierda: datos de contacto */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Información de contacto
            </h2>

            <ul className="space-y-5">
              {datosContacto.map((dato) => (
                <li key={dato.id} className="flex items-start gap-3">
                  {dato.icono}
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">
                      {dato.etiqueta}
                    </p>
                    {dato.href ? (
                      <a
                        href={dato.href}
                        className="text-sm text-gray-800 hover:text-blue-600 transition-colors"
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

            <div className="mt-8 rounded-2xl overflow-hidden border border-gray-200 h-52 bg-gray-100 flex items-center justify-center">
              <p className="text-sm text-gray-400">Mapa próximamente</p>
            </div>
          </div>

          {/* Columna derecha: formulario placeholder */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Envíanos un mensaje
            </h2>

            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-gray-100 p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-gray-400"
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
              </div>
              <div>
                <p className="text-base font-semibold text-gray-700 mb-1">
                  Formulario de contacto
                </p>
                <p className="text-sm text-gray-400">
                  Próximamente podrás enviarnos un mensaje directamente desde aquí.
                  Por ahora, contáctanos por WhatsApp o correo electrónico.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}
