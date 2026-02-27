export * from './propiedad';
export * from './filtros';
export * from './lead';
export * from './auditoria';

/**
 * Tipo estándar de retorno para todas las Server Actions del proyecto.
 * - Si T es void: { ok: true } | { ok: false; error: string }
 * - Si T tiene datos: { ok: true; data: T } | { ok: false; error: string }
 */
export type ResultadoAccion<T = void> = T extends void
  ? { ok: true } | { ok: false; error: string }
  : { ok: true; data: T } | { ok: false; error: string };
