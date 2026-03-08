'use server';

import { Timestamp } from 'firebase-admin/firestore';

import { obtenerAdminDb } from '@/lib/firebase/admin';
import type { CamposFormularioOferta, Lead } from '@/types/lead';

type ResultadoCrearOferta = { ok: true } | { ok: false; error: string };

/**
 * Server Action para crear un lead de oferta de inversión en Firestore.
 *
 * Pre-vincular slug y codigo desde el Server Component:
 *   crearOferta.bind(null, slug, codigoPropiedad)
 *
 * Validaciones:
 * - montoOfertado > 0
 * - email obligatorio (a diferencia de crearLead)
 * - aceptaTerminos === true
 */
export async function crearOferta(
  slugPropiedad: string,
  codigoPropiedad: string,
  datos: CamposFormularioOferta,
): Promise<ResultadoCrearOferta> {
  // ── Validación defensiva ────────────────────────────────────────────────────
  const nombreLimpio = datos.nombre?.trim() ?? '';
  const telefonoLimpio = datos.telefono?.trim() ?? '';
  const emailLimpio = datos.email?.trim() ?? '';
  const mensajeLimpio = datos.mensaje?.trim() ?? '';

  if (!nombreLimpio || nombreLimpio.length > 120) {
    return { ok: false, error: 'Nombre inválido.' };
  }
  if (!telefonoLimpio || telefonoLimpio.length < 6 || telefonoLimpio.length > 30) {
    return { ok: false, error: 'Teléfono inválido.' };
  }
  if (!emailLimpio || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio)) {
    return { ok: false, error: 'Email inválido.' };
  }
  if (emailLimpio.length > 254) {
    return { ok: false, error: 'Email demasiado largo.' };
  }
  if (!mensajeLimpio || mensajeLimpio.length > 1000) {
    return { ok: false, error: 'Mensaje inválido.' };
  }
  if (typeof datos.montoOfertado !== 'number' || datos.montoOfertado <= 0) {
    return { ok: false, error: 'El monto ofertado debe ser mayor a 0.' };
  }
  if (!datos.monedaOferta || !['COP', 'USD', 'EUR'].includes(datos.monedaOferta)) {
    return { ok: false, error: 'Moneda inválida.' };
  }
  if (!datos.aceptaTerminos) {
    return { ok: false, error: 'Debes aceptar los términos y condiciones.' };
  }
  if (!slugPropiedad || !codigoPropiedad) {
    return { ok: false, error: 'Propiedad no identificada.' };
  }

  // ── Construcción del documento ──────────────────────────────────────────────
  const ahora = new Date();

  const leadData: Omit<Lead, 'id'> = {
    nombre: nombreLimpio,
    telefono: telefonoLimpio,
    email: emailLimpio,
    mensaje: mensajeLimpio,
    slugPropiedad,
    codigoPropiedad,
    origen: 'formulario_oferta',
    estado: 'nuevo',
    oferta: {
      montoOfertado: datos.montoOfertado,
      monedaOferta: datos.monedaOferta,
      estadoOferta: 'pendiente',
    },
    creadoEn: ahora,
    actualizadoEn: ahora,
  };

  // ── Escritura en Firestore ────────────────────────────────────────────────
  try {
    await obtenerAdminDb()
      .collection('leads')
      .add({
        ...leadData,
        creadoEn: Timestamp.fromDate(ahora),
        actualizadoEn: Timestamp.fromDate(ahora),
      });

    return { ok: true };
  } catch (err) {
    console.error('[crearOferta] Error al escribir en Firestore:', err);
    return { ok: false, error: 'Error al enviar la oferta. Inténtalo de nuevo.' };
  }
}
