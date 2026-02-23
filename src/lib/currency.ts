import type { Moneda } from '@/types';

// 1 unidad de cada moneda expresada en COP (tasas estáticas de referencia)
const TASAS_A_COP: Record<Moneda, number> = {
  COP: 1,
  USD: 4000,
  EUR: 4300,
};

export function convertirMoneda(valor: number, de: Moneda, a: Moneda): number {
  if (de === a) return valor;
  return (valor * TASAS_A_COP[de]) / TASAS_A_COP[a];
}

export function formatearPrecio(valor: number, moneda: Moneda): string {
  const locales: Record<Moneda, string> = {
    COP: 'es-CO',
    USD: 'en-US',
    EUR: 'de-DE',
  };
  return new Intl.NumberFormat(locales[moneda], {
    style: 'currency',
    currency: moneda,
    maximumFractionDigits: 0,
  }).format(valor);
}
