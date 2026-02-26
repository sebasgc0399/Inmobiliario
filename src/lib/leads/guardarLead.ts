'use server';

import { Timestamp } from 'firebase-admin/firestore';

import { obtenerAdminDb } from '@/lib/firebase/admin';
import type { CamposFormularioContacto, Lead } from '@/types/lead';

export interface ResultadoGuardarLead {
  ok: boolean;
  error?: string;
}

/**
 * Server Action para guardar un lead en Firestore.
 * slugPropiedad y codigoPropiedad se pre-vinculan desde el Server Component
 * usando .bind() para que el cliente no pueda manipularlos.
 */
export async function guardarLead(
  slugPropiedad: string,
  codigoPropiedad: string,
  campos: CamposFormularioContacto,
): Promise<ResultadoGuardarLead> {
  // Validación defensiva en el servidor (los Server Actions son endpoints HTTP públicos)
  const nombreLimpio = campos.nombre?.trim() ?? '';
  const telefonoLimpio = campos.telefono?.trim() ?? '';
  const mensajeLimpio = campos.mensaje?.trim() ?? '';

  if (!nombreLimpio || nombreLimpio.length > 120) {
    return { ok: false, error: 'Nombre inválido.' };
  }
  if (!telefonoLimpio || telefonoLimpio.length > 30) {
    return { ok: false, error: 'Teléfono inválido.' };
  }
  if (!mensajeLimpio || mensajeLimpio.length > 1000) {
    return { ok: false, error: 'Mensaje inválido.' };
  }
  if (!slugPropiedad || !codigoPropiedad) {
    return { ok: false, error: 'Propiedad no identificada.' };
  }

  const lead: Omit<Lead, 'id'> = {
    slugPropiedad,
    codigoPropiedad,
    nombre: nombreLimpio,
    telefono: telefonoLimpio,
    mensaje: mensajeLimpio,
    origen: 'formulario_detalle',
    creadoEn: new Date(),
    estado: 'nuevo',
  };

  try {
    await obtenerAdminDb()
      .collection('leads')
      .add({
        ...lead,
        creadoEn: Timestamp.fromDate(lead.creadoEn),
      });

    return { ok: true };
  } catch (err) {
    console.error('[guardarLead] Error al escribir en Firestore:', err);
    return { ok: false, error: 'Error al enviar el mensaje. Inténtalo de nuevo.' };
  }
}
