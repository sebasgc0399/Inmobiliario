import type { Moneda, TipoPropiedad, Estrato, LineaNegocio } from '@/types';

export type OrdenPropiedades = 'recientes' | 'precio_asc' | 'precio_desc' | 'destacados';

export interface FiltrosBusquedaServidor {
  /** Filtra por línea de negocio: inversión o tradicional */
  lineaNegocio?: LineaNegocio;
  tipo?: TipoPropiedad;
  /** Mapea a propiedad.ubicacion.municipio. */
  municipio?: string;
  departamento?: string;
  moneda: Moneda;
  precioMin?: number;
  precioMax?: number;
  /** "2+" → valor 2; filtra caracteristicas.habitaciones >= habitacionesMin */
  habitacionesMin?: number;
  /** Filtro exacto contra caracteristicas.estrato */
  estrato?: Estrato;
  /** Ordenamiento de resultados. Default implícito: 'recientes' */
  orden?: OrdenPropiedades;
}
