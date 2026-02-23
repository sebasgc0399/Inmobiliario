import {
  Timestamp,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type WithFieldValue,
} from 'firebase-admin/firestore';

import type { Propiedad } from '@/types';

type PropiedadPersistida = Omit<Propiedad, 'id' | 'creadoEn' | 'actualizadoEn' | 'publicadoEn'> & {
  creadoEn: Timestamp | Date;
  actualizadoEn: Timestamp | Date;
  publicadoEn?: Timestamp | Date | null;
};

function aDate(valor: Timestamp | Date | null | undefined): Date | undefined {
  if (!valor) {
    return undefined;
  }

  return valor instanceof Timestamp ? valor.toDate() : valor;
}

export const propiedadConverter: FirestoreDataConverter<Propiedad> = {
  toFirestore(modelo: WithFieldValue<Propiedad>): DocumentData {
    const modeloTipado = modelo as Propiedad;
    const { id: _idIgnorado, ...resto } = modeloTipado;
    void _idIgnorado;

    return {
      ...resto,
      creadoEn: Timestamp.fromDate(modeloTipado.creadoEn),
      actualizadoEn: Timestamp.fromDate(modeloTipado.actualizadoEn),
      publicadoEn: modeloTipado.publicadoEn
        ? Timestamp.fromDate(modeloTipado.publicadoEn)
        : null,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Propiedad {
    const data = snapshot.data() as PropiedadPersistida;

    return {
      ...data,
      id: snapshot.id,
      creadoEn: aDate(data.creadoEn) ?? new Date(0),
      actualizadoEn: aDate(data.actualizadoEn) ?? new Date(0),
      publicadoEn: aDate(data.publicadoEn),
    };
  },
};
