import type { Propiedad, PropiedadPublica } from '@/types/propiedad';

/** Elimina todos los campos sensibles. Usar antes de pasar datos a Client Components. */
export function sanitizarPropiedad(propiedad: Propiedad): PropiedadPublica {
  const {
    entidadBancaria,
    referenciaEntidad,
    porcentajeParticipacion,
    notasInternas,
    ...publica
  } = propiedad;
  return publica;
}

/** Sanitiza un array de propiedades. */
export function sanitizarPropiedades(propiedades: Propiedad[]): PropiedadPublica[] {
  return propiedades.map(sanitizarPropiedad);
}
