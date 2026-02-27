import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Nosotros',
  description:
    'Conoce al equipo de IsaHouse, tu portal inmobiliario de confianza en Colombia. Nuestra misión es conectar personas con el hogar de sus sueños.',
};

const valores = [
  {
    id: 'confianza',
    titulo: 'Confianza',
    descripcion:
      'Trabajamos con total transparencia en cada operación. Tu tranquilidad y seguridad son nuestra prioridad en cada transacción.',
    icono: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7 text-blue-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
  },
  {
    id: 'experiencia',
    titulo: 'Experiencia',
    descripcion:
      'Años de trayectoria en el mercado inmobiliario colombiano nos permiten asesorarte con conocimiento real del sector y de cada zona.',
    icono: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7 text-blue-600"
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
    ),
  },
  {
    id: 'compromiso',
    titulo: 'Compromiso',
    descripcion:
      'Cada cliente es único. Nos comprometemos a entender tus necesidades y encontrar la propiedad que realmente se adapte a tu vida.',
    icono: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7 text-blue-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
        />
      </svg>
    ),
  },
];

export default function NosotrosPage() {
  return (
    <main>

      {/* Hero de sección */}
      <section className="bg-gray-50 border-b border-gray-200 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-3">
            Quiénes somos
          </p>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sobre Nosotros
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
            En IsaHouse creemos que encontrar el lugar donde vivir o invertir no debería ser
            complicado. Conectamos personas con propiedades en Colombia con transparencia,
            agilidad y un acompañamiento personalizado en cada paso.
          </p>
        </div>
      </section>

      {/* Sección de valores */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Nuestros valores</h2>
        <p className="text-gray-500 mb-10">
          Los principios que guían cada decisión que tomamos.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {valores.map((valor) => (
            <div
              key={valor.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-blue-50 p-3">
                {valor.icono}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{valor.titulo}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{valor.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Banda CTA */}
      <section className="bg-blue-600 py-14 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">¿Tienes alguna pregunta?</h2>
            <p className="text-blue-100 text-sm">
              Nuestro equipo está listo para ayudarte. Escríbenos sin compromiso.
            </p>
          </div>
          <Link
            href="/contacto"
            className="shrink-0 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
          >
            Contáctanos
          </Link>
        </div>
      </section>

    </main>
  );
}
