import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { obtenerPropiedadAdmin } from '@/lib/propiedades/obtenerPropiedadAdmin';
import FormularioPropiedad from '@/components/admin/formulario-propiedad/FormularioPropiedad';
import type { CamposFormulario } from '@/components/admin/formulario-propiedad/tipos';
import type { Propiedad } from '@/types';

export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Editar Propiedad | IsaHouse Admin',
};

// ── Mapeo inverso: Propiedad (dominio) → CamposFormulario (formulario) ────────
//
// Los campos numéricos opcionales del dominio se convierten a string vacío
// para ser compatibles con los <input type="number"> que React Hook Form
// maneja como strings cuando el campo está vacío.
//
// Los arrays opcionales se normalizan a [] cuando son undefined.
// Los strings opcionales se normalizan a '' cuando son undefined.

function propiedadACamposFormulario(p: Propiedad): CamposFormulario {
  return {
    // ── Básicos ────────────────────────────────────────────────────────────
    titulo: p.titulo,
    descripcion: p.descripcion,
    slug: p.slug,
    codigoPropiedad: p.codigoPropiedad,
    tipo: p.tipo,
    modoNegocio: p.modoNegocio,
    condicion: p.condicion,
    destacado: p.destacado ?? false,
    tourVirtual: p.tourVirtual ?? '',
    videoUrl: p.videoUrl ?? '',
    tags: p.tags ?? [],

    // ── Agente ─────────────────────────────────────────────────────────────
    agente: {
      nombre: p.agente?.nombre ?? '',
      telefono: p.agente?.telefono ?? '',
      email: p.agente?.email ?? '',
      whatsapp: p.agente?.whatsapp ?? '',
    },

    // ── Ubicación ──────────────────────────────────────────────────────────
    ubicacion: {
      pais: p.ubicacion.pais,
      departamento: p.ubicacion.departamento,
      municipio: p.ubicacion.municipio,
      barrio: p.ubicacion.barrio ?? '',
      direccion: p.ubicacion.direccion,
      codigoPostal: p.ubicacion.codigoPostal ?? '',
      // Las coordenadas se almacenan como numbers; el form las necesita como strings
      latitud: p.ubicacion.coordenadas?.latitud?.toString() ?? '',
      longitud: p.ubicacion.coordenadas?.longitud?.toString() ?? '',
    },

    // ── Características ────────────────────────────────────────────────────
    // Los campos obligatorios (number) se pasan directamente.
    // Los opcionales (number | undefined) se convierten a string para compatibilidad con input.
    caracteristicas: {
      habitaciones: p.caracteristicas.habitaciones,
      banos: p.caracteristicas.banos,
      metrosCuadrados: p.caracteristicas.metrosCuadrados,
      parqueaderos: p.caracteristicas.parqueaderos,
      metrosConstruidos: p.caracteristicas.metrosConstruidos?.toString() ?? '',
      pisos: p.caracteristicas.pisos?.toString() ?? '',
      piso: p.caracteristicas.piso?.toString() ?? '',
      estrato: p.caracteristicas.estrato?.toString() ?? '',
      antiguedad: p.caracteristicas.antiguedad?.toString() ?? '',
      permiteRentaCorta: p.caracteristicas.permiteRentaCorta ?? false,
      instalaciones: p.caracteristicas.instalaciones ?? [],
    },

    // ── Precio ─────────────────────────────────────────────────────────────
    precio: {
      valor: p.precio.valor,
      moneda: p.precio.moneda,
      adminMensual: p.precio.adminMensual?.toString() ?? '',
      impuestoPredial: p.precio.impuestoPredial?.toString() ?? '',
      negociable: p.precio.negociable ?? false,
    },

    // ── SEO ────────────────────────────────────────────────────────────────
    seo: {
      metaTitle: p.seo?.metaTitle ?? '',
      metaDescription: p.seo?.metaDescription ?? '',
      keywords: p.seo?.keywords ?? [],
    },
  };
}

// ── Página ─────────────────────────────────────────────────────────────────────

interface Params {
  params: Promise<{ id: string }>;
}

export default async function EditarPropiedadPage({ params }: Params) {
  const { id } = await params;

  const propiedad = await obtenerPropiedadAdmin(id);

  if (!propiedad) {
    notFound();
  }

  const valoresIniciales = propiedadACamposFormulario(propiedad);

  return (
    <FormularioPropiedad
      modo="editar"
      propiedadId={propiedad.id}
      slugOriginal={propiedad.slug}
      codigoOriginal={propiedad.codigoPropiedad}
      valoresIniciales={valoresIniciales}
      imagenesIniciales={propiedad.imagenes}
      imagenPrincipalInicial={propiedad.imagenPrincipal ?? ''}
    />
  );
}
