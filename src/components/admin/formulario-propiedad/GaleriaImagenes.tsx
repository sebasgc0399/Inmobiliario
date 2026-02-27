'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

import { storage } from '@/lib/firebase/client';
import { eliminarImagenPropiedad } from '@/actions/propiedades/eliminarImagenPropiedad';

// ── Constantes ────────────────────────────────────────────────────────────

const MAX_IMAGENES = 40;
const MAX_DIMENSION = 2000; // px máximos por lado
const CALIDAD_JPEG = 0.82;

// ── Tipos internos ─────────────────────────────────────────────────────────

interface ArchivoLocal {
  id: string;          // UUID local para key de React
  previewUrl: string;  // blob: URL para preview (o URL de Storage si es existente)
  progreso: number;    // 0–100 (100 para las existentes)
  url?: string;        // URL de Firebase Storage (undefined hasta que termina)
  error?: string;      // Mensaje de error si falló la subida o eliminación
  nombre: string;      // Nombre de archivo sanitizado
  esExistente: boolean; // true si fue cargada desde Firestore (ya estaba guardada)
  eliminando?: boolean; // true mientras se espera la confirmación del servidor
}

interface Props {
  codigoPropiedad: string | undefined;
  idPropiedad?: string;        // Solo en modo edición — para la Server Action de eliminación
  imagenPrincipal: string;
  onCambio: (imagenes: string[], imagenPrincipal: string) => void;
  imagenesIniciales?: string[]; // URLs ya guardadas en Firestore (modo edición)
  slugPropiedad?: string;       // Para revalidar la ruta pública tras eliminación
}

// ── Helper: comprimir imagen con Canvas API ───────────────────────────────

async function comprimirImagen(archivo: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const urlObj = URL.createObjectURL(archivo);

    img.onload = () => {
      URL.revokeObjectURL(urlObj); // Liberar memoria al terminar de cargar

      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas no disponible en este navegador.'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Error al comprimir la imagen.'));
        },
        'image/jpeg',
        CALIDAD_JPEG,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(urlObj);
      reject(new Error('No se pudo cargar la imagen.'));
    };

    img.src = urlObj;
  });
}

// ── Helper: sanitizar nombre de archivo ───────────────────────────────────

function sanitizarNombre(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ñÑ]/g, 'n')
    .replace(/[^a-zA-Z0-9.-]/g, '-')
    .toLowerCase()
    .replace(/-+/g, '-');
}

// ── Componente ────────────────────────────────────────────────────────────

export default function GaleriaImagenes({
  codigoPropiedad,
  idPropiedad,
  imagenPrincipal,
  onCambio,
  imagenesIniciales,
  slugPropiedad,
}: Props) {
  const [archivos, setArchivos] = useState<ArchivoLocal[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ref sincronizada con el estado para evitar closures stale en callbacks asíncronos de Firebase
  const archivosRef = useRef<ArchivoLocal[]>([]);
  useEffect(() => {
    archivosRef.current = archivos;
  }, [archivos]);

  // Ref para rastrear la portada asignada sin depender del closure de la prop.
  // Necesario porque múltiples uploads en paralelo completan antes de que React
  // re-renderice, por lo que todos leerían imagenPrincipal = '' desde el closure.
  const portadaInternaRef = useRef(imagenPrincipal);

  // Inicializar con imágenes existentes (solo en el primer render).
  // No se llama onCambio aquí porque el padre ya conoce estos valores.
  useEffect(() => {
    if (imagenesIniciales && imagenesIniciales.length > 0) {
      const existentes: ArchivoLocal[] = imagenesIniciales.map((url, index) => ({
        id: `existente-${index}-${url.slice(-12)}`,
        previewUrl: url,  // La URL de Storage sirve directamente como preview
        progreso: 100,
        url,
        nombre: url.split('/').pop()?.split('?')[0] ?? 'imagen',
        esExistente: true,
      }));
      setArchivos(existentes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo en mount

  // Sincronizar cuando el padre actualiza la portada (ej: usuario hace clic en "Portada")
  useEffect(() => {
    portadaInternaRef.current = imagenPrincipal;
  }, [imagenPrincipal]);

  // Notificar al padre cada vez que cambian las URLs o la portada
  const notificarCambios = useCallback(
    (nuevosArchivos: ArchivoLocal[], nuevaPortada: string) => {
      const urlsSubidas = nuevosArchivos.filter((a) => a.url).map((a) => a.url!);
      onCambio(urlsSubidas, nuevaPortada);
    },
    [onCambio],
  );

  async function manejarSeleccion(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    // Limpiar el input para permitir re-seleccionar los mismos archivos
    if (inputRef.current) inputRef.current.value = '';

    const espacioDisponible = MAX_IMAGENES - archivos.length;
    if (espacioDisponible <= 0) return;

    const archivosASubir = files.slice(0, espacioDisponible);

    // Crear entradas locales inmediatamente para mostrar previews
    const nuevasEntradas: ArchivoLocal[] = archivosASubir.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      previewUrl: URL.createObjectURL(file),
      progreso: 0,
      nombre: sanitizarNombre(file.name),
      esExistente: false,
    }));

    setArchivos((prev) => [...prev, ...nuevasEntradas]);

    // Subir cada archivo en paralelo
    archivosASubir.forEach(async (file, index) => {
      const entrada = nuevasEntradas[index];

      try {
        const blob = await comprimirImagen(file);
        const codigo = codigoPropiedad ?? 'sin-codigo';
        const path = `propiedades/${codigo}/${Date.now()}-${entrada.nombre}`;
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, blob, {
          contentType: 'image/jpeg',
        });

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progreso = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            );
            setArchivos((prev) =>
              prev.map((a) => (a.id === entrada.id ? { ...a, progreso } : a)),
            );
          },
          (error) => {
            console.error('[GaleriaImagenes] Error al subir:', error);
            const actualizados = archivosRef.current.map((a) =>
              a.id === entrada.id ? { ...a, error: 'Error al subir. Reintenta.' } : a,
            );
            setArchivos(actualizados);
            notificarCambios(actualizados, imagenPrincipal);
          },
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              const actualizados = archivosRef.current.map((a) =>
                a.id === entrada.id ? { ...a, url, progreso: 100 } : a,
              );
              // Si no hay portada aún, la primera imagen subida se convierte en portada.
              const portadaActual = portadaInternaRef.current || url;
              portadaInternaRef.current = portadaActual;
              setArchivos(actualizados);
              notificarCambios(actualizados, portadaActual);
            } catch (err) {
              console.error('[GaleriaImagenes] Error al obtener URL:', err);
            }
          },
        );
      } catch (err) {
        console.error('[GaleriaImagenes] Error al comprimir:', err);
        setArchivos((prev) =>
          prev.map((a) =>
            a.id === entrada.id ? { ...a, error: 'Error al procesar la imagen.' } : a,
          ),
        );
      }
    });
  }

  function marcarComoPortada(url: string) {
    notificarCambios(archivos, url);
  }

  // Eliminar imagen nueva (aún no guardada en Firestore): solo quitar del estado local.
  function eliminarArchivoNuevo(id: string) {
    const filtrados = archivos.filter((a) => a.id !== id);
    const entradaEliminada = archivos.find((a) => a.id === id);

    let nuevaPortada = imagenPrincipal;
    if (entradaEliminada?.url === imagenPrincipal) {
      const primerSubido = filtrados.find((a) => a.url);
      nuevaPortada = primerSubido?.url ?? '';
    }

    setArchivos(filtrados);
    notificarCambios(filtrados, nuevaPortada);
  }

  // Eliminar imagen existente: confirmación → Server Action → actualización del estado.
  async function eliminarArchivoExistente(id: string, url: string) {
    if (!idPropiedad) {
      console.error('[GaleriaImagenes] idPropiedad requerido para eliminar imágenes existentes.');
      return;
    }

    if (!window.confirm('¿Eliminar esta imagen? Esta acción es irreversible.')) return;

    const esPrincipal = url === imagenPrincipal;

    // Marcar como "eliminando" para bloquear el botón y mostrar spinner
    setArchivos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, eliminando: true, error: undefined } : a)),
    );

    const resultado = await eliminarImagenPropiedad(idPropiedad, url, esPrincipal, slugPropiedad);

    if (!resultado.ok) {
      // Quitar el estado de carga y mostrar el error inline
      setArchivos((prev) =>
        prev.map((a) => (a.id === id ? { ...a, eliminando: false, error: resultado.error } : a)),
      );
      return;
    }

    // Éxito: remover del estado y actualizar portada si era la principal
    const filtrados = archivos.filter((a) => a.id !== id);
    const nuevaPortada = esPrincipal
      ? (filtrados.find((a) => a.url)?.url ?? '')
      : imagenPrincipal;
    setArchivos(filtrados);
    notificarCambios(filtrados, nuevaPortada);
  }

  const limiteAlcanzado = archivos.length >= MAX_IMAGENES;

  return (
    <div className="space-y-4">

      {/* Zona de carga */}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={limiteAlcanzado}
          onChange={manejarSeleccion}
          className="sr-only"
          id="galeria-input"
          aria-label="Seleccionar imágenes para la galería"
        />
        <label
          htmlFor="galeria-input"
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors
            ${
              limiteAlcanzado
                ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300'
                : 'border-gray-300 bg-white text-gray-500 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600'
            }`}
        >
          {/* Icono de cámara */}
          <svg
            className="mb-2 h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
            />
          </svg>

          <span className="text-sm font-medium">
            {limiteAlcanzado
              ? `Límite de ${MAX_IMAGENES} imágenes alcanzado`
              : 'Haz clic para seleccionar imágenes'}
          </span>
          <span className="mt-1 text-xs">JPG, PNG, WebP — Se comprimen a máx 2000 px</span>
          {archivos.length > 0 && (
            <span className="mt-1 text-xs font-medium">
              {archivos.length}/{MAX_IMAGENES} imágenes
            </span>
          )}
        </label>
      </div>

      {/* Grid de previews */}
      {archivos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {archivos.map((archivo) => (
            <div
              key={archivo.id}
              className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition-all
                ${
                  archivo.url === imagenPrincipal
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200'
                }`}
            >
              {/*
               * Se usa <img> nativo intencionalmente:
               * - Las previewUrl de archivos nuevos son blob: URLs que Next.js <Image> no puede optimizar.
               * - Las URLs de Storage existentes también se muestran con <img> para consistencia.
               */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={archivo.previewUrl}
                alt="Preview de imagen"
                className="h-full w-full object-cover"
              />

              {/* Overlay de progreso (solo para imágenes nuevas en subida) */}
              {!archivo.url && !archivo.error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                  <div className="w-3/4 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-1.5 rounded-full bg-white transition-all duration-300"
                      style={{ width: `${archivo.progreso}%` }}
                    />
                  </div>
                  <span className="mt-1.5 text-xs font-semibold text-white">
                    {archivo.progreso}%
                  </span>
                </div>
              )}

              {/* Overlay de eliminación en progreso */}
              {archivo.eliminando && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <svg
                    className="h-6 w-6 animate-spin text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-label="Eliminando imagen…"
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
                </div>
              )}

              {/* Overlay de error */}
              {archivo.error && !archivo.eliminando && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-900/70 p-2">
                  <p className="text-center text-xs font-medium text-white">{archivo.error}</p>
                </div>
              )}

              {/* Badge de portada */}
              {archivo.url && archivo.url === imagenPrincipal && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white shadow">
                  Portada
                </span>
              )}

              {/* Acciones en hover — ocultas mientras se elimina */}
              {!archivo.eliminando && (
                <div className="absolute inset-0 flex flex-col items-end justify-start gap-1 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  {/* Botón "Marcar como portada" — solo si tiene URL y no es la portada actual */}
                  {archivo.url && archivo.url !== imagenPrincipal && (
                    <button
                      type="button"
                      onClick={() => marcarComoPortada(archivo.url!)}
                      className="rounded-lg bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 shadow hover:bg-white"
                    >
                      Portada
                    </button>
                  )}

                  {/* Botón eliminar */}
                  <button
                    type="button"
                    onClick={() =>
                      archivo.esExistente && archivo.url
                        ? eliminarArchivoExistente(archivo.id, archivo.url)
                        : eliminarArchivoNuevo(archivo.id)
                    }
                    className="rounded-lg bg-red-500/90 px-2 py-1 text-xs font-semibold text-white shadow hover:bg-red-600"
                    aria-label="Eliminar imagen"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
