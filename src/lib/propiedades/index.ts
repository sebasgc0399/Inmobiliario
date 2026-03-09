export { documentoAPropiedad, propiedadADocumento } from './conversor';
export type { PropiedadFirestore } from './conversor';
export { sanitizarPropiedad, sanitizarPropiedades } from './sanitizar';
export {
  obtenerPropiedadesPublicas,
  obtenerPropiedadesPublicasPorLineaNegocio,
  obtenerPropiedadPublicaPorSlug,
  obtenerPropiedadesDestacadas,
} from './consultas';
