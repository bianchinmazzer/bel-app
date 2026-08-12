import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin'
import { checkGetnetAuth } from '@/lib/getnet'

/** Diagnóstico de conexión con Getnet (solo admin). */
export async function GET() {
  const { admin, error: authError, status } = await requireAdmin()
  if (!admin) return NextResponse.json({ error: authError }, { status })

  const result = await checkGetnetAuth()
  return NextResponse.json(result)
}
