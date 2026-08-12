import { createServiceClient } from '@/lib/supabase/server'

/** Configuración de tienda editable desde el panel admin. */
export interface StoreSettings {
  /** Bonificación (%) que se aplica al pagar con Mercado Pago. 0–100. */
  mp_discount_percent: number
}

export const DEFAULT_SETTINGS: StoreSettings = {
  mp_discount_percent: 10,
}

/**
 * Lee la configuración de la tienda (fila singleton id = 1).
 * Si la tabla todavía no existe o no hay fila, devuelve los defaults para
 * no romper el checkout.
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('store_settings')
      .select('mp_discount_percent')
      .eq('id', 1)
      .single()

    if (!data) return DEFAULT_SETTINGS

    return {
      mp_discount_percent: clampPercent(Number(data.mp_discount_percent)),
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

/** Asegura que el porcentaje quede en el rango válido 0–100. */
export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
}

/**
 * Calcula la bonificación en centavos sobre un monto (en centavos).
 * Devuelve el descuento redondeado al peso más cercano.
 */
export function calcDiscountCents(amountCents: number, percent: number): number {
  const pct = clampPercent(percent)
  if (pct <= 0) return 0
  return Math.round((amountCents * pct) / 100)
}
