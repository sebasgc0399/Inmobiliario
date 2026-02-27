'use server';

import 'server-only';

import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

import { obtenerAdminDb, obtenerAdminStorage } from '@/lib/firebase/admin';
import { validarSesionAdmin } from '@/lib/admin/validarSesionAdmin';
import type { ResultadoAccion } from '@/types';

/**
 * Elimina una imagen de una propiedad de forma atómica:
 * 1. Borra el archivo de Firebase Storage.
 * 2. Si Storage falla → abortar, NO tocar Firestore.
 * 3. Actualiza el documento Firestore: arrayRemove de imagenes
 *    y, si era la imagen principal, limpia ese campo también.
 *
 * Esta acción es irreversible. La confirmación (window.confirm) debe
 * hacerse en el cliente antes de llamarla.
 */
export async function eliminarImagenPropiedad(
  idPropiedad: string,
  urlImagen: string,
  esPrincipal: boolean,
  slug?: string, // Para revalidar la ruta pública si está disponible
): Promise<ResultadoAccion<void>> {

  // 1. Autenticación
  try {
    await validarSesionAdmin();
  } catch {
    return { ok: false, error: 'No autorizado.' };
  }

  // 2. Validación básica
  if (!idPropiedad?.trim() || !urlImagen?.trim()) {
    return { ok: false, error: 'Parámetros inválidos.' };
  }

  // 3. Extraer path de Storage desde la URL de descarga.
  // Las URLs tienen el formato:
  // https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encoded-path}?alt=media&token=...
  let storagePath: string;
  try {
    const url = new URL(urlImagen);
    const segmentoO = '/o/';
    const indice = url.pathname.indexOf(segmentoO);
    if (indice === -1) throw new Error('URL de Storage no reconocida.');
    storagePath = decodeURIComponent(url.pathname.slice(indice + segmentoO.length));
  } catch (err) {
    console.error('[eliminarImagenPropiedad] URL inválida:', urlImagen, err);
    return { ok: false, error: 'La URL de la imagen no es válida.' };
  }

  // 4. Borrar de Firebase Storage PRIMERO.
  // Si falla, se aborta sin tocar Firestore.
  try {
    await obtenerAdminStorage().bucket().file(storagePath).delete();
  } catch (err) {
    console.error('[eliminarImagenPropiedad] Error al borrar de Storage:', err);
    return { ok: false, error: 'No se pudo eliminar el archivo. Inténtalo de nuevo.' };
  }

  // 5. Actualizar Firestore: arrayRemove + limpiar imagenPrincipal si aplica.
  try {
    const db = obtenerAdminDb();
    const updateData: Record<string, unknown> = {
      imagenes: FieldValue.arrayRemove(urlImagen),
      actualizadoEn: Timestamp.now(),
    };

    if (esPrincipal) {
      updateData.imagenPrincipal = FieldValue.delete();
    }

    await db.collection('propiedades').doc(idPropiedad).update(updateData);
  } catch (err) {
    // Storage ya fue borrado pero Firestore falló — inconsistencia parcial.
    // Se loguea para diagnóstico; el admin puede re-guardar el formulario para sincronizar.
    console.error('[eliminarImagenPropiedad] Error al actualizar Firestore:', err);
    return { ok: false, error: 'Imagen borrada del servidor, pero falló la actualización de la base de datos. Guarda el formulario para sincronizar.' };
  }

  // 6. Revalidar caché
  revalidatePath('/admin/propiedades');
  if (slug) {
    revalidatePath(`/propiedades/${slug}`);
  }

  return { ok: true };
}
