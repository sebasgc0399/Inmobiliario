import {
  Timestamp,
  type DocumentData,
  type FirestoreDataConverter,
  type PartialWithFieldValue,
  type QueryDocumentSnapshot,
  type SetOptions,
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

function serializarFecha(valor: unknown): unknown {
  return valor instanceof Date ? Timestamp.fromDate(valor) : valor;
}

function serializarPropiedad(
  modelo: WithFieldValue<Propiedad> | PartialWithFieldValue<Propiedad>,
): DocumentData {
  const data: DocumentData = { ...(modelo as Record<string, unknown>) };
  delete data.id;

  if ('creadoEn' in data) {
    data.creadoEn = serializarFecha(data.creadoEn);
  }

  if ('actualizadoEn' in data) {
    data.actualizadoEn = serializarFecha(data.actualizadoEn);
  }

  if ('publicadoEn' in data) {
    if (data.publicadoEn === undefined) {
      delete data.publicadoEn;
    } else {
      data.publicadoEn = serializarFecha(data.publicadoEn);
    }
  }

  return data;
}

export const propiedadConverter: FirestoreDataConverter<Propiedad> = {
  toFirestore(
    modelo: WithFieldValue<Propiedad> | PartialWithFieldValue<Propiedad>,
    _options?: SetOptions,
  ): DocumentData {
    void _options;
    return serializarPropiedad(modelo);
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
