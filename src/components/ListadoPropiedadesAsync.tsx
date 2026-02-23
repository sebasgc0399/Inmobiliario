import { obtenerPropiedadesPublicas } from '@/lib/propiedades/obtenerPropiedadesPublicas';
import ListadoPropiedades from '@/components/ListadoPropiedades';
import type { FiltrosBusquedaServidor, Moneda } from '@/types';

interface Props {
  filtros: FiltrosBusquedaServidor;
  monedaUsuario: Moneda;
}

export default async function ListadoPropiedadesAsync({ filtros, monedaUsuario }: Props) {
  const propiedades = await obtenerPropiedadesPublicas(filtros);
  return <ListadoPropiedades propiedades={propiedades} monedaUsuario={monedaUsuario} />;
}
