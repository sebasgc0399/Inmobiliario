/**
 * Convierte un título a slug URL-friendly.
 * Función pura — sin efectos secundarios, testeable de forma aislada.
 *
 * Ejemplos:
 *   "Casa 3 Hab. en El Poblado" → "casa-3-hab-en-el-poblado"
 *   "Ñoño & Cía. S.A.S."       → "nono-cia-sas"
 *   "Aparta-Estudio Chapinero!" → "aparta-estudio-chapinero"
 */
export function generarSlug(texto: string): string {
  return texto
    .normalize('NFD')                    // Descompone tildes: á → a + combining accent
    .replace(/[\u0300-\u036f]/g, '')     // Elimina los combinadores diacríticos
    .replace(/[ñÑ]/g, 'n')              // ñ/Ñ → n (NFD no descompone la eñe)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')       // Elimina caracteres especiales (conserva espacios y guiones)
    .replace(/\s+/g, '-')               // Espacios a guiones
    .replace(/-+/g, '-')                // Colapsa guiones múltiples consecutivos
    .replace(/^-+|-+$/g, '');           // Elimina guiones al inicio y al final
}
