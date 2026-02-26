import type { Propiedad } from '@/types';

export const propiedadesMock: Propiedad[] = [
  // ── REF-001 · Apartamento · El Poblado, Medellín · Venta COP ─────────────
  {
    slug: 'apartamento-3hab-el-poblado-medellin',
    codigoPropiedad: 'REF-001',
    tipo: 'apartamento',
    modoNegocio: 'venta',
    condicion: 'nuevo',
    estadoPublicacion: 'activo',
    titulo: 'Apartamento moderno con vista a la ciudad en El Poblado',
    descripcion:
      'Espectacular apartamento de 3 habitaciones ubicado en el corazón de El Poblado, con acabados de lujo, cocina integral y amplia sala-comedor con vista panorámica a Medellín.',
    precio: {
      valor: 580_000_000,
      moneda: 'COP',
      adminMensual: 380_000,
      negociable: false,
    },
    ubicacion: {
      pais: 'Colombia',
      departamento: 'Antioquia',
      municipio: 'Medellín',
      barrio: 'El Poblado',
      direccion: 'Calle 10 # 43E-20, El Poblado',
    },
    caracteristicas: {
      habitaciones: 3,
      banos: 2,
      metrosCuadrados: 85,
      metrosConstruidos: 85,
      parqueaderos: 1,
      piso: 8,
      estrato: 6,
      antiguedad: 0,
      instalaciones: ['Piscina', 'Gimnasio', 'Portería 24h', 'Ascensor', 'Terraza común'],
    },
    imagenes: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    ],
    imagenPrincipal:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    destacado: true,
    tags: ['lujo', 'vista ciudad', 'El Poblado'],
    creadoEn: new Date(),
    actualizadoEn: new Date(),
  },

  // ── REF-002 · Casa · Chapinero, Bogotá · Venta COP ───────────────────────
  {
    slug: 'casa-4hab-chapinero-bogota',
    codigoPropiedad: 'REF-002',
    tipo: 'casa',
    modoNegocio: 'venta',
    condicion: 'usado',
    estadoPublicacion: 'activo',
    titulo: 'Casa familiar con jardín en Chapinero Alto',
    descripcion:
      'Hermosa casa de 4 habitaciones en uno de los sectores más exclusivos de Bogotá. Amplio jardín privado, sala de estar doble y zona de servicio independiente.',
    precio: {
      valor: 950_000_000,
      moneda: 'COP',
      impuestoPredial: 4_800_000,
      negociable: true,
    },
    ubicacion: {
      pais: 'Colombia',
      departamento: 'Cundinamarca',
      municipio: 'Bogotá',
      barrio: 'Chapinero Alto',
      direccion: 'Carrera 7 # 68-15, Chapinero',
    },
    caracteristicas: {
      habitaciones: 4,
      banos: 3,
      metrosCuadrados: 280,
      metrosConstruidos: 180,
      parqueaderos: 2,
      pisos: 2,
      estrato: 5,
      antiguedad: 15,
      instalaciones: ['Jardín privado', 'Terraza', 'Cuarto de servicio', 'Chimenea'],
    },
    imagenes: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
    ],
    imagenPrincipal:
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
    tags: ['jardín', 'familiar', 'Chapinero'],
    creadoEn: new Date(),
    actualizadoEn: new Date(),
  },

  // ── REF-003 · Finca · Guatapé, Antioquia · Venta USD ─────────────────────
  {
    slug: 'finca-recreo-guatape-antioquia',
    codigoPropiedad: 'REF-003',
    tipo: 'finca',
    modoNegocio: 'venta',
    condicion: 'usado',
    estadoPublicacion: 'activo',
    titulo: 'Finca de recreo con lago privado en Guatapé',
    descripcion:
      'Imponente finca recreacional con acceso directo al embalse de Guatapé. Cuenta con casa principal de 5 habitaciones, piscina, zona BBQ y muelle privado rodeado de naturaleza.',
    precio: {
      valor: 350_000,
      moneda: 'USD',
      impuestoPredial: 2_400_000,
      negociable: true,
    },
    ubicacion: {
      pais: 'Colombia',
      departamento: 'Antioquia',
      municipio: 'Guatapé',
      barrio: 'Sector El Peñol',
      direccion: 'Vereda El Roble, Guatapé',
    },
    caracteristicas: {
      habitaciones: 5,
      banos: 4,
      metrosCuadrados: 5_000,
      metrosConstruidos: 320,
      parqueaderos: 4,
      pisos: 2,
      antiguedad: 10,
      instalaciones: ['Piscina', 'Zona BBQ', 'Muelle privado', 'Lago', 'Cancha de fútbol'],
      permiteRentaCorta: true,
    },
    imagenes: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    ],
    imagenPrincipal:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    destacado: true,
    tags: ['lago', 'finca', 'Guatapé', 'Airbnb', 'inversión'],
    creadoEn: new Date(),
    actualizadoEn: new Date(),
  },

  // ── REF-004 · Apartaestudio · Laureles, Medellín · Alquiler COP ───────────
  {
    slug: 'apartaestudio-amoblado-laureles-medellin',
    codigoPropiedad: 'REF-004',
    tipo: 'apartaestudio',
    modoNegocio: 'alquiler',
    condicion: 'nuevo',
    estadoPublicacion: 'activo',
    titulo: 'Apartaestudio amoblado en Laureles, ideal para profesionales',
    descripcion:
      'Cómodo y moderno apartaestudio completamente amoblado en el exclusivo barrio Laureles. Cocina integral equipada, baño privado y zona de trabajo. A pasos del metro y restaurantes.',
    precio: {
      valor: 1_800_000,
      moneda: 'COP',
      adminMensual: 120_000,
    },
    ubicacion: {
      pais: 'Colombia',
      departamento: 'Antioquia',
      municipio: 'Medellín',
      barrio: 'Laureles',
      direccion: 'Circular 74 # 35-12, Laureles',
    },
    caracteristicas: {
      habitaciones: 1,
      banos: 1,
      metrosCuadrados: 42,
      metrosConstruidos: 42,
      parqueaderos: 1,
      piso: 4,
      estrato: 4,
      antiguedad: 1,
      instalaciones: ['Amoblado', 'Cocineta integral', 'Vigilancia', 'Ascensor'],
      permiteRentaCorta: true,
    },
    imagenes: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    ],
    imagenPrincipal:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    tags: ['amoblado', 'profesionales', 'Laureles', 'cerca metro'],
    creadoEn: new Date(),
    actualizadoEn: new Date(),
  },

  // ── REF-005 · Casa · Bocagrande, Cartagena · Venta USD ───────────────────
  {
    slug: 'casa-lujo-bocagrande-cartagena',
    codigoPropiedad: 'REF-005',
    tipo: 'casa',
    modoNegocio: 'venta',
    condicion: 'nuevo',
    estadoPublicacion: 'activo',
    titulo: 'Casa de lujo con vista al mar en Bocagrande, Cartagena',
    descripcion:
      'Residencia de lujo en primera línea de playa en Bocagrande. Acabados europeos, piscina privada, terraza con vista al Mar Caribe y acceso directo a la playa. Ideal para inversión turística.',
    precio: {
      valor: 420_000,
      moneda: 'USD',
      impuestoPredial: 6_000_000,
      negociable: false,
    },
    ubicacion: {
      pais: 'Colombia',
      departamento: 'Bolívar',
      municipio: 'Cartagena',
      barrio: 'Bocagrande',
      direccion: 'Avenida 1 # 6-32, Bocagrande',
    },
    caracteristicas: {
      habitaciones: 4,
      banos: 4,
      metrosCuadrados: 320,
      metrosConstruidos: 280,
      parqueaderos: 2,
      pisos: 2,
      antiguedad: 0,
      instalaciones: ['Piscina privada', 'Vista al mar', 'Jacuzzi', 'Terraza', 'Acceso a playa'],
      permiteRentaCorta: true,
    },
    imagenes: [
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80',
    ],
    imagenPrincipal:
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80',
    destacado: true,
    tags: ['playa', 'lujo', 'Cartagena', 'inversión turística'],
    creadoEn: new Date(),
    actualizadoEn: new Date(),
  },

  // ── REF-006 · Apartamento · Usaquén, Bogotá · Alquiler COP ───────────────
  {
    slug: 'apartamento-2hab-usaquen-bogota',
    codigoPropiedad: 'REF-006',
    tipo: 'apartamento',
    modoNegocio: 'alquiler',
    condicion: 'usado',
    estadoPublicacion: 'activo',
    titulo: 'Apartamento 2 habitaciones en Usaquén, Bogotá',
    descripcion:
      'Luminoso apartamento de 2 habitaciones en el tradicional barrio Usaquén. A pocos pasos de restaurantes boutique, cafés y el mercado de las pulgas. Excelente ubicación y conectividad.',
    precio: {
      valor: 2_800_000,
      moneda: 'COP',
      adminMensual: 250_000,
    },
    ubicacion: {
      pais: 'Colombia',
      departamento: 'Cundinamarca',
      municipio: 'Bogotá',
      barrio: 'Usaquén',
      direccion: 'Calle 119 # 6-20, Usaquén',
    },
    caracteristicas: {
      habitaciones: 2,
      banos: 2,
      metrosCuadrados: 65,
      metrosConstruidos: 65,
      parqueaderos: 1,
      piso: 3,
      estrato: 5,
      antiguedad: 8,
      instalaciones: ['Portería 24h', 'Parqueadero cubierto', 'Zona BBQ', 'Salón comunal'],
    },
    imagenes: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    ],
    imagenPrincipal:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    tags: ['Usaquén', 'céntrico', 'cerca transporte'],
    creadoEn: new Date(),
    actualizadoEn: new Date(),
  },
];
