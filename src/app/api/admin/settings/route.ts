import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/admin'
import { getStoreSettings, clampPercent } from '@/lib/settings'

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
    const percent = Number(body.mp_discount_percent)

    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      return NextResponse.json(
        { error: 'La bonificación debe ser un número entre 0 y 100' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('store_settings')
      .update({
        mp_discount_percent: clampPercent(percent),
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1)
      .select('mp_discount_percent')
      .single()

    if (error) throw error

    return NextResponse.json({
      settings: { mp_discount_percent: Number(data.mp_discount_percent) },
    })
  } catch (err) {
    console.error('[Admin Settings PUT] Error:', err)
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
