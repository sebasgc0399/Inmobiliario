import type { Moneda } from './propiedad';

export type EstadoLead = 'nuevo' | 'contactado' | 'calificado' | 'cerrado' | 'descartado';

/** Orígenes posibles para un lead */
export type OrigenLead =
  | 'formulario_detalle'
  | 'formulario_contacto'
  | 'formulario_oferta'
  | 'manual_admin';

/** Estado del proceso de oferta con el banco */
export type EstadoOferta =
  | 'pendiente'
  | 'presentada'
  | 'aprobada'
  | 'rechazada'
  | 'contraoferta';

/** Datos de oferta asociados a un lead de inversión */
export interface DatosOferta {
  montoOfertado: number;
  monedaOferta: Moneda;
  estadoOferta: EstadoOferta;
  /** Monto de contraoferta del banco, si aplica */
  montoContraoferta?: number;
}

export interface Lead {
  id?: string;
  nombre: string;
  telefono: string;
  /** Opcional: el formulario público no lo pide; el admin sí puede registrarlo */
  email?: string;
  mensaje: string;
  /** Ausente cuando el lead proviene del formulario general /contacto */
  slugPropiedad?: string;
  /** Ausente cuando el lead proviene del formulario general /contacto */
  codigoPropiedad?: string;
  estado: EstadoLead;
  origen: OrigenLead;
  /** Solo presente en leads de tipo oferta de inversión */
  oferta?: DatosOferta;
  /** Notas internas del administrador */
  notas?: string;
  creadoEn: Date;
  actualizadoEn: Date;
}

/** Campos que rellena el usuario en los formularios públicos de contacto */
export interface CamposFormularioContacto {
  nombre: string;
  telefono: string;
  mensaje: string;
}

/** Campos que rellena el usuario en el formulario de oferta de inversión */
export interface CamposFormularioOferta {
  nombre: string;
  telefono: string;
  email: string;
  montoOfertado: number;
  monedaOferta: Moneda;
  mensaje: string;
  aceptaTerminos: boolean;
}
