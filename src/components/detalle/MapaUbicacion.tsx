'use client';

import type { Ubicacion } from '@/types';

interface Props {
  ubicacion: Ubicacion;
}

export default function MapaUbicacion({ ubicacion }: Props) {
  const { coordenadas, barrio, municipio, pais } = ubicacion;

  // Si hay coordenadas exactas se usan para mayor precisión; si no, búsqueda por texto
  const src = coordenadas
    ? `https://maps.google.com/maps?q=${coordenadas.latitud},${coordenadas.longitud}&output=embed&z=15`
    : `https://maps.google.com/maps?q=${encodeURIComponent(
        [barrio, municipio, pais].filter(Boolean).join(', '),
      )}&output=embed&z=13`;

  const etiquetaUbicacion = [barrio, municipio].filter(Boolean).join(', ');

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 aspect-video w-full bg-gray-100">
      <iframe
        src={src}
        title={`Mapa de ubicación en ${etiquetaUbicacion}`}
        className="w-full h-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        aria-label={`Mapa mostrando la ubicación en ${etiquetaUbicacion}`}
      />
    </div>
  );
}
