import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/admin'
import { getStoreSettings, clampPercent, clampDim, DEFAULT_BOX } from '@/lib/settings'

export async function GET() {
  const { admin, error: authError, status } = await requireAdmin()
  if (!admin) return NextResponse.json({ error: authError }, { status })

  const settings = await getStoreSettings()
  return NextResponse.json({ settings })
}

export async function PUT(req: NextRequest) {
  const { admin, error: authError, status } = await requireAdmin()
  if (!admin) return NextResponse.json({ error: authError }, { status })

  try {
    const body = await req.json()
    const update: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    // Bonificación Mercado Pago (opcional).
    if (body.mp_discount_percent !== undefined) {
      const percent = Number(body.mp_discount_percent)
      if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
        return NextResponse.json(
          { error: 'La bonificación debe ser un número entre 0 y 100' },
          { status: 400 }
        )
      }
      update.mp_discount_percent = clampPercent(percent)
    }

    // Caja estándar de despacho (opcional; se validan las 3 medidas juntas).
    const hasBox =
      body.box_largo_cm !== undefined ||
      body.box_ancho_cm !== undefined ||
      body.box_alto_cm !== undefined
    if (hasBox) {
      const largo = Number(body.box_largo_cm)
      const ancho = Number(body.box_ancho_cm)
      const alto = Number(body.box_alto_cm)
      const dims = [largo, ancho, alto]
      if (dims.some((d) => !Number.isFinite(d) || d < 1 || d > 150)) {
        return NextResponse.json(
          { error: 'Las medidas de la caja deben ser enteros entre 1 y 150 cm' },
          { status: 400 }
        )
      }
      update.box_largo_cm = clampDim(largo, DEFAULT_BOX.largo_cm)
      update.box_ancho_cm = clampDim(ancho, DEFAULT_BOX.ancho_cm)
      update.box_alto_cm = clampDim(alto, DEFAULT_BOX.alto_cm)
    }

    const supabase = createServiceClient()
    const { error } = await supabase
      .from('store_settings')
      .update(update)
      .eq('id', 1)

    if (error) throw error

    // Releemos la config normalizada para devolverla al panel.
    const settings = await getStoreSettings()
    return NextResponse.json({ settings })
  } catch (err) {
    console.error('[Admin Settings PUT] Error:', err)
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
