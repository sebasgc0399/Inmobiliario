'use server';

import type {
  EnviarLeadContactoInput,
  ErroresLeadFormulario,
  Lead,
  ResultadoEnviarLeadContacto,
} from '@/types/lead';
import type { LineaNegocio } from '@/types/propiedad';
import { obtenerAdminFirestore } from '@/lib/firebase/admin';
import { obtenerPropiedadPublicaPorSlug } from '@/lib/propiedades/consultas';

const COLECCION_LEADS = 'leads';

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_TELEFONO = /^[0-9+()\-\s]+$/;
const REGEX_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface LeadNormalizado {
  nombre: string;
  telefono: string;
  email: string | null;
  mensaje: string;
  slugPropiedad: string | null;
}

interface InputSinValidar {
  nombre?: unknown;
  telefono?: unknown;
  email?: unknown;
  mensaje?: unknown;
  slugPropiedad?: unknown;
}

function quitarControles(valor: string): string {
  return valor.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

function limpiarTextoCorto(valor: unknown): string {
  if (typeof valor !== 'string') return '';
  return quitarControles(valor).replace(/\s+/g, ' ').trim();
}

function limpiarMensaje(valor: unknown): string {
  if (typeof valor !== 'string') return '';
  return quitarControles(valor).replace(/\r\n/g, '\n').trim();
}

function normalizarEmail(valor: unknown): string | null {
  const email = limpiarTextoCorto(valor).toLowerCase();
  return email.length > 0 ? email : null;
}

function normalizarSlug(valor: unknown): string | null {
  const slug = limpiarTextoCorto(valor).toLowerCase();
  if (!slug) return null;
  if (slug.length > 120) return null;
  if (!REGEX_SLUG.test(slug)) return null;
  return slug;
}

function normalizarInput(input: unknown): EnviarLeadContactoInput {
  if (typeof input !== 'object' || input === null) {
    return {
      nombre: '',
      telefono: '',
      email: null,
      mensaje: '',
      slugPropiedad: null,
    };
  }

  const inputUnsafe = input as InputSinValidar;

  return {
    nombre: typeof inputUnsafe.nombre === 'string' ? inputUnsafe.nombre : '',
    telefono:
      typeof inputUnsafe.telefono === 'string' ? inputUnsafe.telefono : '',
    email: typeof inputUnsafe.email === 'string' ? inputUnsafe.email : null,
    mensaje: typeof inputUnsafe.mensaje === 'string' ? inputUnsafe.mensaje : '',
    slugPropiedad:
      typeof inputUnsafe.slugPropiedad === 'string'
        ? inputUnsafe.slugPropiedad
        : null,
  };
}

function validarFormularioLead(
  input: EnviarLeadContactoInput
): { normalizado: LeadNormalizado; errores: ErroresLeadFormulario } {
  const nombre = limpiarTextoCorto(input.nombre);
  const telefono = limpiarTextoCorto(input.telefono);
  const email = normalizarEmail(input.email);
  const mensaje = limpiarMensaje(input.mensaje);
  const slugPropiedad = normalizarSlug(input.slugPropiedad);

  const errores: ErroresLeadFormulario = {};

  if (!nombre) {
    errores.nombre = 'El nombre es obligatorio.';
  } else if (nombre.length < 2) {
    errores.nombre = 'El nombre debe tener al menos 2 caracteres.';
  } else if (nombre.length > 120) {
    errores.nombre = 'El nombre no puede superar 120 caracteres.';
  }

  if (!telefono) {
    errores.telefono = 'El telefono es obligatorio.';
  } else if (telefono.length < 7) {
    errores.telefono = 'El telefono debe tener al menos 7 caracteres.';
  } else if (telefono.length > 30) {
    errores.telefono = 'El telefono no puede superar 30 caracteres.';
  } else if (!REGEX_TELEFONO.test(telefono)) {
    errores.telefono = 'Ingresa un telefono valido.';
  }

  if (email && email.length > 160) {
    errores.email = 'El correo no puede superar 160 caracteres.';
  } else if (email && !REGEX_EMAIL.test(email)) {
    errores.email = 'Ingresa un correo valido.';
  }

  if (!mensaje) {
    errores.mensaje = 'El mensaje es obligatorio.';
  } else if (mensaje.length < 10) {
    errores.mensaje = 'El mensaje debe tener al menos 10 caracteres.';
  } else if (mensaje.length > 1000) {
    errores.mensaje = 'El mensaje no puede superar 1000 caracteres.';
  }

  return {
    normalizado: {
      nombre,
      telefono,
      email,
      mensaje,
      slugPropiedad,
    },
    errores,
  };
}

async function resolverContextoPropiedad(slugEntrada: string | null): Promise<{
  slugPropiedad: string | null;
  lineaNegocio: LineaNegocio | null;
}> {
  if (!slugEntrada) {
    return { slugPropiedad: null, lineaNegocio: null };
  }

  const propiedad = await obtenerPropiedadPublicaPorSlug(slugEntrada);

  if (!propiedad) {
    return { slugPropiedad: null, lineaNegocio: null };
  }

  return {
    slugPropiedad: propiedad.slug,
    lineaNegocio: propiedad.lineaNegocio,
  };
}

export async function enviarLeadContacto(
  input: EnviarLeadContactoInput
): Promise<ResultadoEnviarLeadContacto> {
  const inputNormalizado = normalizarInput(input);
  const { normalizado, errores } = validarFormularioLead(inputNormalizado);

  if (Object.keys(errores).length > 0) {
    return {
      ok: false,
      mensaje: 'Revisa los datos del formulario.',
      errores,
    };
  }

  try {
    const { slugPropiedad, lineaNegocio } = await resolverContextoPropiedad(
      normalizado.slugPropiedad
    );

    const lead: Lead = {
      nombre: normalizado.nombre,
      telefono: normalizado.telefono,
      email: normalizado.email,
      mensaje: normalizado.mensaje,
      slugPropiedad,
      lineaNegocio,
      origen: 'contacto_web',
      createdAt: new Date(),
    };

    const referencia = await obtenerAdminFirestore().collection(COLECCION_LEADS).add({
      nombre: lead.nombre,
      telefono: lead.telefono,
      email: lead.email ?? null,
      mensaje: lead.mensaje,
      slugPropiedad: lead.slugPropiedad ?? null,
      lineaNegocio: lead.lineaNegocio ?? null,
      origen: lead.origen,
      createdAt: lead.createdAt,
    });

    return {
      ok: true,
      leadId: referencia.id,
      mensaje: 'Gracias. Recibimos tu mensaje y te contactaremos pronto.',
    };
  } catch {
    return {
      ok: false,
      mensaje: 'No fue posible enviar el formulario. Intenta nuevamente.',
    };
  }
}
