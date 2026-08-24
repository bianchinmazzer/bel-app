/**
 * Cliente de la API PAQ.AR de Correo Argentino.
 *
 * PAQ.AR gestiona las ÓRDENES de envío (alta, cancelación, rótulo, tracking).
 * NO cotiza — la cotización vive en la API MiCorreo (ver src/app/api/shipping/
 * quote/route.ts). Este cliente se usa para, al aprobarse un pago, dar de alta
 * el envío y obtener el rótulo (PDF) que queda disponible en el panel admin.
 *
 * Auth: headers `Authorization: Apikey <API-Key>` + `agreement: <id acuerdo>`.
 * Las credenciales se gestionan con el área Comercial de Correo Argentino.
 */

const API_BASE =
  process.env.PAQAR_API_BASE ?? 'https://api.correoargentino.com.ar/paqar/v1'
const AGREEMENT = process.env.PAQAR_AGREEMENT
const API_KEY = process.env.PAQAR_API_KEY
/** Calidad de servicio (código de 2 letras que define Correo; ej. "CP"). */
const SERVICE_TYPE = process.env.PAQAR_SERVICE_TYPE ?? 'CP'

export function isPaqarConfigured(): boolean {
  return Boolean(AGREEMENT && API_KEY)
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Apikey ${API_KEY}`,
    agreement: String(AGREEMENT),
    'Content-Type': 'application/json',
  }
}

/**
 * Diagnóstico: valida las credenciales contra el gateway (GET /auth → 204).
 * La usa el panel admin para saber si PAQ.AR ya está operativo.
 */
export async function checkPaqarAuth(): Promise<{ ok: boolean; message: string }> {
  if (!isPaqarConfigured()) {
    return { ok: false, message: 'Faltan las credenciales de PAQ.AR (agreement / API-Key).' }
  }
  try {
    const res = await fetch(`${API_BASE}/auth`, { method: 'GET', headers: authHeaders() })
    if (res.status === 204 || res.ok) {
      return { ok: true, message: '✅ Conexión con PAQ.AR OK. Las credenciales están activas.' }
    }
    const detail = await res.text().catch(() => '')
    return { ok: false, message: `PAQ.AR rechazó las credenciales (${res.status}). ${detail}`.trim() }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, message: `Error al conectar con PAQ.AR: ${msg}` }
  }
}

// ---------------------------------------------------------------------------
// Alta de orden
// ---------------------------------------------------------------------------

/** Tipo de entrega en PAQ.AR (mapea a nuestro delivery_type 'D'/'S'). */
export type PaqarDeliveryType = 'homeDelivery' | 'agency' | 'locker'

export interface PaqarAddress {
  streetName: string
  streetNumber: string
  cityName: string
  /** Código de provincia (1 letra, ver tabla de Correo). */
  state: string
  zipCode: string
  floor?: string
  department?: string
}

export interface PaqarParty {
  name: string
  email?: string
  areaCodeCellphone?: string
  cellphoneNumber?: string
  observation?: string
  address: PaqarAddress
}

export interface CreateOrderParams {
  /** Datos del remitente (Bel). */
  sender: PaqarParty
  /** Datos del destinatario (comprador). */
  recipient: PaqarParty
  /** Peso total del paquete en gramos. */
  weightGrams: number
  /** Dimensiones de la caja en cm. */
  box: { largo_cm: number; ancho_cm: number; alto_cm: number }
  /** Valor declarado (entero, en pesos). */
  declaredValue: number
  deliveryType: PaqarDeliveryType
  /** Código de sucursal/locker (obligatorio si no es homeDelivery). */
  agencyId?: string
  /** Referencia interna de la orden (nuestro order.id). */
  shipmentClientId?: string
  saleDate?: string
}

export interface CreateOrderResult {
  /** Nº de seguimiento (TN) generado por Correo. */
  trackingNumber: string
}

/**
 * Da de alta una orden de envío en PAQ.AR. Devuelve el trackingNumber.
 * Nota: PAQ.AR solo toma el primer `parcel`, por eso mandamos un único paquete
 * (la caja) con el peso total.
 */
export async function createPaqarOrder(
  params: CreateOrderParams
): Promise<CreateOrderResult> {
  assertConfigured()

  const body = {
    order: {
      senderData: partyToData(params.sender),
      shippingData: partyToData(params.recipient),
      parcels: [
        {
          dimensions: {
            height: String(Math.round(params.box.alto_cm)),
            width: String(Math.round(params.box.ancho_cm)),
            depth: String(Math.round(params.box.largo_cm)),
          },
          productWeight: String(Math.round(params.weightGrams)),
          productCategory: 'general',
          declaredValue: String(Math.round(params.declaredValue)),
        },
      ],
      deliveryType: params.deliveryType,
      agencyId: params.agencyId ?? '',
      saleDate: params.saleDate ?? new Date().toISOString(),
      serviceType: SERVICE_TYPE,
      shipmentClientId: params.shipmentClientId ?? '',
    },
  }

  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`PAQ.AR alta de orden falló (${res.status}): ${detail}`)
  }

  const data = (await res.json()) as { trackingNumber?: string }
  if (!data.trackingNumber) {
    throw new Error(`PAQ.AR no devolvió trackingNumber. Respuesta: ${JSON.stringify(data)}`)
  }
  return { trackingNumber: data.trackingNumber }
}

// ---------------------------------------------------------------------------
// Rótulo (PDF)
// ---------------------------------------------------------------------------
export interface PaqarLabel {
  trackingNumber: string
  /** PDF del rótulo en base64. */
  fileBase64: string
  fileName: string
  /** "OK" o "ERROR: ..." según el TN. */
  result?: string
}

/**
 * Obtiene el rótulo (PDF en base64) de un envío por su trackingNumber.
 * Endpoint batch: enviamos un solo TN y devolvemos su rótulo.
 */
export async function getPaqarLabel(
  trackingNumber: string,
  labelFormat = '10x15'
): Promise<PaqarLabel> {
  assertConfigured()

  const res = await fetch(`${API_BASE}/labels?labelFormat=${encodeURIComponent(labelFormat)}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify([{ trackingNumber }]),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`PAQ.AR rótulo falló (${res.status}): ${detail}`)
  }

  const data = (await res.json()) as PaqarLabel[]
  const label = data?.[0]
  if (!label?.fileBase64 || (label.result && !/ok/i.test(label.result))) {
    throw new Error(`PAQ.AR no devolvió rótulo para ${trackingNumber}: ${JSON.stringify(data)}`)
  }
  return label
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function assertConfigured() {
  if (!isPaqarConfigured()) {
    throw new Error('PAQ.AR no está configurado. Faltan PAQAR_AGREEMENT / PAQAR_API_KEY.')
  }
}

function partyToData(p: PaqarParty) {
  return {
    name: p.name,
    email: p.email ?? '',
    areaCodeCellphone: p.areaCodeCellphone ?? '',
    cellphoneNumber: p.cellphoneNumber ?? '',
    observation: p.observation ?? '',
    address: {
      streetName: p.address.streetName,
      streetNumber: p.address.streetNumber,
      cityName: p.address.cityName,
      state: p.address.state,
      zipCode: p.address.zipCode,
      floor: p.address.floor ?? '',
      department: p.address.department ?? '',
    },
  }
}
