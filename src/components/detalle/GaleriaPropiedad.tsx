'use client';

import Image from 'next/image';
import { useState, useRef, useEffect, useCallback } from 'react';

interface Props {
  imagenes: string[];
  titulo: string;
}

const MAX_GRID = 5; // Desktop: 1 hero + 4 miniaturas

// ── Íconos ────────────────────────────────────────────────────────────────────

function IconoGrid() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4 shrink-0" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" strokeLinecap="round" />
    </svg>
  );
}

function IconoChevronIzquierdo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6" aria-hidden="true">
      <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconoChevronDerecho() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6" aria-hidden="true">
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconoCerrar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function GaleriaPropiedad({ imagenes, titulo }: Props) {
  const [indiceActivo, setIndiceActivo] = useState(0);
  const [lightboxAbierto, setLightboxAbierto] = useState(false);
  const [indiceLightbox, setIndiceLightbox] = useState(0);
  const carruselRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const botonAbrirRef = useRef<HTMLButtonElement>(null);

  const imagenesSeguras = imagenes.length > 0 ? imagenes : ['/placeholder-propiedad.jpg'];

  // IntersectionObserver para sincronizar el contador con el scroll del carrusel
  useEffect(() => {
    const contenedor = carruselRef.current;
    if (!contenedor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = slidesRef.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) setIndiceActivo(idx);
          }
        });
      },
      { root: contenedor, threshold: 0.5 },
    );

    slidesRef.current.forEach((slide) => {
      if (slide) observer.observe(slide);
    });

    return () => observer.disconnect();
  }, [imagenesSeguras.length]);

  // Teclado para el lightbox
  useEffect(() => {
    if (!lightboxAbierto) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxAbierto(false);
        botonAbrirRef.current?.focus();
      }
      if (e.key === 'ArrowRight')
        setIndiceLightbox((i) => Math.min(i + 1, imagenesSeguras.length - 1));
      if (e.key === 'ArrowLeft')
        setIndiceLightbox((i) => Math.max(i - 1, 0));
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxAbierto, imagenesSeguras.length]);

  const abrirLightbox = useCallback((indice: number) => {
    setIndiceLightbox(indice);
    setLightboxAbierto(true);
  }, []);

  const cerrarLightbox = useCallback(() => {
    setLightboxAbierto(false);
    botonAbrirRef.current?.focus();
  }, []);

  const imagenHero = imagenesSeguras[0];
  const imagenesGrid = imagenesSeguras.slice(0, MAX_GRID);
  const hayMasDeCinco = imagenesSeguras.length > MAX_GRID;

  return (
    <>
      {/* ── MOBILE: Carrusel CSS scroll-snap ─────────────────────────────── */}
      <div className="relative md:hidden rounded-2xl overflow-hidden">
        <div
          ref={carruselRef}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide"
        >
          {imagenesSeguras.map((src, i) => (
            <div
              key={i}
              ref={(el) => { slidesRef.current[i] = el; }}
              className="flex-shrink-0 w-full snap-start relative h-72"
            >
              <button
                className="w-full h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset"
                onClick={() => abrirLightbox(i)}
                aria-label={`Ver foto ${i + 1} de ${imagenesSeguras.length} en pantalla completa`}
              >
                <Image
                  src={src}
                  alt={`${titulo} — foto ${i + 1} de ${imagenesSeguras.length}`}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={i === 0}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Contador de imágenes */}
        {imagenesSeguras.length > 1 && (
          <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full pointer-events-none select-none">
            {indiceActivo + 1} / {imagenesSeguras.length}
          </span>
        )}
      </div>

      {/* ── DESKTOP: Hero grid estilo Airbnb ─────────────────────────────── */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-2 rounded-2xl overflow-hidden h-[480px]">
        {/* Imagen hero: ocupa toda la altura de la columna izquierda */}
        <button
          ref={botonAbrirRef}
          onClick={() => abrirLightbox(0)}
          className="relative w-full h-full group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset"
          aria-label="Ver foto principal"
        >
          <Image
            src={imagenHero}
            alt={`${titulo} — foto principal`}
            fill
            sizes="(min-width: 768px) 50vw"
            className="object-cover group-hover:brightness-90 transition-[filter] duration-300"
            priority
          />
        </button>

        {/* Grid 2×2 de miniaturas a la derecha */}
        {imagenesGrid.length > 1 && (
          <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
            {imagenesGrid.slice(1, 5).map((src, i) => {
              const esUltima = i === 3 && hayMasDeCinco;
              return (
                <button
                  key={i}
                  onClick={() => abrirLightbox(i + 1)}
                  className="relative w-full h-full group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset overflow-hidden"
                  aria-label={`Ver foto ${i + 2}`}
                >
                  <Image
                    src={src}
                    alt={`${titulo} — foto ${i + 2}`}
                    fill
                    sizes="(min-width: 768px) 25vw"
                    className="object-cover group-hover:brightness-90 transition-[filter] duration-300"
                  />
                  {esUltima && (
                    <span className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/50 text-white text-sm font-semibold">
                      <IconoGrid />
                      Ver todas ({imagenesSeguras.length})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Botón "Ver todas" en desktop cuando hay ≤ 5 fotos (no hay overlay en miniatura) */}
      {imagenesSeguras.length > 1 && !hayMasDeCinco && (
        <div className="hidden md:flex justify-end mt-2">
          <button
            onClick={() => abrirLightbox(0)}
            className="text-sm text-blue-600 underline underline-offset-2 hover:text-blue-800 transition-colors"
          >
            Ver todas las fotos ({imagenesSeguras.length})
          </button>
        </div>
      )}

      {/* ── LIGHTBOX MODAL ────────────────────────────────────────────────── */}
      {lightboxAbierto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Galería de fotos"
          className="fixed inset-0 z-50 bg-black/95 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 text-white shrink-0">
            <span className="text-sm font-medium tabular-nums">
              {indiceLightbox + 1} / {imagenesSeguras.length}
            </span>
            <button
              onClick={cerrarLightbox}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Cerrar galería"
            >
              <IconoCerrar />
            </button>
          </div>

          {/* Imagen */}
          <div className="flex-1 relative min-h-0">
            <Image
              src={imagenesSeguras[indiceLightbox]}
              alt={`${titulo} — foto ${indiceLightbox + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {/* Navegación */}
          <div className="flex items-center justify-center gap-4 py-4 shrink-0">
            <button
              onClick={() => setIndiceLightbox((i) => Math.max(i - 1, 0))}
              disabled={indiceLightbox === 0}
              className="p-2.5 text-white disabled:opacity-30 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Foto anterior"
            >
              <IconoChevronIzquierdo />
            </button>
            <button
              onClick={() =>
                setIndiceLightbox((i) => Math.min(i + 1, imagenesSeguras.length - 1))
              }
              disabled={indiceLightbox === imagenesSeguras.length - 1}
              className="p-2.5 text-white disabled:opacity-30 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Foto siguiente"
            >
              <IconoChevronDerecho />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
