import { NextRequest, NextResponse } from 'next/server'

const ANDREANI_API_URL = process.env.ANDREANI_API_URL ?? 'https://apisqa.andreani.com'
const CP_ORIGEN = process.env.ANDREANI_CP_ORIGEN ?? '8000'

interface QuoteRequest {
  cp_destino: string
  peso_gramos: number
  largo_cm: number
  ancho_cm: number
  alto_cm: number
  valor_declarado: number
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as QuoteRequest

    if (!body.cp_destino || body.cp_destino.length < 4) {
      return NextResponse.json({ error: 'Código postal inválido' }, { status: 400 })
    }

    const peso_kg = Math.max(body.peso_gramos / 1000, 0.1)
    const volumen_cc = body.largo_cm * body.ancho_cm * body.alto_cm

    const user = process.env.ANDREANI_USER
    const pass = process.env.ANDREANI_PASS
    const contrato = process.env.ANDREANI_CONTRATO_DOMICILIO

    // Si no hay credenciales reales, devolvemos tarifa estimada
    if (!user || !pass || !contrato) {
      return NextResponse.json({
        costo_ars: estimarTarifa(peso_kg),
        metodo: 'andreani_domicilio',
        dias_estimados: '3-7 días hábiles',
        estimado: true,
      })
    }

    // Login Andreani
    const authRes = await fetch(`${ANDREANI_API_URL}/v2/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: user, password: pass }),
    })

    if (!authRes.ok) {
      return NextResponse.json({
        costo_ars: estimarTarifa(peso_kg),
        metodo: 'andreani_domicilio',
        dias_estimados: '3-7 días hábiles',
        estimado: true,
      })
    }

    const { token } = await authRes.json()

    const quoteRes = await fetch(`${ANDREANI_API_URL}/v2/tarifas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        cpDestino: body.cp_destino,
        cpOrigen: CP_ORIGEN,
        pesoPaquete: peso_kg,
        volumenPaquete: volumen_cc,
        valorDeclarado: body.valor_declarado,
        contrato,
      }),
    })

    if (!quoteRes.ok) {
      return NextResponse.json({
        costo_ars: estimarTarifa(peso_kg),
        metodo: 'andreani_domicilio',
        dias_estimados: '3-7 días hábiles',
        estimado: true,
      })
    }

    const quoteData = await quoteRes.json()

    return NextResponse.json({
      costo_ars: Math.round((quoteData.tarifaConIva ?? quoteData.tarifa ?? 0) * 100),
      metodo: 'andreani_domicilio',
      dias_estimados: '3-7 días hábiles',
      estimado: false,
    })
  } catch (err) {
    console.error('[ShippingQuote] Error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// Tarifa estimada cuando no hay credenciales Andreani
function estimarTarifa(peso_kg: number): number {
  if (peso_kg <= 2) return 350000 // $3.500
  if (peso_kg <= 5) return 550000 // $5.500
  if (peso_kg <= 15) return 800000 // $8.000
  return 1200000 // $12.000
}
