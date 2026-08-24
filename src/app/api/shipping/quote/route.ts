import { NextRequest, NextResponse } from 'next/server'
import { getStoreSettings } from '@/lib/settings'
import { estimarEnvio } from '@/lib/correo/tarifas'

/**
 * Cotización de envío contra la API MiCorreo de Correo Argentino (PAQ.AR).
 *
 * La cotización vive en la API "MiCorreo" (no en la API "PAQ.AR", que solo
 * gestiona órdenes/rótulos/tracking). El flujo es:
 *   1. POST /token con HTTP Basic Auth (user:password) → token JWT (Bearer).
 *   2. POST /rates con el CP de origen/destino y las dimensiones → tarifas.
 *
 * Si faltan credenciales, se cae a una tarifa estimada fija por peso, para no
 * bloquear el checkout (mismo comportamiento que tenía la integración anterior).
 */

/** Base de la API MiCorreo. Prod por defecto; test se setea por env. */
const API_BASE =
  process.env.CORREO_API_BASE ?? 'https://api.correoargentino.com.ar/micorreo/v1'

/** Credenciales MiCorreo (se solicitan al área Comercial / portal de Correo). */
const CORREO_USER = process.env.CORREO_USER
const CORREO_PASSWORD = process.env.CORREO_PASSWORD
/** Id de cliente MiCorreo (customerId), obligatorio para /rates. */
const CORREO_CUSTOMER_ID = process.env.CORREO_CUSTOMER_ID
/** CP desde donde despacha Bel (origen del envío). */
const CP_ORIGEN = process.env.CORREO_CP_ORIGEN ?? '8000'

interface QuoteRequest {
  cp_destino: string
  peso_gramos: number
  valor_declarado: number
  /** 'D' domicilio (default) | 'S' sucursal. */
  delivery_type?: 'D' | 'S'
}

interface CorreoRate {
  deliveredType: string
  productType: string
  productName: string
  price: number
  deliveryTimeMin: string
  deliveryTimeMax: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as QuoteRequest

    if (!body.cp_destino || body.cp_destino.length < 4) {
      return NextResponse.json({ error: 'Código postal inválido' }, { status: 400 })
    }

    const deliveredType = body.delivery_type === 'S' ? 'S' : 'D'

    // MiCorreo espera enteros: gramos (1..25000) y cm (1..150).
    // Las dimensiones salen de la caja estándar configurada en el admin
    // (Bel despacha en una caja fija); el peso es real por producto.
    const peso_gramos = clamp(Math.round(body.peso_gramos), 1, 25000)
    const { box } = await getStoreSettings()
    const alto_cm = clamp(box.alto_cm, 1, 150)
    const ancho_cm = clamp(box.ancho_cm, 1, 150)
    const largo_cm = clamp(box.largo_cm, 1, 150)
    const boxDims = { largo_cm, ancho_cm, alto_cm }

    // Sin credenciales → tarifa estimada por zona (no bloquea el checkout).
    if (!CORREO_USER || !CORREO_PASSWORD || !CORREO_CUSTOMER_ID) {
      return estimatedResponse(body.cp_destino, peso_gramos, boxDims, deliveredType)
    }

    const token = await getMiCorreoToken()
    if (!token) return estimatedResponse(body.cp_destino, peso_gramos, boxDims, deliveredType)

    const ratesRes = await fetch(`${API_BASE}/rates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        customerId: CORREO_CUSTOMER_ID,
        postalCodeOrigin: CP_ORIGEN,
        postalCodeDestination: body.cp_destino,
        deliveredType, // 'D' domicilio | 'S' sucursal
        dimensions: {
          weight: peso_gramos,
          height: alto_cm,
          width: ancho_cm,
          length: largo_cm,
        },
      }),
    })

    if (!ratesRes.ok) {
      console.error('[ShippingQuote] MiCorreo /rates falló:', ratesRes.status)
      return estimatedResponse(body.cp_destino, peso_gramos, boxDims, deliveredType)
    }

    const data = (await ratesRes.json()) as { rates?: CorreoRate[] }
    // Elegimos la tarifa del tipo pedido (domicilio/sucursal) más barata.
    const delTipo = (data.rates ?? []).filter((r) => r.deliveredType === deliveredType)
    const rate = (delTipo.length ? delTipo : data.rates ?? []).sort(
      (a, b) => a.price - b.price
    )[0]

    if (!rate) return estimatedResponse(body.cp_destino, peso_gramos, boxDims, deliveredType)

    return NextResponse.json({
      // price viene en ARS con decimales; el resto del sistema usa centavos.
      costo_ars: Math.round(rate.price * 100),
      metodo: metodoLabel(deliveredType),
      dias_estimados: `${rate.deliveryTimeMin}-${rate.deliveryTimeMax} días hábiles`,
      estimado: false,
    })
  } catch (err) {
    console.error('[ShippingQuote] Error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// Token MiCorreo (Basic Auth → JWT), con cache en memoria hasta que expire.
// ---------------------------------------------------------------------------
let cachedToken: { value: string; expiresAt: number } | null = null

async function getMiCorreoToken(): Promise<string | null> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value
  }

  const basic = Buffer.from(`${CORREO_USER}:${CORREO_PASSWORD}`).toString('base64')
  const res = await fetch(`${API_BASE}/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}` },
  })

  if (!res.ok) {
    console.error('[ShippingQuote] MiCorreo /token falló:', res.status)
    return null
  }

  const data = (await res.json()) as { token?: string; expires?: string }
  if (!data.token) return null

  // `expires` viene como fecha ("2022-04-26 21:16:20"); si no parsea, 50 min.
  const parsed = data.expires ? Date.parse(data.expires.replace(' ', 'T')) : NaN
  const expiresAt = Number.isFinite(parsed) ? parsed : Date.now() + 50 * 60_000
  cachedToken = { value: data.token, expiresAt }
  return data.token
}

// ---------------------------------------------------------------------------
// Estimado por zona (tarifas de lista MiCorreo) cuando no hay cotización real.
// ---------------------------------------------------------------------------
function estimatedResponse(
  cpDestino: string,
  pesoGramos: number,
  box: { largo_cm: number; ancho_cm: number; alto_cm: number },
  deliveredType: 'D' | 'S'
) {
  const est = estimarEnvio({ cpDestino, pesoGramos, box, deliveryType: deliveredType })
  return NextResponse.json({
    costo_ars: est.costoCentavos,
    metodo: metodoLabel(deliveredType),
    dias_estimados: est.diasEstimados,
    estimado: true,
  })
}

function metodoLabel(deliveredType: 'D' | 'S'): string {
  return deliveredType === 'S'
    ? 'correo_argentino_sucursal'
    : 'correo_argentino_domicilio'
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}
