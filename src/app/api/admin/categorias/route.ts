import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { admin, error: authError, status } = await requireAdmin()
  if (!admin) return NextResponse.json({ error: authError }, { status })

  try {
    const body = await req.json()

    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: 'Nombre y slug son requeridos' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Chequear unicidad de slug
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', body.slug)
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe una categoría con ese slug' },
        { status: 409 }
      )
    }

    // Calcular position (al final)
    const { data: last } = await supabase
      .from('categories')
      .select('position')
      .order('position', { ascending: false })
      .limit(1)

    const nextPosition = last && last.length > 0 ? last[0].position + 1 : 0

    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        name: body.name,
        slug: body.slug,
        description: body.description,
        position: nextPosition,
        active: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ category })
  } catch (err) {
    console.error('[Categorias POST] Error:', err)
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
