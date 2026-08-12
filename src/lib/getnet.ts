/**
 * Cliente de Getnet Argentina (Get Checkout).
 *
 * La API de Getnet Argentina corre sobre GeoPagos y usa el formato JSON:API.
 * Este cliente replica el flujo del plugin oficial "Getnet Argentina para
 * WooCommerce":
 *   1. OAuth2 client_credentials contra auth.geopagos.com → token Bearer.
 *   2. POST /api/v2/orders con los ítems → devuelve la URL de checkout.
 *   3. GET /api/v2/orders/{uuid} → estado real del pago.
 *
 * No requiere seller_id: el flujo argentino no lo usa. Solo Client ID + Secret.
 * Las cuotas sin interés se configuran del lado del comercio en Getnet, no se
 * envían en el pedido.
 */

/** Endpoint OAuth2 (GeoPagos, el motor de Getnet AR). */
const TOKEN_URL = process.env.GETNET_TOKEN_URL ?? 'https://auth.geopagos.com/oauth/token'

/** Base de la API de órdenes de Getnet Argentina. */
const API_BASE = process.env.GETNET_BASE_URL ?? 'https://api.globalgetnet.com.ar/api/v2'

const CLIENT_ID = process.env.GETNET_CLIENT_ID
const CLIENT_SECRET = process.env.GETNET_CLIENT_SECRET

/** Código de moneda ARS en el formato numérico ISO 4217 que espera Getnet. */
const CURRENCY_ARS = '032'

export function isGetnetConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET)
}

function assertConfigured() {
  if (!isGetnetConfigured()) {
    throw new Error(
      'Getnet no está configurado. Faltan GETNET_CLIENT_ID / GETNET_CLIENT_SECRET.'
    )
  }
}

/**
 * Prueba de diagnóstico: intenta autenticar contra Getnet y devuelve un
 * resultado legible. La usa el panel admin para saber si las credenciales
 * ya están activas (recién generadas pueden tardar hasta 48 h en activarse).
 */
export async function checkGetnetAuth(): Promise<{ ok: boolean; message: string }> {
  if (!isGetnetConfigured()) {
    return { ok: false, message: 'Faltan las credenciales de Getnet (Client ID / Secret).' }
  }
  try {
    cachedToken = null // forzar un intento nuevo, sin cache
    await getAccessToken()
    return { ok: true, message: '✅ Conexión con Getnet OK. Las credenciales están activas.' }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('401') || msg.toLowerCase().includes('authentication')) {
      return {
        ok: false,
        message:
          '⏳ Getnet todavía rechaza las credenciales (401). Suele ser porque aún no están activas: la activación puede tardar hasta 48 h desde que se generaron. Volvé a probar más tarde.',
      }
    }
    return { ok: false, message: `Error al conectar con Getnet: ${msg}` }
  }
}

// ---------------------------------------------------------------------------
// OAuth2 — token de acceso (con cache en memoria hasta que expire)
// ---------------------------------------------------------------------------
let cachedToken: { value: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  assertConfigured()

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'client_credentials',
      scope: '*',
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Getnet OAuth falló (${res.status}): ${detail}`)
  }

  const data = (await res.json()) as { access_token: string; expires_in?: number }
  const ttlMs = (data.expires_in ?? 3600) * 1000
  cachedToken = { value: data.access_token, expiresAt: Date.now() + ttlMs }
  return data.access_token
}

// ---------------------------------------------------------------------------
// Crear checkout (orden)
// ---------------------------------------------------------------------------
export interface CheckoutItem {
  name: string
  /** Total de la línea en CENTAVOS de ARS (precio unitario × cantidad). */
  amountCents: number
}

export interface CreateCheckoutParams {
  /** Ítems del carrito. */
  items: CheckoutItem[]
  /** Costo de envío en centavos (0 si no aplica). */
  shippingCents: number
  /** URLs de retorno + notificación. */
  urls: { success: string; failure: string; notification: string }
}

export interface CreateCheckoutResult {
  /** UUID de la orden en Getnet (se guarda como getnet_checkout_id). */
  checkoutId: string
  /** URL a la que redirigir al cliente para pagar. */
  redirectUrl: string
}

/**
 * Crea una orden en Getnet y devuelve la URL de checkout a la que redirigir.
 * El monto lo determinan los ítems (Getnet suma), por eso viajan en centavos.
 */
export async function createGetnetCheckout(
  params: CreateCheckoutParams
): Promise<CreateCheckoutResult> {
  const token = await getAccessToken()

  const items = params.items.map((item, idx) => ({
    id: idx + 1,
    name: item.name,
    unitPrice: { currency: CURRENCY_ARS, amount: String(item.amountCents) },
    quantity: 1,
  }))

  const attributes: Record<string, unknown> = {
    items,
    redirect_urls: {
      success: params.urls.success,
      failed: params.urls.failure,
    },
    webhookUrl: params.urls.notification,
    expireLimitMinutes: 30,
  }

  if (params.shippingCents > 0) {
    attributes.shipping = {
      name: 'ENVIO',
      price: { currency: CURRENCY_ARS, amount: String(params.shippingCents) },
    }
  }

  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data: { attributes } }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Getnet checkout falló (${res.status}): ${detail}`)
  }

  const data = (await res.json()) as GetnetOrderResponse

  // La URL de pago viene en data.links[0].checkout (formato del plugin oficial).
  const redirectUrl = data.data?.links?.[0]?.checkout ?? ''
  // El UUID de la orden es el id del recurso JSON:API.
  const checkoutId =
    data.data?.id ?? (data.data?.attributes?.uuid as string | undefined) ?? ''

  if (!checkoutId || !redirectUrl) {
    throw new Error(
      `Getnet no devolvió checkout/uuid. Respuesta: ${JSON.stringify(data)}`
    )
  }

  return { checkoutId, redirectUrl }
}

// ---------------------------------------------------------------------------
// Consultar estado de una orden (llamado desde el webhook)
// ---------------------------------------------------------------------------
export interface GetnetPaymentStatus {
  /** Normalizado a nuestro modelo de estados. */
  status: 'approved' | 'rejected' | 'cancelled' | 'pending'
  /** Monto confirmado en centavos si la API lo informa (para validar). */
  amountCents: number | null
  /** UUID de la orden en Getnet. */
  orderId: string
}

/**
 * Consulta el estado real de una orden en Getnet a partir de su uuid.
 * NUNCA confiar solo en el payload del webhook: se re-consulta acá.
 */
export async function getGetnetPayment(uuid: string): Promise<GetnetPaymentStatus> {
  const token = await getAccessToken()

  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(uuid)}`, {
    method: 'GET',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Getnet consulta de orden falló (${res.status}): ${detail}`)
  }

  const data = (await res.json()) as GetnetOrderResponse

  // El estado puede venir a nivel raíz o dentro de data.attributes según endpoint.
  const rawStatus = String(
    data.status ?? data.data?.attributes?.status ?? ''
  )

  const rawAmount = data.data?.attributes?.total ?? data.data?.attributes?.amount
  const amountCents =
    rawAmount != null && Number.isFinite(Number(rawAmount)) ? Number(rawAmount) : null

  return {
    status: normalizeStatus(rawStatus),
    amountCents,
    orderId: data.data?.id ?? uuid,
  }
}

/**
 * Estados de Getnet AR: APPROVED / PROCESSED / SUCCESS = aprobado
 * (según el plugin oficial). El resto se trata como rechazado/pendiente.
 */
function normalizeStatus(raw: string): GetnetPaymentStatus['status'] {
  const s = raw.toUpperCase()
  if (['APPROVED', 'PROCESSED', 'SUCCESS', 'PAID', 'AUTHORIZED'].includes(s)) {
    return 'approved'
  }
  if (['DENIED', 'REJECTED', 'ERROR', 'FAILED'].includes(s)) return 'rejected'
  if (['CANCELED', 'CANCELLED', 'EXPIRED', 'VOIDED', 'REFUNDED'].includes(s)) {
    return 'cancelled'
  }
  return 'pending'
}

// ---------------------------------------------------------------------------
// Tipos de respuesta (parciales) de la API JSON:API de Getnet
// ---------------------------------------------------------------------------
interface GetnetOrderResponse {
  status?: string
  data?: {
    id?: string
    links?: { checkout?: string }[]
    attributes?: {
      uuid?: string
      status?: string
      total?: number | string
      amount?: number | string
    }
  }
}
