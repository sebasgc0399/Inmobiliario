import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const COLECCION_PROPIEDADES = 'propiedades';

const PROPIEDADES_SEED = [
  {
    codigoReferencia: 'TRA-APT-001',
    slug: 'apartamento-poblado-vista-ciudad',
    lineaNegocio: 'tradicional',
    tipoInmueble: 'apartamento',
    estadoPublicacion: 'activo',
    titulo: 'Apartamento en El Poblado con vista abierta',
    descripcion:
      'Apartamento iluminado en piso alto, cerca de comercio y vias principales.',
    precio: 890000000,
    precioNegociable: true,
    municipio: 'Medellin',
    departamento: 'Antioquia',
    barrio: 'El Poblado',
    areaConstruidaM2: 118,
    habitaciones: 3,
    banos: 2,
    parqueaderos: 2,
    estrato: 6,
    destacado: true,
    imagenPrincipal:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80',
    imagenes: [
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80',
    ],
  },
  {
    codigoReferencia: 'TRA-CAS-002',
    slug: 'casa-envigado-jardin-amplio',
    lineaNegocio: 'tradicional',
    tipoInmueble: 'casa',
    estadoPublicacion: 'activo',
    titulo: 'Casa familiar en Envigado con jardin amplio',
    descripcion:
      'Casa en unidad cerrada con espacios generosos y distribucion funcional.',
    precio: 1280000000,
    precioNegociable: false,
    municipio: 'Envigado',
    departamento: 'Antioquia',
    barrio: 'Loma del Esmeraldal',
    areaConstruidaM2: 240,
    areaTerrenoM2: 310,
    habitaciones: 4,
    banos: 4,
    parqueaderos: 2,
    estrato: 5,
    imagenPrincipal:
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1400&q=80',
    imagenes: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
    ],
  },
  {
    codigoReferencia: 'TRA-LOC-003',
    slug: 'local-laureles-avenida-nutibara',
    lineaNegocio: 'tradicional',
    tipoInmueble: 'local',
    estadoPublicacion: 'activo',
    titulo: 'Local comercial en Laureles sobre via principal',
    descripcion:
      'Espacio comercial con alto flujo peatonal y facil acceso en transporte publico.',
    precio: 620000000,
    municipio: 'Medellin',
    departamento: 'Antioquia',
    barrio: 'Laureles',
    areaConstruidaM2: 86,
    imagenPrincipal:
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=80',
    imagenes: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80',
    ],
  },
  {
    codigoReferencia: 'INV-LOT-004',
    slug: 'lote-rionegro-sector-campestre',
    lineaNegocio: 'inversion',
    tipoInmueble: 'lote',
    estadoPublicacion: 'activo',
    titulo: 'Lote en Rionegro para desarrollo de proyecto',
    descripcion:
      'Predio de oportunidad en zona de expansion urbana con acceso por via secundaria.',
    precio: 1750000000,
    municipio: 'Rionegro',
    departamento: 'Antioquia',
    areaTerrenoM2: 2400,
    observacionesPublicas:
      'La informacion tecnica puede ajustarse tras validacion documental.',
    entidadBancaria: 'Entidad financiera A',
    referenciaEntidad: 'INV-REF-004',
    notasInternas: 'Verificar avance de saneamiento juridico.',
    imagenPrincipal:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80',
    imagenes: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1493962853295-0fd70327578a?auto=format&fit=crop&w=1400&q=80',
    ],
  },
  {
    codigoReferencia: 'INV-OFI-005',
    slug: 'oficina-medellin-centro-negocios',
    lineaNegocio: 'inversion',
    tipoInmueble: 'oficina',
    estadoPublicacion: 'activo',
    titulo: 'Oficina en corredor corporativo de Medellin',
    descripcion:
      'Unidad en edificio empresarial con facil conexion a transporte y servicios.',
    precio: 980000000,
    municipio: 'Medellin',
    departamento: 'Antioquia',
    barrio: 'Milla de Oro',
    areaConstruidaM2: 132,
    referenciaEntidad: 'INV-REF-005',
    imagenPrincipal:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80',
    imagenes: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=80',
    ],
  },
  {
    codigoReferencia: 'INV-BOD-006',
    slug: 'bodega-itagui-zona-industrial',
    lineaNegocio: 'inversion',
    tipoInmueble: 'bodega',
    estadoPublicacion: 'activo',
    titulo: 'Bodega en Itagui para operacion logistica',
    descripcion:
      'Inmueble industrial con altura libre y acceso para vehiculos de carga.',
    precio: 2100000000,
    municipio: 'Itagui',
    departamento: 'Antioquia',
    areaConstruidaM2: 540,
    areaTerrenoM2: 680,
    imagenPrincipal:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=80',
    imagenes: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1400&q=80',
    ],
  },
  {
    codigoReferencia: 'TRA-APT-007',
    slug: 'apartamento-belen-unidad-familiar',
    lineaNegocio: 'tradicional',
    tipoInmueble: 'apartamento',
    estadoPublicacion: 'inactivo',
    titulo: 'Apartamento en Belen para familia',
    descripcion:
      'Unidad residencial con buena ventilacion y cercania a colegios y comercio.',
    precio: 420000000,
    municipio: 'Medellin',
    departamento: 'Antioquia',
    barrio: 'Belen',
    areaConstruidaM2: 74,
    habitaciones: 3,
    banos: 2,
    parqueaderos: 1,
    estrato: 4,
    imagenPrincipal:
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=80',
    imagenes: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80',
    ],
  },
  {
    codigoReferencia: 'INV-LOC-008',
    slug: 'local-inversion-bello-renta-comercial',
    lineaNegocio: 'inversion',
    tipoInmueble: 'local',
    estadoPublicacion: 'activo',
    titulo: 'Local en Bello con flujo comercial consolidado',
    descripcion:
      'Oportunidad para inversion orientada a renta comercial en corredor activo.',
    precio: 760000000,
    municipio: 'Bello',
    departamento: 'Antioquia',
    areaConstruidaM2: 112,
    entidadBancaria: 'Entidad financiera B',
    notasInternas: 'Pendiente confirmar valor de canon vigente.',
    imagenPrincipal:
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80',
    imagenes: [
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80',
    ],
  },
];

function obtenerEnvPrivada(nombre) {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(`Falta variable de entorno privada: ${nombre}`);
  }

  return valor;
}

function inicializarFirebaseAdmin() {
  if (getApps().length > 0) {
    return;
  }

  initializeApp({
    credential: cert({
      projectId: obtenerEnvPrivada('FIREBASE_PROJECT_ID'),
      clientEmail: obtenerEnvPrivada('FIREBASE_CLIENT_EMAIL'),
      privateKey: obtenerEnvPrivada('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    }),
  });
}

function limpiarUndefined(objeto) {
  return Object.fromEntries(
    Object.entries(objeto).filter(([, valor]) => valor !== undefined)
  );
}

function extraerSlugDoc(data) {
  if (!data || typeof data !== 'object') return null;
  return typeof data.slug === 'string' ? data.slug : null;
}

function validarUnicidadInterna(propiedades) {
  const slugs = new Set();
  const codigos = new Set();

  for (const propiedad of propiedades) {
    if (slugs.has(propiedad.slug)) {
      throw new Error(`Slug duplicado en mock: ${propiedad.slug}`);
    }

    if (codigos.has(propiedad.codigoReferencia)) {
      throw new Error(
        `Codigo de referencia duplicado en mock: ${propiedad.codigoReferencia}`
      );
    }

    slugs.add(propiedad.slug);
    codigos.add(propiedad.codigoReferencia);
  }
}

async function buscarConflictoCodigo(db, codigoReferencia, slugEsperado) {
  const snapshot = await db
    .collection(COLECCION_PROPIEDADES)
    .where('codigoReferencia', '==', codigoReferencia)
    .limit(5)
    .get();

  if (snapshot.empty) return null;

  for (const doc of snapshot.docs) {
    const slugDoc = extraerSlugDoc(doc.data());
    if (slugDoc !== slugEsperado) {
      return doc.id;
    }
  }

  return null;
}

async function upsertPropiedad(db, propiedad) {
  const snapshotSlug = await db
    .collection(COLECCION_PROPIEDADES)
    .where('slug', '==', propiedad.slug)
    .limit(3)
    .get();

  if (snapshotSlug.size > 1) {
    return {
      estado: 'omitido',
      motivo: `slug duplicado en base de datos (${propiedad.slug})`,
    };
  }

  const conflictoCodigo = await buscarConflictoCodigo(
    db,
    propiedad.codigoReferencia,
    propiedad.slug
  );
  if (conflictoCodigo) {
    return {
      estado: 'omitido',
      motivo: `codigoReferencia ya usado por otro slug (doc: ${conflictoCodigo})`,
    };
  }

  const ahora = new Date();
  const payloadBase = limpiarUndefined({
    ...propiedad,
    actualizadoEn: ahora,
  });

  if (snapshotSlug.size === 1) {
    const doc = snapshotSlug.docs[0];
    await doc.ref.set(payloadBase, { merge: true });
    return { estado: 'actualizado' };
  }

  const docRef = db.collection(COLECCION_PROPIEDADES).doc(propiedad.slug);
  const docPorId = await docRef.get();
  if (docPorId.exists) {
    const slugDoc = extraerSlugDoc(docPorId.data());
    if (slugDoc !== propiedad.slug) {
      return {
        estado: 'omitido',
        motivo: `doc id ocupado por otro slug (${propiedad.slug})`,
      };
    }
  }

  const payloadCreacion = limpiarUndefined({
    ...payloadBase,
    creadoEn: ahora,
  });
  await docRef.set(payloadCreacion);
  return { estado: 'creado' };
}

async function main() {
  validarUnicidadInterna(PROPIEDADES_SEED);
  inicializarFirebaseAdmin();

  const db = getFirestore();
  const resumen = {
    creados: 0,
    actualizados: 0,
    omitidos: 0,
    errores: 0,
  };

  for (const propiedad of PROPIEDADES_SEED) {
    try {
      const resultado = await upsertPropiedad(db, propiedad);

      if (resultado.estado === 'creado') {
        resumen.creados += 1;
        console.log(`[CREADO] ${propiedad.slug}`);
        continue;
      }

      if (resultado.estado === 'actualizado') {
        resumen.actualizados += 1;
        console.log(`[ACTUALIZADO] ${propiedad.slug}`);
        continue;
      }

      resumen.omitidos += 1;
      console.warn(`[OMITIDO] ${propiedad.slug} -> ${resultado.motivo}`);
    } catch (error) {
      resumen.errores += 1;
      console.error(`[ERROR] ${propiedad.slug}`, error);
    }
  }

  console.log('\nResumen seed propiedades');
  console.log(`- creados: ${resumen.creados}`);
  console.log(`- actualizados: ${resumen.actualizados}`);
  console.log(`- omitidos: ${resumen.omitidos}`);
  console.log(`- errores: ${resumen.errores}`);

  if (resumen.errores > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Fallo inesperado en seed de propiedades', error);
  process.exit(1);
});
