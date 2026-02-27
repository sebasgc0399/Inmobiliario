'use server';

import { Timestamp } from 'firebase-admin/firestore';

import { obtenerAdminDb } from '@/lib/firebase/admin';
import { registrarAuditoria } from '@/lib/admin/registrarAuditoria';
import { validarSesionAdmin } from '@/lib/admin/validarSesionAdmin';
import type { CamposFormularioContacto, Lead, OrigenLead } from '@/types/lead';

type ResultadoCrearLead = { ok: true } | { ok: false; error: string };

/**
 * Server Action unificada para crear un lead en Firestore.
 *
 * Soporta tres orígenes:
 * - 'formulario_detalle': formulario en /propiedades/[slug]. Requiere slug y codigo.
 *   Pre-vincular con .bind(null, 'formulario_detalle', slug, codigo) desde el Server Component.
 * - 'formulario_contacto': formulario en /contacto. Sin propiedad asociada.
 *   Pre-vincular con .bind(null, 'formulario_contacto', undefined, undefined).
 * - 'manual_admin': creación manual desde el panel admin. Requiere sesión de administrador.
 *
 * Los parámetros slugPropiedad y codigoPropiedad se pre-vinculan en el servidor
 * para evitar que el cliente los manipule.
 */
export async function crearLead(
  origen: OrigenLead,
  slugPropiedad: string | undefined,
  codigoPropiedad: string | undefined,
  datos: CamposFormularioContacto & { email?: string; notas?: string },
): Promise<ResultadoCrearLead> {
  // ── Autorización para origen admin ─────────────────────────────────────────
  let adminUid: string | undefined;

  if (origen === 'manual_admin') {
    try {
      const token = await validarSesionAdmin();
      adminUid = token.uid;
    } catch {
      return { ok: false, error: 'No autorizado.' };
    }
  }

  // ── Validación defensiva ────────────────────────────────────────────────────
  const nombreLimpio = datos.nombre?.trim() ?? '';
  const telefonoLimpio = datos.telefono?.trim() ?? '';
  const mensajeLimpio = datos.mensaje?.trim() ?? '';
  const emailLimpio = datos.email?.trim() ?? '';
  const notasLimpio = datos.notas?.trim() ?? '';

  if (!nombreLimpio || nombreLimpio.length > 120) {
    return { ok: false, error: 'Nombre inválido.' };
  }
  if (!telefonoLimpio || telefonoLimpio.length < 6 || telefonoLimpio.length > 30) {
    return { ok: false, error: 'Teléfono inválido.' };
  }
  if (!mensajeLimpio || mensajeLimpio.length > 1000) {
    return { ok: false, error: 'Mensaje inválido.' };
  }
  if (emailLimpio && emailLimpio.length > 254) {
    return { ok: false, error: 'Email inválido.' };
  }
  if (origen === 'formulario_detalle' && (!slugPropiedad || !codigoPropiedad)) {
    return { ok: false, error: 'Propiedad no identificada.' };
  }

  // ── Construcción del documento ──────────────────────────────────────────────
  const ahora = new Date();

  const leadData: Omit<Lead, 'id'> = {
    nombre: nombreLimpio,
    telefono: telefonoLimpio,
    mensaje: mensajeLimpio,
    origen,
    estado: 'nuevo',
    creadoEn: ahora,
    actualizadoEn: ahora,
    ...(slugPropiedad && { slugPropiedad }),
    ...(codigoPropiedad && { codigoPropiedad }),
    ...(emailLimpio && { email: emailLimpio }),
    ...(notasLimpio && { notas: notasLimpio }),
  };

  // ── Escritura en Firestore ──────────────────────────────────────────────────
  try {
    const docRef = await obtenerAdminDb()
      .collection('leads')
      .add({
        ...leadData,
        creadoEn: Timestamp.fromDate(ahora),
        actualizadoEn: Timestamp.fromDate(ahora),
      });

    // Auditoría para leads creados por el admin
    if (origen === 'manual_admin' && adminUid) {
      registrarAuditoria({
        accion: 'lead_creado',
        entidadId: docRef.id,
        entidadTipo: 'lead',
        adminUid,
        descripcion: `Creó lead manual: ${nombreLimpio} (${telefonoLimpio})`,
      });
    }

    return { ok: true };
  } catch (err) {
    console.error('[crearLead] Error al escribir en Firestore:', err);
    return { ok: false, error: 'Error al enviar el mensaje. Inténtalo de nuevo.' };
  }
}
