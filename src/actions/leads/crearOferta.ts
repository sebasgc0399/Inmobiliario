'use server';

import { Timestamp } from 'firebase-admin/firestore';

import { obtenerAdminDb } from '@/lib/firebase/admin';
import type { Moneda } from '@/types';
import type { CamposFormularioOferta, Lead } from '@/types/lead';

type ResultadoCrearOferta = { ok: true } | { ok: false; error: string };
type DatosOfertaCliente = Omit<CamposFormularioOferta, 'monedaOferta'>;

const MONEDAS_VALIDAS: Moneda[] = ['COP', 'USD', 'EUR'];

export async function crearOferta(
  slugPropiedad: string,
  codigoPropiedad: string,
  monedaOferta: Moneda,
  datos: DatosOfertaCliente,
): Promise<ResultadoCrearOferta> {
  const slugLimpio = slugPropiedad?.trim().toLowerCase() ?? '';
  const codigoLimpio = codigoPropiedad?.trim().toUpperCase() ?? '';
  const nombreLimpio = datos.nombre?.trim() ?? '';
  const telefonoLimpio = datos.telefono?.trim() ?? '';
  const emailLimpio = datos.email?.trim() ?? '';
  const mensajeLimpio = datos.mensaje?.trim() ?? '';

  if (!slugLimpio || !codigoLimpio) {
    return { ok: false, error: 'Propiedad no identificada.' };
  }
  if (!MONEDAS_VALIDAS.includes(monedaOferta)) {
    return { ok: false, error: 'Moneda invalida.' };
  }
  if (!nombreLimpio || nombreLimpio.length > 120) {
    return { ok: false, error: 'Nombre invalido.' };
  }
  if (!telefonoLimpio || telefonoLimpio.length < 6 || telefonoLimpio.length > 30) {
    return { ok: false, error: 'Telefono invalido.' };
  }
  if (!emailLimpio || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio)) {
    return { ok: false, error: 'Correo invalido.' };
  }
  if (emailLimpio.length > 254) {
    return { ok: false, error: 'Correo demasiado largo.' };
  }
  if (!mensajeLimpio || mensajeLimpio.length > 1000) {
    return { ok: false, error: 'Mensaje invalido.' };
  }
  if (typeof datos.montoOfertado !== 'number' || !Number.isFinite(datos.montoOfertado)) {
    return { ok: false, error: 'El monto ofertado es invalido.' };
  }
  if (datos.montoOfertado <= 0) {
    return { ok: false, error: 'El monto ofertado debe ser mayor a 0.' };
  }
  if (!datos.aceptaTerminos) {
    return { ok: false, error: 'Debes aceptar los terminos del proceso.' };
  }

  const ahora = new Date();

  const leadData: Omit<Lead, 'id'> = {
    nombre: nombreLimpio,
    telefono: telefonoLimpio,
    email: emailLimpio,
    mensaje: mensajeLimpio,
    slugPropiedad: slugLimpio,
    codigoPropiedad: codigoLimpio,
    origen: 'formulario_oferta',
    estado: 'nuevo',
    oferta: {
      montoOfertado: datos.montoOfertado,
      monedaOferta,
      estadoOferta: 'pendiente',
    },
    creadoEn: ahora,
    actualizadoEn: ahora,
  };

  try {
    await obtenerAdminDb()
      .collection('leads')
      .add({
        ...leadData,
        creadoEn: Timestamp.fromDate(ahora),
        actualizadoEn: Timestamp.fromDate(ahora),
      });

    return { ok: true };
  } catch (error) {
    console.error('[crearOferta] Error al escribir en Firestore:', error);
    return { ok: false, error: 'Error al enviar la oferta. Intentalo de nuevo.' };
  }
}
