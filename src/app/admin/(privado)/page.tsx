import BotonCerrarSesion from './BotonCerrarSesion';

export const runtime = 'nodejs';

export default function PanelAdministracionPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Panel de Administración</h1>
        <p className="mt-2 text-sm text-gray-600">
          Acceso autorizado. Desde aquí podrás gestionar inmuebles y operaciones del
          panel.
        </p>
        <div className="mt-6">
          <BotonCerrarSesion />
        </div>
      </section>
    </main>
  );
}
