import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <section className="border-b border-gray-200 bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            IsaHouse
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Plataforma en reconstruccion con una base mas simple.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
            El catalogo y la logica comercial anterior fueron retirados para redisenar el
            sistema desde cero. Por ahora mantenemos la infraestructura base, la presencia
            institucional y el acceso administrativo.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/nosotros"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Conocer la empresa
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900"
            >
              Ir a contacto
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Base tecnica protegida</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Firebase, autenticacion, layouts y proteccion de rutas siguen activos como
              fundamento del nuevo sistema.
            </p>
          </article>
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Dominio reiniciado</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Se eliminaron catalogo, leads, ofertas, filtros y formularios de inmuebles
              para rehacer el modelo de datos sin deuda heredada.
            </p>
          </article>
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Siguiente etapa</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              El sitio queda listo para reconstruir la nueva base inmobiliaria sobre un
              lienzo limpio y mantenible.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
