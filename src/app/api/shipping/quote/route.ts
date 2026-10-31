import { NextRequest, NextResponse } from 'next/server'
import { getStoreSettings } from '@/lib/settings'
import { estimarEnvio } from '@/lib/oca/tarifas'
import { tarifarEnvio, isOcaQuoteConfigured } from '@/lib/oca/epak'

/**
 * Cotización de envío contra el web service OCA e-Pak (`Tarifar_Envio_Corporativo`).
 *
 * Reemplaza a la integración anterior con Correo Argentino (MiCorreo). OCA es
 * SOAP/XML: el cliente vive en `@/lib/oca/epak`. La cotización se firma con el
 * CUIT + el número de Operativa de la cuenta e-Pak (distinta para domicilio y
 * sucursal), sin token.
 *
 * Si faltan credenciales o OCA no responde una tarifa válida, se cae a una
 * tarifa ESTIMADA por zona/peso (`estimarEnvio`) para no bloquear el checkout
 * (mismo criterio que la integración anterior).
 */

/** CP desde donde despacha Bel (origen del envío). */
const CP_ORIGEN = process.env.OCA_CP_ORIGEN ?? process.env.CORREO_CP_ORIGEN ?? '8000'

/** Divisor de OCA para pasar cm³ a m³. */
const CM3_POR_M3 = 1_000_000

interface QuoteRequest {
  cp_destino: string
  peso_gramos: number
  valor_declarado: number
  /** 'D' domicilio (default) | 'S' sucursal. */
  delivery_type?: 'D' | 'S'
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as QuoteRequest

    if (!body.cp_destino || body.cp_destino.length < 4) {
      return NextResponse.json({ error: 'Código postal inválido' }, { status: 400 })
    }

    const deliveredType = body.delivery_type === 'S' ? 'S' : 'D'

    // Peso real (gramos → kg) y dimensiones de la caja estándar del admin.
    const pesoGramos = clamp(Math.round(body.peso_gramos), 1, 25000)
    const { box } = await getStoreSettings()
    const alto_cm = clamp(box.alto_cm, 1, 150)
    const ancho_cm = clamp(box.ancho_cm, 1, 150)
    const largo_cm = clamp(box.largo_cm, 1, 150)
    const boxDims = { largo_cm, ancho_cm, alto_cm }

    // Sin credenciales de OCA → estimado por zona (no bloquea el checkout).
    if (!isOcaQuoteConfigured(deliveredType)) {
      return estimatedResponse(body.cp_destino, pesoGramos, boxDims, deliveredType)
    }

    const volumenM3 = (largo_cm * ancho_cm * alto_cm) / CM3_POR_M3
    const valorDeclarado = Math.max(0, Math.round(body.valor_declarado || 0))

    const rate = await tarifarEnvio({
      pesoKg: pesoGramos / 1000,
      volumenM3,
      cpOrigen: CP_ORIGEN,
      cpDestino: body.cp_destino,
      cantidadPaquetes: 1,
      valorDeclarado,
      deliveryType: deliveredType,
    })

    if (!rate) {
      return estimatedResponse(body.cp_destino, pesoGramos, boxDims, deliveredType)
    }

    return NextResponse.json({
      // precioArs viene en ARS con decimales; el resto del sistema usa centavos.
      costo_ars: Math.round(rate.precioArs * 100),
      metodo: metodoLabel(deliveredType),
      dias_estimados: rate.plazoDias,
      estimado: false,
    })
  } catch (err) {
    console.error('[ShippingQuote] Error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// Estimado por zona/peso cuando no hay cotización real de OCA.
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
  return deliveredType === 'S' ? 'oca_sucursal' : 'oca_domicilio'
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}
