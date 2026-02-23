import type { Moneda, ModoNegocio, TipoPropiedad } from '@/types';

export interface FiltrosBusquedaServidor {
  negocio?: ModoNegocio;
  tipo?: TipoPropiedad;
  ciudad?: string;
  moneda: Moneda;
  precioMin?: number;
  precioMax?: number;
}
