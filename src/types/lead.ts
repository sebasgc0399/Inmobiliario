export type OrigenLead = 'formulario_detalle' | 'formulario_contacto';

export interface Lead {
  id?: string;
  /** Slug de la propiedad a la que corresponde el lead */
  slugPropiedad: string;
  /** Código de referencia denormalizado para filtrar en admin sin joins */
  codigoPropiedad: string;
  nombre: string;
  telefono: string;
  mensaje: string;
  origen: OrigenLead;
  creadoEn: Date;
  estado: 'nuevo' | 'contactado' | 'cerrado';
}

/** Campos que rellena el usuario en el formulario de contacto */
export interface CamposFormularioContacto {
  nombre: string;
  telefono: string;
  mensaje: string;
}
