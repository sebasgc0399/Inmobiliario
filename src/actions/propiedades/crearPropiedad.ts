'use server';

import 'server-only';

import type { DecodedIdToken } from 'firebase-admin/auth';
import { Timestamp } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

import { obtenerAdminDb } from '@/lib/firebase/admin';
import { validarSesionAdmin } from '@/lib/admin/validarSesionAdmin';
import { registrarAuditoria } from '@/lib/admin/registrarAuditoria';
import type { ResultadoAccion, TipoPropiedad, ModoNegocio, CondicionInmueble, Moneda, Estrato } from '@/types';

// ── Tipo de entrada ───────────────────────────────────────────────────────────
// Excluye los campos que el servidor controla: id, timestamps, estadoPublicacion, vistas.

export interface DatosCrearPropiedad {
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

// ── Server Action ─────────────────────────────────────────────────────────────

export async function crearPropiedad(
  datos: DatosCrearPropiedad,
): Promise<ResultadoAccion<{ id: string; slug: string }>> {

  // 1. Autenticación y autorización
  let adminToken: DecodedIdToken;
  try {
    adminToken = await validarSesionAdmin();
  } catch {
    return { ok: false, error: 'No autorizado.' };
  }

  // 2. Validación defensiva del lado servidor
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

  // 3. Transacción atómica en Firestore
  const db = obtenerAdminDb();
  const propiedadRef = db.collection('propiedades').doc(); // ID auto-generado
  const slugRef = db.collection('slugUnicos').doc(slugLimpio);
  const codigoRef = db.collection('codigoUnicos').doc(codigoLimpio);

  try {
    await db.runTransaction(async (tx) => {
      // Verificar unicidad del slug
      const slugSnap = await tx.get(slugRef);
      if (slugSnap.exists) {
        throw new Error('SLUG_EN_USO');
      }

      // Verificar unicidad del código
      const codigoSnap = await tx.get(codigoRef);
      if (codigoSnap.exists) {
        throw new Error('CODIGO_EN_USO');
      }

      const ahora = Timestamp.now();

      // Construir el documento con spread condicional (nunca escribir null explícito)
      const docPropiedad: Record<string, unknown> = {
        slug: slugLimpio,
        codigoPropiedad: codigoLimpio,
        titulo: tituloLimpio,
        descripcion: datos.descripcion.trim(),
        tipo: datos.tipo,
        modoNegocio: datos.modoNegocio,
        condicion: datos.condicion,
        estadoPublicacion: 'borrador', // Siempre borrador al crear
        destacado: datos.destacado ?? false,
        imagenes: datos.imagenes ?? [],
        vistas: 0,                     // Siempre 0 al crear
        creadoEn: ahora,
        actualizadoEn: ahora,

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
      if (datos.imagenPrincipal) docPropiedad.imagenPrincipal = datos.imagenPrincipal;
      if (datos.tourVirtual) docPropiedad.tourVirtual = datos.tourVirtual;
      if (datos.videoUrl) docPropiedad.videoUrl = datos.videoUrl;
      if (datos.tags && datos.tags.length > 0) docPropiedad.tags = datos.tags;

      // SEO — solo si al menos un campo tiene valor
      if (datos.seo) {
        const seoFiltrado: Record<string, unknown> = {};
        if (datos.seo.metaTitle) seoFiltrado.metaTitle = datos.seo.metaTitle;
        if (datos.seo.metaDescription) seoFiltrado.metaDescription = datos.seo.metaDescription;
        if (datos.seo.keywords && datos.seo.keywords.length > 0) seoFiltrado.keywords = datos.seo.keywords;
        if (Object.keys(seoFiltrado).length > 0) docPropiedad.seo = seoFiltrado;
      }

      // Agente — solo si al menos nombre y teléfono tienen valor
      if (datos.agente?.nombre && datos.agente?.telefono) {
        const agenteFiltrado: Record<string, unknown> = {
          nombre: datos.agente.nombre,
          telefono: datos.agente.telefono,
        };
        if (datos.agente.email) agenteFiltrado.email = datos.agente.email;
        if (datos.agente.whatsapp) agenteFiltrado.whatsapp = datos.agente.whatsapp;
        docPropiedad.agente = agenteFiltrado;
      }

      // Escrituras atómicas dentro de la transacción
      tx.set(propiedadRef, docPropiedad);
      tx.set(slugRef, { propiedadId: propiedadRef.id });
      tx.set(codigoRef, { propiedadId: propiedadRef.id });
    });

    // 4. Auditoría — fire-and-forget (sin await)
    registrarAuditoria({
      accion: 'propiedad_creada',
      entidadId: propiedadRef.id,
      entidadTipo: 'propiedad',
      adminUid: adminToken.uid,
      descripcion: `Creó propiedad: ${tituloLimpio} (${codigoLimpio})`,
    });

    // 5. Revalidar caché de rutas afectadas
    revalidatePath('/admin');
    revalidatePath('/admin/propiedades');
    revalidatePath('/');
    revalidatePath(`/propiedades/${slugLimpio}`);

    return { ok: true, data: { id: propiedadRef.id, slug: slugLimpio } };

  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'SLUG_EN_USO') {
        return { ok: false, error: 'El slug ya está en uso. Modifícalo antes de guardar.' };
      }
      if (err.message === 'CODIGO_EN_USO') {
        return { ok: false, error: 'El código de propiedad ya está en uso.' };
      }
    }
    console.error('[crearPropiedad] Error en transacción Firestore:', err);
    return { ok: false, error: 'Error al guardar la propiedad. Inténtalo de nuevo.' };
  }
}
