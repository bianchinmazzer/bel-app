/**
 * Estimador de tarifas de Correo Argentino (MiCorreo, tarifas de LISTA públicas).
 *
 * Se usa como cotización estimada mientras no estén activas las credenciales de
 * la API (MiCorreo/PAQ.AR). Cuando la API esté disponible, el cotizador usa el
 * precio exacto y este estimador queda solo como respaldo.
 *
 * Base de datos de tarifas: valores de lista de MiCorreo medidos el 2026-08-19.
 * Importante (verificado): la tarifa de lista depende del DESTINO, no del origen
 * — el mismo envío cotiza igual despaches desde donde despaches. Por eso alcanza
 * con mapear el CP de destino a una zona.
 *
 * Correo tarifa por PESO AFORADO = el mayor entre el peso real y el volumétrico
 * (L×A×H cm / 6000 → kg). Por eso entran las medidas de la caja configurada.
 *
 * ⚠️ Estos números se desactualizan con la inflación. Fecha de la medición:
 */
export const TARIFAS_ACTUALIZADAS = '2026-08-19'

/** Divisor volumétrico de Correo Argentino (cm³ por kg). */
const VOLUMETRIC_DIVISOR = 6000

type Zona = 'A' | 'B' | 'C'

/**
 * Tarifa "Clásico a domicilio" (ARS) por zona, en 3 puntos de peso aforado.
 * Entre puntos se interpola linealmente; arriba de 10 kg se extrapola.
 * `sucursalRatio` = cuánto sale a sucursal respecto de domicilio (~‑33%).
 */
const TARIFAS: Record<Zona, { p1: number; p5: number; p10: number; sucursalRatio: number }> = {
  // Centro/Pampeana/Litoral cercano (Rosario, Córdoba cap., Mar del Plata, Bs As).
  A: { p1: 9648, p5: 15957, p10: 21342, sucursalRatio: 0.659 },
  // Cuyo / Norte cercano / Patagonia norte (Mendoza, Tucumán, Neuquén).
  B: { p1: 10509, p5: 17880, p10: 25423, sucursalRatio: 0.666 },
  // Extremos: NOA lejano y Patagonia sur (Salta, Jujuy, Ushuaia).
  C: { p1: 10586, p5: 19724, p10: 30568, sucursalRatio: 0.69 },
}

const PLAZOS: Record<Zona, string> = {
  A: '2-4 días hábiles',
  B: '3-6 días hábiles',
  C: '4-8 días hábiles',
}

/**
 * Mapea un código postal de destino a una zona tarifaria (aprox., para estimar).
 * Acepta CP numérico de 4 dígitos o CPA (letra + 4 dígitos + 3 letras): en ambos
 * casos usa el bloque numérico de 4 dígitos.
 */
export function zonaPorCP(cp: string): Zona {
  const m = String(cp).match(/\d{4}/)
  const n = m ? Number(m[0]) : NaN
  if (!Number.isFinite(n)) return 'B' // desconocido → zona intermedia

  // Rangos aproximados de CP → zona (para cotización estimada).
  if (n >= 1000 && n <= 3299) return 'A' // CABA, Bs As, Santa Fe, Entre Ríos
  if (n >= 3300 && n <= 3999) return 'C' // Misiones, Corrientes, Chaco, Formosa
  if (n >= 4000 && n <= 4299) return 'B' // Tucumán, Sgo. del Estero
  if (n >= 4300 && n <= 4699) return 'C' // Salta, Jujuy
  if (n >= 4700 && n <= 4999) return 'B' // Catamarca
  if (n >= 5000 && n <= 5299) return 'A' // Córdoba
  if (n >= 5300 && n <= 5999) return 'B' // La Rioja, San Juan, Mendoza, San Luis
  if (n >= 6000 && n <= 8299) return 'A' // Bs As interior, La Pampa, MdP, Bahía Blanca
  if (n >= 8300 && n <= 8999) return 'B' // Neuquén, Río Negro
  if (n >= 9000 && n <= 9999) return 'C' // Chubut, Santa Cruz, Tierra del Fuego
  return 'B'
}

/** Interpola/extrapola el precio a domicilio (ARS) según el peso aforado (kg). */
function precioDomicilio(z: Zona, kg: number): number {
  const t = TARIFAS[z]
  if (kg <= 1) return t.p1
  if (kg <= 5) return t.p1 + ((t.p5 - t.p1) * (kg - 1)) / 4
  if (kg <= 10) return t.p5 + ((t.p10 - t.p5) * (kg - 5)) / 5
  // > 10 kg: extrapola con la pendiente del tramo 5→10.
  return t.p10 + ((t.p10 - t.p5) / 5) * (kg - 10)
}

export interface EstimateParams {
  cpDestino: string
  pesoGramos: number
  box: { largo_cm: number; ancho_cm: number; alto_cm: number }
  deliveryType: 'D' | 'S'
}

export interface EstimateResult {
  /** Costo estimado en CENTAVOS de ARS. */
  costoCentavos: number
  diasEstimados: string
  zona: Zona
}

/**
 * Estima el costo de un envío por Correo Argentino (tarifa de lista MiCorreo).
 * Usa el peso aforado = max(peso real, peso volumétrico de la caja).
 */
export function estimarEnvio(params: EstimateParams): EstimateResult {
  const z = zonaPorCP(params.cpDestino)

  const pesoRealKg = Math.max(params.pesoGramos, 1) / 1000
  const volumenCm3 = params.box.largo_cm * params.box.ancho_cm * params.box.alto_cm
  const pesoVolKg = volumenCm3 / VOLUMETRIC_DIVISOR
  const aforadoKg = Math.min(Math.max(pesoRealKg, pesoVolKg), 25) // tope 25 kg

  const domicilio = precioDomicilio(z, aforadoKg)
  const precio = params.deliveryType === 'S' ? domicilio * TARIFAS[z].sucursalRatio : domicilio

  return {
    costoCentavos: Math.round(precio * 100),
    diasEstimados: PLAZOS[z],
    zona: z,
  }
}
