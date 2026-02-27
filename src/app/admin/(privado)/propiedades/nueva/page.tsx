import type { Metadata } from 'next';

import FormularioPropiedad from '@/components/admin/formulario-propiedad/FormularioPropiedad';

export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Nueva Propiedad | IsaHouse Admin',
};

export default function NuevaPropiedadPage() {
  return <FormularioPropiedad />;
}
