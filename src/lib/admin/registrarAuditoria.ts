import 'server-only';

import { Timestamp } from 'firebase-admin/firestore';

import { obtenerAdminDb } from '@/lib/firebase/admin';
import type { EventoAuditoriaAdmin } from '@/types/auditoria';

/**
 * Registra un evento de auditoría en Firestore.
 * Fire-and-forget: no lanza errores al llamador; los captura internamente.
 * Llamar sin `await` para no bloquear la respuesta al usuario.
 */
export function registrarAuditoria(
  datos: Omit<EventoAuditoriaAdmin, 'id' | 'creadoEn'>,
): void {
  obtenerAdminDb()
    .collection('auditoria')
    .add({
      ...datos,
      creadoEn: Timestamp.now(),
    })
    .catch((err) => {
      console.error('[registrarAuditoria] Error al escribir evento de auditoría:', err);
    });
}
