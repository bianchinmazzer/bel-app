/**
 * Estimador de tarifas de OCA e-Pak (modalidad ESTÁNDAR, tarifario N2).
 *
 * Se usa como cotización de RESPALDO mientras no estén activas las credenciales
 * de la API (CUIT + Operativa). Cuando la API responde, `Tarifar_Envio_Corporativo`
 * da el precio exacto y este estimador queda solo como fallback.
 *
 * Fuente: "Tarifario EPAK - N2 ABR26" (Tarifario Nº 02/2026, vigencia 01/04/2026).
 * ⚠️ Los precios del tarifario son SIN IVA → acá se les suma IVA (21%) para
 * mostrar el costo final al comprador. ⚠️ Se desactualizan con la inflación:
 * actualizar las tablas y `TARIFAS_ACTUALIZADAS` cuando OCA emita un tarifario nuevo.
 *
 * DIFERENCIA CLAVE con Correo: OCA tarifa por DISTANCIA desde el origen
 * (Bahía Blanca, CP 8000), no por zona de destino. Las 4 columnas del tarifario
 * son bandas de distancia:
 *   L  = Local, hasta 50 km
 *   R  = Regional, hasta 350 km
 *   N1 = hasta 800 km + principales ciudades hasta 1.250 km
 *   N2 = Resto
 * Mapear un CP a su banda desde Bahía Blanca es aproximado: ante la duda se elige
 * la banda MÁS CARA para cubrir el costo. El precio real lo da la API en vivo.
 */
export const TARIFAS_ACTUALIZADAS = '2026-04-01'

/** IVA argentino que OCA factura sobre el precio de lista (sin IVA). */
const IVA = 1.21

/** Divisor volumétrico (cm³ por kg). OCA no lo documenta en el tarifario; se usa
 *  6000 como aproximación (peso facturable = max(real, volumétrico)). */
const VOLUMETRIC_DIVISOR = 6000

type Banda = 'L' | 'R' | 'N1' | 'N2'

/** Índice de columna [L, R, N1, N2] para cada banda. */
const COL: Record<Banda, number> = { L: 0, R: 1, N1: 2, N2: 3 }

/**
 * Tramos de peso (tope superior en kg) del tarifario, en orden.
 * El costo es fijo por tramo (no se interpola: así factura OCA).
 */
const TRAMOS_KG = [0.5, 1, 2, 5, 10, 15, 20, 25] as const

/** ESTÁNDAR · A DOMICILIO · [L, R, N1, N2] (ARS sin IVA), por tramo de peso. */
const DOMICILIO: number[][] = [
  [11494.9, 14327.9, 14440.4, 16700.7], // 0–0,5 kg
  [11606.3, 14512.9, 14756.1, 16821.6], // 0,5–1
  [11719.5, 15198.7, 15377.6, 18368.2], // 1–2
  [12060.1, 17257.4, 17416.4, 23008.8], // 2–5
  [12630.6, 20355.3, 20690.7, 30746.0], // 5–10
  [14345.5, 23471.2, 24128.0, 36883.2], // 10–15
  [17641.9, 26591.2, 31885.1, 44305.3], // 15–20
  [19585.8, 29715.6, 37861.9, 51731.8], // 20–25
]

/** ESTÁNDAR · A SUCURSAL · [L, R, N1, N2] (ARS sin IVA), por tramo de peso. */
const SUCURSAL: number[][] = [
  [7607.3, 8172.0, 8243.6, 10866.0], // 0–0,5 kg
  [7690.8, 8212.4, 8421.8, 11388.8], // 0,5–1
  [7733.1, 8862.6, 9005.9, 12292.8], // 1–2
  [8111.8, 10935.8, 11293.0, 16074.6], // 2–5
  [8840.2, 14393.5, 15107.8, 24671.2], // 5–10
  [11466.5, 17855.5, 20572.8, 31885.5], // 10–15
  [14398.7, 21322.2, 28131.6, 40132.7], // 15–20
  [16256.5, 24793.9, 34012.9, 48384.2], // 20–25
]

/** Plazo estimado de entrega (días hábiles) por banda, modalidad estándar. */
const PLAZOS: Record<Banda, string> = {
  L: '2-4 días hábiles',
  R: '3-5 días hábiles',
  N1: '4-7 días hábiles',
  N2: '5-9 días hábiles',
}

/**
 * Mapea un CP de destino a su banda de distancia DESDE BAHÍA BLANCA (CP 8000).
 * Heurística conservadora (ante la duda, banda más cara). Acepta CP de 4 dígitos
 * o CPA (letra + 4 dígitos + 3 letras): usa el bloque numérico de 4 dígitos.
 */
export function bandaPorCP(cp: string): Banda {
  const m = String(cp).match(/\d{4}/)
  const n = m ? Number(m[0]) : NaN
  if (!Number.isFinite(n)) return 'N1' // desconocido → banda intermedia-alta

  // L — Bahía Blanca ciudad y alrededores inmediatos (≤50 km).
  if (n >= 8000 && n <= 8009) return 'L' // Bahía Blanca
  if (n >= 8101 && n <= 8111) return 'L' // Punta Alta / Cnel. Rosales

  // R — Sudoeste bonaerense, La Pampa, Viedma/Patagones (≤350 km).
  if (n >= 8120 && n <= 8200) return 'R' // Tres Arroyos, Dorrego, Pringles, Monte Hermoso
  if (n >= 6300 && n <= 6399) return 'R' // Santa Rosa (La Pampa) y centro pampeano
  if (n >= 8500 && n <= 8509) return 'R' // Viedma / Carmen de Patagones

  // N2 — extremos: NOA lejano, NEA y Patagonia sur (Resto, >1.250 km).
  if (n >= 3300 && n <= 3699) return 'N2' // Misiones, Corrientes, Chaco, Formosa
  if (n >= 4000 && n <= 4899) return 'N2' // Tucumán, Sgo. del Estero, Salta, Jujuy, Catamarca
  if (n >= 9100 && n <= 9999) return 'N2' // Chubut sur, Santa Cruz, Tierra del Fuego

  // N1 — resto del país dentro de ~1.250 km o ciudades principales:
  //   CABA/GBA, Bs As interior, Córdoba, Santa Fe/Rosario, Mendoza/Cuyo,
  //   Entre Ríos, Neuquén, Río Negro, Bariloche, La Rioja/San Juan/San Luis.
  return 'N1'
}

export interface EstimateParams {
  cpDestino: string
  pesoGramos: number
  box: { largo_cm: number; ancho_cm: number; alto_cm: number }
  deliveryType: 'D' | 'S'
}

export interface EstimateResult {
  /** Costo estimado en CENTAVOS de ARS (con IVA). */
  costoCentavos: number
  diasEstimados: string
  banda: Banda
}

/**
 * Estima el costo de un envío por OCA e-Pak (tarifario N2 estándar, con IVA).
 * Usa el peso facturable = max(peso real, peso volumétrico de la caja).
 */
export function estimarEnvio(params: EstimateParams): EstimateResult {
  const banda = bandaPorCP(params.cpDestino)
  const col = COL[banda]

  const pesoRealKg = Math.max(params.pesoGramos, 1) / 1000
  const volumenCm3 = params.box.largo_cm * params.box.ancho_cm * params.box.alto_cm
  const pesoVolKg = volumenCm3 / VOLUMETRIC_DIVISOR
  const facturableKg = Math.min(Math.max(pesoRealKg, pesoVolKg), 25) // tope 25 kg

  const tabla = params.deliveryType === 'S' ? SUCURSAL : DOMICILIO
  const tramo = TRAMOS_KG.findIndex((tope) => facturableKg <= tope)
  const fila = tabla[tramo === -1 ? tabla.length - 1 : tramo]
  const precioSinIva = fila[col]

  return {
    costoCentavos: Math.round(precioSinIva * IVA * 100),
    diasEstimados: PLAZOS[banda],
    banda,
  }
}
