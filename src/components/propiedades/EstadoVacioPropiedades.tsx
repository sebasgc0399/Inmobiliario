export default function EstadoVacioPropiedades() {
  return (
    <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="mb-4 h-12 w-12 text-gray-300"
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
      <h3 className="text-lg font-semibold text-gray-900">
        No hay propiedades disponibles
      </h3>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        Estamos preparando nuevas opciones. Vuelve pronto para ver las
        propiedades disponibles.
      </p>
    </div>
  );
}
