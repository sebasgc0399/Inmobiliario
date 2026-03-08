import 'server-only';

import { Timestamp } from 'firebase-admin/firestore';
import type { Propiedad } from '@/types/propiedad';

/** Forma del documento en Firestore (Timestamps en vez de Date, sin id). */
export type PropiedadFirestore = Omit<Propiedad, 'id' | 'creadoEn' | 'actualizadoEn'> & {
  creadoEn: Timestamp;
  actualizadoEn: Timestamp;
};

/** Convierte documento Firestore → modelo de dominio. */
export function documentoAPropiedad(id: string, data: PropiedadFirestore): Propiedad {
  return {
    ...data,
    id,
    creadoEn: data.creadoEn.toDate(),
    actualizadoEn: data.actualizadoEn.toDate(),
  };
}

/** Convierte modelo de dominio → documento Firestore (para escritura). */
export function propiedadADocumento(propiedad: Propiedad): PropiedadFirestore {
  const { id, creadoEn, actualizadoEn, ...resto } = propiedad;
  return {
    ...resto,
    creadoEn: Timestamp.fromDate(creadoEn),
    actualizadoEn: Timestamp.fromDate(actualizadoEn),
  };
}
