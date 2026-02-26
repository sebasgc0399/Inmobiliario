// ─────────────────────────────────────────────────────────────────────────────
// Tipos primitivos / enums
// ─────────────────────────────────────────────────────────────────────────────

/** Categoría del inmueble */
export type TipoPropiedad =
  | 'casa'
  | 'apartamento'
  | 'apartaestudio'
  | 'finca'
  | 'local'
  | 'oficina'
  | 'terreno'
  | 'bodega';

/** Finalidad del negocio */
export type ModoNegocio = 'venta' | 'alquiler' | 'venta_alquiler';

/** Ciclo de vida de la publicación */
export type EstadoPublicacion =
  | 'activo'
  | 'inactivo'
  | 'vendido'
  | 'arrendado'
  | 'borrador';

/** ISO 4217 — monedas soportadas */
export type Moneda = 'COP' | 'USD' | 'EUR';

/** Estado físico del inmueble */
export type CondicionInmueble = 'nuevo' | 'usado' | 'sobre_planos';

/** Estrato socioeconómico colombiano (1–6) */
export type Estrato = 1 | 2 | 3 | 4 | 5 | 6;

// ─────────────────────────────────────────────────────────────────────────────
// Sub-interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface Coordenadas {
  latitud: number;
  longitud: number;
}

export interface Ubicacion {
  pais: string;
  /** Departamento / estado / provincia */
  departamento: string;
  ciudad: string;
  barrio?: string;
  direccion: string;
  codigoPostal?: string;
  coordenadas?: Coordenadas;
}

export interface Precio {
  /** Valor de venta o canon de arrendamiento */
  valor: number;
  /** Moneda del precio principal */
  moneda: Moneda;
  /** Cuota de administración mensual */
  adminMensual?: number;
  /** Impuesto predial anual (útil para cálculo de rentabilidad) */
  impuestoPredial?: number;
  negociable?: boolean;
}

export interface Caracteristicas {
  habitaciones: number;
  banos: number;
  /** Área total del lote / terreno en m² */
  metrosCuadrados: number;
  /** Área construida en m² */
  metrosConstruidos?: number;
  parqueaderos: number;
  /** Número de pisos de la construcción */
  pisos?: number;
  /** Piso en el que se ubica la unidad (para apartamentos) */
  piso?: number;
  /** Estrato socioeconómico colombiano */
  estrato?: Estrato;
  /** Antigüedad del inmueble en años */
  antiguedad?: number;
  /** Lista dinámica de instalaciones: ['Piscina', 'Gimnasio', 'Ascensor', …] */
  instalaciones: string[];
  /** Apto para renta corta tipo Airbnb */
  permiteRentaCorta?: boolean;
}

export interface SEOMetadata {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

export interface Agente {
  nombre: string;
  /** Incluir indicativo internacional, ej: +573001234567 */
  telefono: string;
  email?: string;
  /** Número de WhatsApp con indicativo, ej: +573001234567 */
  whatsapp?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Interfaz principal
// ─────────────────────────────────────────────────────────────────────────────

export interface Propiedad {
  // ── Identificadores ────────────────────────────────────────────────────────
  /** ID del documento en Firestore (ausente antes de la primera escritura) */
  id?: string;
  /** Slug amigable para la URL, ej: 'casa-3hab-chapinero-bogota' */
  slug: string;
  /** Código de referencia interno, ej: 'REF-045' */
  codigoPropiedad: string;

  // ── Clasificación ──────────────────────────────────────────────────────────
  tipo: TipoPropiedad;
  modoNegocio: ModoNegocio;
  /** Estado físico del inmueble: nuevo / usado / sobre_planos */
  condicion: CondicionInmueble;
  estadoPublicacion: EstadoPublicacion;

  // ── Contenido ──────────────────────────────────────────────────────────────
  titulo: string;
  descripcion: string;

  // ── Económico ──────────────────────────────────────────────────────────────
  precio: Precio;

  // ── Localización ───────────────────────────────────────────────────────────
  ubicacion: Ubicacion;

  // ── Características físicas ────────────────────────────────────────────────
  caracteristicas: Caracteristicas;

  // ── Media ──────────────────────────────────────────────────────────────────
  /** Array de URLs de imágenes (Firebase Storage o CDN) */
  imagenes: string[];
  /** URL de la imagen principal para listing cards y Open Graph */
  imagenPrincipal?: string;
  /** URL del tour virtual 360° */
  tourVirtual?: string;
  /** URL del video en YouTube */
  videoUrl?: string;

  // ── SEO (alimenta generateMetadata de Next.js App Router) ──────────────────
  seo?: SEOMetadata;

  // ── Contacto ───────────────────────────────────────────────────────────────
  agente?: Agente;

  // ── Timestamps (Date puro — conversión Timestamp↔Date en withConverter) ────
  creadoEn: Date;
  actualizadoEn: Date;
  publicadoEn?: Date;

  // ── Extras ─────────────────────────────────────────────────────────────────
  /** Marcar como inmueble destacado en la home o resultados */
  destacado?: boolean;
  /** Contador de vistas de la página de detalle */
  vistas?: number;
  /** Etiquetas de búsqueda libre, ej: ['cerca al metro', 'vista al mar'] */
  tags?: string[];
}
