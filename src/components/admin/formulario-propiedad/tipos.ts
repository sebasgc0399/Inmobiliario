/**
 * Tipos compartidos del formulario de propiedades (Fase 3).
 * Sin directiva 'use client' — importable desde Server y Client Components.
 */

import type { TipoPropiedad, ModoNegocio, CondicionInmueble, Moneda } from '@/types';

/**
 * Contrato de React Hook Form para el formulario de crear/editar propiedad.
 *
 * Los campos numéricos opcionales del dominio (metrosConstruidos, pisos, etc.)
 * se representan como `string` vacío para compatibilidad con inputs HTML.
 * Se parsean a `number | undefined` en `transformarFormADatos()` antes de
 * llamar la Server Action.
 *
 * Los arrays (tags, instalaciones, keywords) se gestionan mediante `setValue`
 * de RHF — no tienen un input HTML nativo que los represente.
 */
export interface CamposFormulario {
  // ── Básicos ───────────────────────────────────────────────────────────────
  titulo: string;
  descripcion: string;
  slug: string;
  codigoPropiedad: string;
  tipo: TipoPropiedad;
  modoNegocio: ModoNegocio;
  condicion: CondicionInmueble;
  destacado: boolean;
  tourVirtual: string;    // string vacío si no hay
  videoUrl: string;       // string vacío si no hay
  tags: string[];         // gestionado vía setValue

  // ── Agente (todos opcionales) ─────────────────────────────────────────────
  agente: {
    nombre: string;
    telefono: string;
    email: string;
    whatsapp: string;
  };

  // ── Ubicación ─────────────────────────────────────────────────────────────
  ubicacion: {
    pais: string;
    departamento: string;
    municipio: string;
    barrio: string;       // string vacío si no hay
    direccion: string;
    codigoPostal: string; // string vacío si no hay
    latitud: string;      // string para el input, se parsea al enviar
    longitud: string;     // string para el input, se parsea al enviar
  };

  // ── Características ───────────────────────────────────────────────────────
  caracteristicas: {
    habitaciones: number;
    banos: number;
    metrosCuadrados: number;
    metrosConstruidos: string; // string vacío si no hay
    parqueaderos: number;
    pisos: string;             // string vacío si no hay
    piso: string;              // string vacío si no hay
    estrato: string;           // '1'–'6' o '' si no aplica
    antiguedad: string;        // string vacío si no hay
    permiteRentaCorta: boolean;
    instalaciones: string[];   // gestionado vía setValue
  };

  // ── Precio ────────────────────────────────────────────────────────────────
  precio: {
    valor: number;
    moneda: Moneda;
    adminMensual: string;    // string vacío si no hay
    impuestoPredial: string; // string vacío si no hay
    negociable: boolean;
  };

  // ── SEO ───────────────────────────────────────────────────────────────────
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[]; // gestionado vía setValue
  };
}
