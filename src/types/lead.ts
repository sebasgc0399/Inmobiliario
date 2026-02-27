export type EstadoLead = 'nuevo' | 'contactado' | 'calificado' | 'cerrado' | 'descartado';

/** Tres orígenes posibles para un lead */
export type OrigenLead = 'formulario_detalle' | 'formulario_contacto' | 'manual_admin';

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
