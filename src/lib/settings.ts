import { createServiceClient } from '@/lib/supabase/server'

/** Medidas (cm) de la caja estándar con la que Bel despacha. */
export interface BoxDimensions {
  largo_cm: number
  ancho_cm: number
  alto_cm: number
}

/** Configuración de tienda editable desde el panel admin. */
export interface StoreSettings {
  /**
   * Descuento (%) que se muestra al pagar por transferencia. 0–100.
   * (La columna conserva el nombre `mp_discount_percent` por compatibilidad.)
   */
  mp_discount_percent: number
  /** Caja estándar de despacho, usada para cotizar el volumen del envío. */
  box: BoxDimensions
}

export const DEFAULT_BOX: BoxDimensions = { largo_cm: 30, ancho_cm: 20, alto_cm: 15 }

export const DEFAULT_SETTINGS: StoreSettings = {
  mp_discount_percent: 10,
  box: DEFAULT_BOX,
}

/**
 * Lee la configuración de la tienda (fila singleton id = 1).
 * Si la tabla/columnas todavía no existen o no hay fila, cae a los defaults
 * campo por campo para no romper el checkout.
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (!data) return DEFAULT_SETTINGS

    return {
      mp_discount_percent: clampPercent(Number(data.mp_discount_percent)),
      box: {
        largo_cm: clampDim(data.box_largo_cm, DEFAULT_BOX.largo_cm),
        ancho_cm: clampDim(data.box_ancho_cm, DEFAULT_BOX.ancho_cm),
        alto_cm: clampDim(data.box_alto_cm, DEFAULT_BOX.alto_cm),
      },
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
 * Normaliza una medida de caja a un entero en cm dentro de 1–150.
 * Si el valor no es válido, devuelve el fallback indicado.
 */
export function clampDim(value: unknown, fallback: number): number {
  const n = Math.round(Number(value))
  if (!Number.isFinite(n) || n < 1) return fallback
  return Math.min(150, n)
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
