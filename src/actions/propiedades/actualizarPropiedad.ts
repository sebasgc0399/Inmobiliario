'use server';

import 'server-only';

import type { DecodedIdToken } from 'firebase-admin/auth';
import { Timestamp } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

import { obtenerAdminDb } from '@/lib/firebase/admin';
import { validarSesionAdmin } from '@/lib/admin/validarSesionAdmin';
import { registrarAuditoria } from '@/lib/admin/registrarAuditoria';
import type { ResultadoAccion, TipoPropiedad, ModoNegocio, CondicionInmueble, Moneda, Estrato } from '@/types';

// ── Tipo de entrada ────────────────────────────────────────────────────────────
// Extiende los datos de creación con los campos necesarios para la actualización.

export interface DatosActualizarPropiedad {
  // Identificadores de la propiedad existente
  id: string;
  slugAnterior: string;    // Para detectar cambio y limpiar slugUnicos
  codigoAnterior: string;  // Para detectar cambio y limpiar codigoUnicos

  // Campos editables (mismos que DatosCrearPropiedad)
  slug: string;
  codigoPropiedad: string;
  titulo: string;
  descripcion: string;
  tipo: TipoPropiedad;
  modoNegocio: ModoNegocio;
  condicion: CondicionInmueble;
  destacado: boolean;
  tourVirtual?: string;
  videoUrl?: string;
  tags?: string[];

  precio: {
    valor: number;
    moneda: Moneda;
    adminMensual?: number;
    impuestoPredial?: number;
    negociable?: boolean;
  };

  ubicacion: {
    pais: string;
    departamento: string;
    municipio: string;
    barrio?: string;
    direccion: string;
    codigoPostal?: string;
    coordenadas?: { latitud: number; longitud: number };
  };

  caracteristicas: {
    habitaciones: number;
    banos: number;
    metrosCuadrados: number;
    metrosConstruidos?: number;
    parqueaderos: number;
    pisos?: number;
    piso?: number;
    estrato?: Estrato;
    antiguedad?: number;
    instalaciones: string[];
    permiteRentaCorta?: boolean;
  };

  imagenes: string[];
  imagenPrincipal?: string;

  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };

  agente?: {
    nombre: string;
    telefono: string;
    email?: string;
    whatsapp?: string;
  };
}

// ── Server Action ──────────────────────────────────────────────────────────────

export async function actualizarPropiedad(
  datos: DatosActualizarPropiedad,
): Promise<ResultadoAccion<{ id: string; slug: string }>> {

  // 1. Autenticación y autorización
  let adminToken: DecodedIdToken;
  try {
    adminToken = await validarSesionAdmin();
  } catch {
    return { ok: false, error: 'No autorizado.' };
  }

  // 2. Validación defensiva
  const tituloLimpio = (datos.titulo ?? '').trim();
  if (!tituloLimpio || tituloLimpio.length < 5 || tituloLimpio.length > 200) {
    return { ok: false, error: 'El título es inválido (5–200 caracteres).' };
  }

  const codigoLimpio = (datos.codigoPropiedad ?? '').trim().toUpperCase();
  if (!codigoLimpio || codigoLimpio.length > 30) {
    return { ok: false, error: 'El código de propiedad es inválido.' };
  }

  const slugLimpio = (datos.slug ?? '').trim().toLowerCase();
  if (!slugLimpio || slugLimpio.length > 100) {
    return { ok: false, error: 'El slug es inválido.' };
  }

  if (!datos.precio?.valor || datos.precio.valor <= 0) {
    return { ok: false, error: 'El precio debe ser mayor a 0.' };
  }

  if (!datos.id?.trim()) {
    return { ok: false, error: 'ID de propiedad inválido.' };
  }

  const slugAnterior = (datos.slugAnterior ?? '').trim().toLowerCase();
  const codigoAnterior = (datos.codigoAnterior ?? '').trim().toUpperCase();

  // 3. Transacción atómica en Firestore
  const db = obtenerAdminDb();
  const propiedadRef = db.collection('propiedades').doc(datos.id);

  const slugCambio = slugLimpio !== slugAnterior;
  const codigoCambio = codigoLimpio !== codigoAnterior;

  try {
    await db.runTransaction(async (tx) => {
      // Leer el documento actual para preservar campos controlados por el servidor
      const propSnap = await tx.get(propiedadRef);
      if (!propSnap.exists) {
        throw new Error('PROPIEDAD_NO_ENCONTRADA');
      }
      const propActual = propSnap.data() as Record<string, unknown>;

      // Manejo de cambio de slug
      if (slugCambio) {
        const slugNuevoRef = db.collection('slugUnicos').doc(slugLimpio);
        const slugNuevoSnap = await tx.get(slugNuevoRef);
        if (slugNuevoSnap.exists) {
          throw new Error('SLUG_EN_USO');
        }
        // Liberar el slug anterior, reservar el nuevo
        tx.delete(db.collection('slugUnicos').doc(slugAnterior));
        tx.set(slugNuevoRef, { propiedadId: datos.id });
      }

      // Manejo de cambio de código
      if (codigoCambio) {
        const codigoNuevoRef = db.collection('codigoUnicos').doc(codigoLimpio);
        const codigoNuevoSnap = await tx.get(codigoNuevoRef);
        if (codigoNuevoSnap.exists) {
          throw new Error('CODIGO_EN_USO');
        }
        // Liberar el código anterior, reservar el nuevo
        tx.delete(db.collection('codigoUnicos').doc(codigoAnterior));
        tx.set(codigoNuevoRef, { propiedadId: datos.id });
      }

      // Construir el documento actualizado preservando campos del servidor
      const docActualizado: Record<string, unknown> = {
        slug: slugLimpio,
        codigoPropiedad: codigoLimpio,
        titulo: tituloLimpio,
        descripcion: datos.descripcion.trim(),
        tipo: datos.tipo,
        modoNegocio: datos.modoNegocio,
        condicion: datos.condicion,
        destacado: datos.destacado ?? false,
        imagenes: datos.imagenes ?? [],

        // ──────────────────────────────────────────────────────────────────────
        // CRÍTICO: preservar campos controlados por el servidor.
        // NO sobreescribir estadoPublicacion con 'borrador' ni vistas con 0.
        // ──────────────────────────────────────────────────────────────────────
        estadoPublicacion: propActual.estadoPublicacion,
        vistas: propActual.vistas ?? 0,
        creadoEn: propActual.creadoEn,
        actualizadoEn: Timestamp.now(),

        precio: {
          valor: datos.precio.valor,
          moneda: datos.precio.moneda,
          ...(datos.precio.adminMensual !== undefined && { adminMensual: datos.precio.adminMensual }),
          ...(datos.precio.impuestoPredial !== undefined && { impuestoPredial: datos.precio.impuestoPredial }),
          ...(datos.precio.negociable && { negociable: true }),
        },

        ubicacion: {
          pais: datos.ubicacion.pais,
          departamento: datos.ubicacion.departamento,
          municipio: datos.ubicacion.municipio,
          direccion: datos.ubicacion.direccion,
          ...(datos.ubicacion.barrio && { barrio: datos.ubicacion.barrio }),
          ...(datos.ubicacion.codigoPostal && { codigoPostal: datos.ubicacion.codigoPostal }),
          ...(datos.ubicacion.coordenadas && { coordenadas: datos.ubicacion.coordenadas }),
        },

        caracteristicas: {
          habitaciones: datos.caracteristicas.habitaciones,
          banos: datos.caracteristicas.banos,
          metrosCuadrados: datos.caracteristicas.metrosCuadrados,
          parqueaderos: datos.caracteristicas.parqueaderos,
          instalaciones: datos.caracteristicas.instalaciones ?? [],
          ...(datos.caracteristicas.metrosConstruidos !== undefined && { metrosConstruidos: datos.caracteristicas.metrosConstruidos }),
          ...(datos.caracteristicas.pisos !== undefined && { pisos: datos.caracteristicas.pisos }),
          ...(datos.caracteristicas.piso !== undefined && { piso: datos.caracteristicas.piso }),
          ...(datos.caracteristicas.estrato !== undefined && { estrato: datos.caracteristicas.estrato }),
          ...(datos.caracteristicas.antiguedad !== undefined && { antiguedad: datos.caracteristicas.antiguedad }),
          ...(datos.caracteristicas.permiteRentaCorta && { permiteRentaCorta: true }),
        },
      };

      // Campos opcionales de nivel superior
      if (datos.imagenPrincipal) docActualizado.imagenPrincipal = datos.imagenPrincipal;
      if (datos.tourVirtual) docActualizado.tourVirtual = datos.tourVirtual;
      if (datos.videoUrl) docActualizado.videoUrl = datos.videoUrl;
      if (datos.tags && datos.tags.length > 0) docActualizado.tags = datos.tags;

      // SEO
      if (datos.seo) {
        const seoFiltrado: Record<string, unknown> = {};
        if (datos.seo.metaTitle) seoFiltrado.metaTitle = datos.seo.metaTitle;
        if (datos.seo.metaDescription) seoFiltrado.metaDescription = datos.seo.metaDescription;
        if (datos.seo.keywords && datos.seo.keywords.length > 0) seoFiltrado.keywords = datos.seo.keywords;
        if (Object.keys(seoFiltrado).length > 0) docActualizado.seo = seoFiltrado;
      }

      // Agente
      if (datos.agente?.nombre && datos.agente?.telefono) {
        const agenteFiltrado: Record<string, unknown> = {
          nombre: datos.agente.nombre,
          telefono: datos.agente.telefono,
        };
        if (datos.agente.email) agenteFiltrado.email = datos.agente.email;
        if (datos.agente.whatsapp) agenteFiltrado.whatsapp = datos.agente.whatsapp;
        docActualizado.agente = agenteFiltrado;
      }

      tx.set(propiedadRef, docActualizado);
    });

    // 4. Auditoría — fire-and-forget
    registrarAuditoria({
      accion: 'propiedad_editada',
      entidadId: datos.id,
      entidadTipo: 'propiedad',
      adminUid: adminToken.uid,
      descripcion: `Editó propiedad: ${tituloLimpio} (${codigoLimpio})`,
    });

    // 5. Revalidar caché — incluye slug anterior si cambió
    revalidatePath('/admin');
    revalidatePath('/admin/propiedades');
    revalidatePath('/');
    revalidatePath(`/propiedades/${slugLimpio}`);
    if (slugCambio && slugAnterior) {
      revalidatePath(`/propiedades/${slugAnterior}`);
    }

    return { ok: true, data: { id: datos.id, slug: slugLimpio } };

  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'PROPIEDAD_NO_ENCONTRADA') {
        return { ok: false, error: 'La propiedad no existe o fue eliminada.' };
      }
      if (err.message === 'SLUG_EN_USO') {
        return { ok: false, error: 'El slug ya está en uso. Modifícalo antes de guardar.' };
      }
      if (err.message === 'CODIGO_EN_USO') {
        return { ok: false, error: 'El código de propiedad ya está en uso.' };
      }
    }
    console.error('[actualizarPropiedad] Error en transacción Firestore:', err);
    return { ok: false, error: 'Error al guardar los cambios. Inténtalo de nuevo.' };
  }
}
