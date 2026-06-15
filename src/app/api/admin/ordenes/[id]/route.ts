import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/admin'

interface Props {
  params: Promise<{ id: string }>
}

const VALID_STATUS = ['pending', 'approved', 'rejected', 'cancelled'] as const

export async function PATCH(req: NextRequest, { params }: Props) {
  const { admin, error: authError, status } = await requireAdmin()
  if (!admin) return NextResponse.json({ error: authError }, { status })

  try {
    const { id } = await params
    const body = await req.json()
    const supabase = createServiceClient()

    const update: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (typeof body.status === 'string') {
      if (!VALID_STATUS.includes(body.status)) {
        return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
      }
      update.status = body.status
    }

    if (typeof body.andreani_tracking_number === 'string') {
      update.andreani_tracking_number =
        body.andreani_tracking_number.trim() || null
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ order })
  } catch (err) {
    console.error('[Orders PATCH] Error:', err)
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
