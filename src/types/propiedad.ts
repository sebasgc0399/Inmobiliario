// --- Tipos primitivos ---

export type LineaNegocio = 'inversion' | 'tradicional';

export type TipoInmueble =
  | 'apartamento'
  | 'casa'
  | 'local'
  | 'bodega'
  | 'lote'
  | 'otro';

export type EstadoPublicacion = 'borrador' | 'activo' | 'inactivo' | 'vendido';

export type Estrato = 1 | 2 | 3 | 4 | 5 | 6;

// --- Contrato canónico del dominio ---

export interface Propiedad {
  // Identificadores
  id: string;
  slug: string;
  codigoReferencia: string;

  // Discriminador
  lineaNegocio: LineaNegocio;

  // Clasificación
  tipoInmueble: TipoInmueble;
  estadoPublicacion: EstadoPublicacion;

  // Contenido
  titulo: string;
  descripcion?: string;
  observacionesPublicas?: string;

  // Precio (COP, moneda única MVP)
  precio: number;
  precioNegociable?: boolean;

  // Ubicación (solo municipio obligatorio)
  municipio: string;
  departamento?: string;
  barrio?: string;
  direccion?: string;

  // Características físicas (TODAS opcionales)
  areaConstruidaM2?: number;
  areaTerrenoM2?: number;
  habitaciones?: number;
  banos?: number;
  parqueaderos?: number;
  estrato?: Estrato;

  // Media
  imagenes: string[];
  imagenPrincipal?: string;

  // SENSIBLES — jamás al frontend público
  entidadBancaria?: string;
  referenciaEntidad?: string;
  porcentajeParticipacion?: number;
  notasInternas?: string;

  // Timestamps
  creadoEn: Date;
  actualizadoEn: Date;

  // Extras
  destacado?: boolean;
}

// --- Campos sensibles (runtime + compile-time) ---

export const CAMPOS_SENSIBLES = [
  'entidadBancaria',
  'referenciaEntidad',
  'porcentajeParticipacion',
  'notasInternas',
] as const;

export type CampoSensible = (typeof CAMPOS_SENSIBLES)[number];

// --- Variantes derivadas ---

export type PropiedadStorage = Propiedad;

export type PropiedadPublica = Omit<Propiedad, CampoSensible>;

export type PropiedadAdmin = Propiedad;
