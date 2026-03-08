import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Como Funciona la Compra de Inmuebles de Oportunidad | IsaHouse',
  description:
    'Conoce el proceso paso a paso para adquirir inmuebles embargados en Colombia. Requisitos, documentacion necesaria y preguntas frecuentes.',
  keywords: [
    'como comprar inmuebles embargados',
    'proceso compra inmueble embargado',
    'requisitos compra remate inmobiliario',
    'inversion inmobiliaria Colombia',
  ],
};

// ── Datos del proceso ─────────────────────────────────────────────────────────

const PASOS = [
  {
    numero: 1,
    titulo: 'Explora las oportunidades',
    descripcion:
      'Navega nuestro catalogo de inmuebles embargados disponibles. Cada propiedad incluye fotos, caracteristicas detalladas y precio de lista.',
  },
  {
    numero: 2,
    titulo: 'Envia tu oferta',
    descripcion:
      'Selecciona la propiedad que te interesa y envia tu oferta a traves del formulario. Puedes proponer un monto diferente al precio de lista.',
  },
  {
    numero: 3,
    titulo: 'Negociacion con la entidad',
    descripcion:
      'Presentamos tu oferta ante el comite de la entidad bancaria correspondiente. El proceso de revision puede tomar entre 5 y 15 dias habiles.',
  },
  {
    numero: 4,
    titulo: 'Aprobacion y documentacion',
    descripcion:
      'Si tu oferta es aprobada, te guiamos en todo el proceso de documentacion legal y financiera necesaria para formalizar la compra.',
  },
  {
    numero: 5,
    titulo: 'Escrituracion y entrega',
    descripcion:
      'Acompanamos el proceso notarial hasta la firma de escrituras publicas y la entrega formal del inmueble.',
  },
];

const DOCUMENTOS = [
  'Fotocopia de cedula de ciudadania ampliada al 150%',
  'Certificado de ingresos o declaracion de renta del ultimo ano',
  'Extractos bancarios de los ultimos 3 meses',
  'Carta de aprobacion de credito hipotecario (si aplica)',
  'Formato de oferta diligenciado (proporcionado por nosotros)',
];

const FAQ = [
  {
    pregunta: 'Que son los inmuebles de oportunidad?',
    respuesta:
      'Son propiedades que las entidades bancarias han recibido como parte de pago de obligaciones financieras. Al buscar liquidar estos activos, los bancos suelen ofrecer precios por debajo del valor comercial, generando oportunidades de inversion.',
  },
  {
    pregunta: 'Puedo financiar la compra?',
    respuesta:
      'Si. En muchos casos la misma entidad bancaria ofrece condiciones especiales de financiacion para estos inmuebles. Tambien puedes gestionar un credito hipotecario con cualquier banco.',
  },
  {
    pregunta: 'Cuanto tiempo toma el proceso?',
    respuesta:
      'Desde el envio de la oferta hasta la escrituracion, el proceso puede tomar entre 30 y 90 dias, dependiendo de la complejidad del caso y la entidad involucrada.',
  },
  {
    pregunta: 'Los inmuebles se entregan desocupados?',
    respuesta:
      'La mayoria de inmuebles se entregan desocupados. En caso de que exista un ocupante, la entidad bancaria se encarga del proceso de desalojo antes de la entrega.',
  },
  {
    pregunta: 'Hay riesgo de problemas legales?',
    respuesta:
      'Los inmuebles pasan por un estudio de titulos y juridico antes de ser ofrecidos. Nuestro equipo legal verifica que la propiedad este libre de gravamenes y problemas juridicos adicionales.',
  },
];

// ── Íconos ────────────────────────────────────────────────────────────────────

function IconoDocumento() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-amber-600" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function IconoCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 text-amber-600" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ComoFunciona() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Breadcrumb */}
      <nav aria-label="Ruta de navegacion" className="flex items-center gap-1.5 text-xs text-gray-400 mb-8">
        <Link href="/" className="hover:text-amber-600 transition-colors">Inicio</Link>
        <span aria-hidden="true">/</span>
        <Link href="/inversiones" className="hover:text-amber-600 transition-colors">Inversiones</Link>
        <span aria-hidden="true">/</span>
        <span className="text-gray-600" aria-current="page">Como funciona</span>
      </nav>

      {/* Encabezado */}
      <div className="text-center mb-12">
        <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
          Guia del proceso
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
          Como funciona la compra de inmuebles de oportunidad
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Te acompanamos en cada paso del proceso para que adquieras tu inmueble de forma segura y transparente.
        </p>
      </div>

      {/* Pasos del proceso */}
      <section aria-labelledby="proceso-titulo" className="mb-16">
        <h2 id="proceso-titulo" className="sr-only">Pasos del proceso</h2>
        <div className="space-y-6">
          {PASOS.map((paso) => (
            <div
              key={paso.numero}
              className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="flex-none w-10 h-10 rounded-full bg-amber-600 text-white font-bold text-lg flex items-center justify-center">
                {paso.numero}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">{paso.titulo}</h3>
                <p className="mt-1 text-sm text-gray-600 leading-relaxed">{paso.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Documentos requeridos */}
      <section aria-labelledby="documentos-titulo" className="mb-16">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <IconoDocumento />
            <h2 id="documentos-titulo" className="text-lg font-bold text-gray-900">
              Documentos generalmente requeridos
            </h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Los requisitos pueden variar segun la entidad y el tipo de inmueble. Estos son los documentos mas comunes:
          </p>
          <ul className="space-y-3">
            {DOCUMENTOS.map((doc) => (
              <li key={doc} className="flex items-start gap-2 text-sm text-gray-700">
                <IconoCheck />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-titulo" className="mb-16">
        <h2 id="faq-titulo" className="text-xl font-bold text-gray-900 mb-6 text-center">
          Preguntas frecuentes
        </h2>
        <div className="space-y-4">
          {FAQ.map((item) => (
            <details
              key={item.pregunta}
              className="group rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-sm font-semibold text-gray-900 hover:bg-gray-50/50 rounded-2xl transition-colors">
                {item.pregunta}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 shrink-0 text-gray-400 group-open:rotate-180 transition-transform"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <p className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
                {item.respuesta}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-8 sm:p-10">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          Listo para invertir?
        </h2>
        <p className="text-sm text-gray-600 mb-6 max-w-lg mx-auto">
          Explora nuestro catalogo de oportunidades de inversion inmobiliaria y encuentra la propiedad ideal para ti.
        </p>
        <Link
          href="/inversiones"
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
        >
          Ver oportunidades disponibles
        </Link>
      </section>
    </main>
  );
}
