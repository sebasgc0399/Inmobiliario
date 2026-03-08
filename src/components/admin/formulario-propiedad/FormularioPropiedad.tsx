'use client';

import { useState, useTransition } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { crearPropiedad } from '@/actions/propiedades/crearPropiedad';
import type { DatosCrearPropiedad } from '@/actions/propiedades/crearPropiedad';
import { actualizarPropiedad } from '@/actions/propiedades/actualizarPropiedad';
import type { DatosActualizarPropiedad } from '@/actions/propiedades/actualizarPropiedad';
import type { Estrato, TipoPropiedad } from '@/types';

import SeccionBasica from './SeccionBasica';
import SeccionUbicacion from './SeccionUbicacion';
import SeccionCaracteristicas from './SeccionCaracteristicas';
import SeccionPrecio from './SeccionPrecio';
import SeccionSEO from './SeccionSEO';
import SeccionInversion from './SeccionInversion';
import GaleriaImagenes from './GaleriaImagenes';
import type { CamposFormulario } from './tipos';

// ── Estado del toast ───────────────────────────────────────────────────────

interface EstadoToast {
  visible: boolean;
  tipo: 'exito' | 'error';
  mensaje: string;
}

// ── Props ──────────────────────────────────────────────────────────────────

interface Props {
  modo?: 'crear' | 'editar';
  propiedadId?: string;
  slugOriginal?: string;
  codigoOriginal?: string;
  valoresIniciales?: CamposFormulario;
  imagenesIniciales?: string[];
  imagenPrincipalInicial?: string;
}

const TIPOS_RESIDENCIALES: TipoPropiedad[] = [
  'casa',
  'apartamento',
  'apartaestudio',
  'finca',
];

// ── Valores iniciales del formulario ──────────────────────────────────────

const VALORES_INICIALES: CamposFormulario = {
  titulo: '',
  descripcion: '',
  slug: '',
  codigoPropiedad: '',
  tipo: 'apartamento',
  lineaNegocio: 'tradicional',
  condicion: 'usado',
  destacado: false,
  tourVirtual: '',
  videoUrl: '',
  tags: [],
  agente: { nombre: '', telefono: '', email: '', whatsapp: '' },
  ubicacion: {
    pais: 'Colombia',
    departamento: '',
    municipio: '',
    barrio: '',
    direccion: '',
    codigoPostal: '',
    latitud: '',
    longitud: '',
  },
  caracteristicas: {
    habitaciones: '',
    banos: '',
    metrosCuadrados: 0,
    metrosConstruidos: '',
    parqueaderos: '',
    pisos: '',
    piso: '',
    estrato: '',
    antiguedad: '',
    permiteRentaCorta: false,
    instalaciones: [],
  },
  precio: {
    valor: 0,
    moneda: 'COP',
    adminMensual: '',
    impuestoPredial: '',
    negociable: false,
  },
  seo: { metaTitle: '', metaDescription: '', keywords: [] },
  inversion: {
    entidadBancaria: '',
    referenciaEntidad: '',
    precioListadoBanco: '',
    documentosRequeridos: [],
    notasInternas: '',
    observacionesBanco: '',
    aceptaContraoferta: true,
  },
};

// ── Helper: transformar CamposFormulario → datos para la Server Action ─────
// Convierte strings opcionales a number | undefined y excluye campos vacíos.

function parsearNumero(val: string): number | undefined {
  if (!val || val.trim() === '') return undefined;
  const n = parseFloat(val);
  return isNaN(n) ? undefined : n;
}

function parsearEntero(val: string): number | undefined {
  if (!val || val.trim() === '') return undefined;
  const n = parseInt(val, 10);
  return isNaN(n) ? undefined : n;
}

function esNumeroValido(valor: number | ''): valor is number {
  return typeof valor === 'number' && !Number.isNaN(valor);
}

function transformarFormADatos(
  campos: CamposFormulario,
  imagenes: string[],
  imagenPrincipal: string,
): Omit<DatosCrearPropiedad, never> {
  const esInversion = campos.lineaNegocio === 'inversion';
  const esTipoResidencial = TIPOS_RESIDENCIALES.includes(campos.tipo);
  const caracteristicas: DatosCrearPropiedad['caracteristicas'] = {
    metrosCuadrados: campos.caracteristicas.metrosCuadrados,
    instalaciones: esInversion ? [] : campos.caracteristicas.instalaciones,
    ...(campos.caracteristicas.metrosConstruidos && {
      metrosConstruidos: parsearNumero(campos.caracteristicas.metrosConstruidos),
    }),
  };

  if (!esInversion) {
    if (esTipoResidencial && esNumeroValido(campos.caracteristicas.habitaciones)) {
      caracteristicas.habitaciones = campos.caracteristicas.habitaciones;
    }

    if (esNumeroValido(campos.caracteristicas.banos)) {
      caracteristicas.banos = campos.caracteristicas.banos;
    }

    if (esNumeroValido(campos.caracteristicas.parqueaderos)) {
      caracteristicas.parqueaderos = campos.caracteristicas.parqueaderos;
    }

    if (campos.caracteristicas.pisos) {
      caracteristicas.pisos = parsearEntero(campos.caracteristicas.pisos);
    }

    if (campos.caracteristicas.piso) {
      caracteristicas.piso = parsearEntero(campos.caracteristicas.piso);
    }

    if (esTipoResidencial && campos.caracteristicas.estrato) {
      caracteristicas.estrato = parseInt(campos.caracteristicas.estrato, 10) as Estrato;
    }

    if (campos.caracteristicas.antiguedad) {
      caracteristicas.antiguedad = parsearEntero(campos.caracteristicas.antiguedad);
    }

    if (esTipoResidencial && campos.caracteristicas.permiteRentaCorta) {
      caracteristicas.permiteRentaCorta = true;
    }
  }

  const datos: DatosCrearPropiedad = {
    slug: campos.slug,
    codigoPropiedad: campos.codigoPropiedad,
    titulo: campos.titulo,
    descripcion: campos.descripcion,
    tipo: campos.tipo,
    modoNegocio: 'venta',
    lineaNegocio: campos.lineaNegocio,
    condicion: campos.condicion,
    destacado: campos.destacado,

    precio: {
      valor: campos.precio.valor,
      moneda: campos.precio.moneda,
      ...(campos.precio.adminMensual && {
        adminMensual: parsearNumero(campos.precio.adminMensual),
      }),
      ...(campos.precio.impuestoPredial && {
        impuestoPredial: parsearNumero(campos.precio.impuestoPredial),
      }),
      ...(campos.precio.negociable && { negociable: true }),
    },

    ubicacion: {
      pais: campos.ubicacion.pais,
      departamento: campos.ubicacion.departamento,
      municipio: campos.ubicacion.municipio,
      direccion: campos.ubicacion.direccion,
      ...(campos.ubicacion.barrio && { barrio: campos.ubicacion.barrio }),
      ...(campos.ubicacion.codigoPostal && { codigoPostal: campos.ubicacion.codigoPostal }),
      ...(campos.ubicacion.latitud && campos.ubicacion.longitud && {
        coordenadas: {
          latitud: parseFloat(campos.ubicacion.latitud),
          longitud: parseFloat(campos.ubicacion.longitud),
        },
      }),
    },

    caracteristicas,

    imagenes,
    ...(imagenPrincipal && { imagenPrincipal }),

    ...(campos.tourVirtual && { tourVirtual: campos.tourVirtual }),
    ...(campos.videoUrl && { videoUrl: campos.videoUrl }),
    ...(campos.tags.length > 0 && { tags: campos.tags }),
  };

  // SEO — solo si hay al menos un campo con valor
  const hayContenidoSEO =
    campos.seo.metaTitle ||
    campos.seo.metaDescription ||
    campos.seo.keywords.length > 0;
  if (hayContenidoSEO) {
    datos.seo = {
      ...(campos.seo.metaTitle && { metaTitle: campos.seo.metaTitle }),
      ...(campos.seo.metaDescription && { metaDescription: campos.seo.metaDescription }),
      ...(campos.seo.keywords.length > 0 && { keywords: campos.seo.keywords }),
    };
  }

  // Agente — solo si hay nombre y teléfono
  if (campos.agente.nombre && campos.agente.telefono) {
    datos.agente = {
      nombre: campos.agente.nombre,
      telefono: campos.agente.telefono,
      ...(campos.agente.email && { email: campos.agente.email }),
      ...(campos.agente.whatsapp && { whatsapp: campos.agente.whatsapp }),
    };
  }

  // Inversión — solo si la línea de negocio es inversión
  if (campos.lineaNegocio === 'inversion' && campos.inversion.entidadBancaria) {
    datos.inversion = {
      entidadBancaria: campos.inversion.entidadBancaria,
      aceptaContraoferta: campos.inversion.aceptaContraoferta,
      ...(campos.inversion.referenciaEntidad && { referenciaEntidad: campos.inversion.referenciaEntidad }),
      ...(campos.inversion.precioListadoBanco && {
        precioListadoBanco: parsearNumero(campos.inversion.precioListadoBanco),
      }),
      ...(campos.inversion.documentosRequeridos.length > 0 && {
        documentosRequeridos: campos.inversion.documentosRequeridos,
      }),
      ...(campos.inversion.notasInternas && { notasInternas: campos.inversion.notasInternas }),
      ...(campos.inversion.observacionesBanco && { observacionesBanco: campos.inversion.observacionesBanco }),
    };
  }

  return datos;
}

// ── Componente principal ───────────────────────────────────────────────────

export default function FormularioPropiedad({
  modo = 'crear',
  propiedadId,
  slugOriginal,
  codigoOriginal,
  valoresIniciales,
  imagenesIniciales = [],
  imagenPrincipalInicial = '',
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const esEdicion = modo === 'editar';

  // Estado fuera de RHF — solo para imágenes y toast
  const [imagenes, setImagenes] = useState<string[]>(imagenesIniciales);
  const [imagenPrincipal, setImagenPrincipal] = useState<string>(imagenPrincipalInicial);
  const [toast, setToast] = useState<EstadoToast>({
    visible: false,
    tipo: 'exito',
    mensaje: '',
  });

  const methods = useForm<CamposFormulario>({
    mode: 'onBlur',
    defaultValues: valoresIniciales ?? VALORES_INICIALES,
  });

  const codigoPropiedad = useWatch({ control: methods.control, name: 'codigoPropiedad' });
  const lineaNegocio = useWatch({ control: methods.control, name: 'lineaNegocio' });

  // Callback para GaleriaImagenes
  function manejarCambioGaleria(nuevasImagenes: string[], nuevaPortada: string) {
    setImagenes(nuevasImagenes);
    setImagenPrincipal(nuevaPortada);
  }

  // Handler del submit del formulario
  async function onSubmit(campos: CamposFormulario) {
    const datosBase = transformarFormADatos(campos, imagenes, imagenPrincipal);

    startTransition(async () => {
      let resultado;

      if (esEdicion && propiedadId && slugOriginal !== undefined && codigoOriginal !== undefined) {
        const datosActualizar: DatosActualizarPropiedad = {
          ...datosBase,
          id: propiedadId,
          slugAnterior: slugOriginal,
          codigoAnterior: codigoOriginal,
        };
        resultado = await actualizarPropiedad(datosActualizar);
      } else {
        resultado = await crearPropiedad(datosBase);
      }

      if (!resultado.ok) {
        setToast({ visible: true, tipo: 'error', mensaje: resultado.error });
        setTimeout(() => setToast((t) => ({ ...t, visible: false })), 5000);
        return;
      }

      setToast({
        visible: true,
        tipo: 'exito',
        mensaje: esEdicion
          ? 'Cambios guardados correctamente.'
          : 'Propiedad guardada como borrador correctamente.',
      });

      setTimeout(() => {
        router.push('/admin/propiedades');
      }, 1500);
    });
  }

  const isSubmitting = methods.formState.isSubmitting || isPending;

  return (
    <FormProvider {...methods}>
      <div className="p-6 sm:p-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            {esEdicion ? 'Editar Propiedad' : 'Nueva Propiedad'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {esEdicion
              ? 'Los cambios se guardarán manteniendo el estado actual de publicación.'
              : 'Se guardará como borrador. Puedes publicarla desde el listado.'}
          </p>
        </div>

        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          noValidate
          className="space-y-8"
        >
          {/* Secciones del formulario */}
          <SeccionBasica
            modoEdicion={esEdicion}
            slugOriginal={slugOriginal}
            propiedadId={propiedadId}
          />
          <SeccionUbicacion />
          <SeccionCaracteristicas />
          <SeccionPrecio />
          {lineaNegocio === 'inversion' && <SeccionInversion />}
          <SeccionSEO />

          {/* Galería de imágenes — estado fuera de RHF */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Galería de Imágenes</h2>
            <GaleriaImagenes
              codigoPropiedad={codigoPropiedad || undefined}
              idPropiedad={propiedadId}
              imagenPrincipal={imagenPrincipal}
              onCambio={manejarCambioGaleria}
              imagenesIniciales={imagenesIniciales}
              slugPropiedad={slugOriginal}
            />
          </section>

          {/* Botones */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push('/admin/propiedades')}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Guardando...
                </>
              ) : esEdicion ? (
                'Guardar cambios'
              ) : (
                'Guardar como borrador'
              )}
            </button>
          </div>
        </form>

        {/* Toast de retroalimentación */}
        {toast.visible && (
          <div
            role="status"
            aria-live="polite"
            className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border px-4 py-3 shadow-lg text-sm font-medium transition-all
              ${
                toast.tipo === 'exito'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-red-200 bg-red-50 text-red-800'
              }`}
          >
            {toast.mensaje}
          </div>
        )}

      </div>
    </FormProvider>
  );
}
