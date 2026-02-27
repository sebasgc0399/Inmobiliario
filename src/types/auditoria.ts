export type TipoAccionAdmin =
  | 'propiedad_creada'
  | 'propiedad_editada'
  | 'propiedad_eliminada'
  | 'propiedad_publicada'
  | 'propiedad_archivada'
  | 'lead_creado'
  | 'lead_actualizado';

export interface EventoAuditoriaAdmin {
  id?: string;
  accion: TipoAccionAdmin;
  /** ID del documento de Firestore afectado */
  entidadId: string;
  entidadTipo: 'propiedad' | 'lead';
  adminUid: string;
  /** Descripción legible. Ej: "Publicó: Casa en El Poblado (REF-045)" */
  descripcion: string;
  creadoEn: Date;
}
