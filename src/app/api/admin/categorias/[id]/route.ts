import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/admin'

interface Props {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, { params }: Props) {
  const { admin, error: authError, status } = await requireAdmin()
  if (!admin) return NextResponse.json({ error: authError }, { status })

  try {
    const { id } = await params
    const body = await req.json()
    const supabase = createServiceClient()

    // Chequear unicidad de slug si cambió
    if (body.slug) {
      const { data: conflicts } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', body.slug)
        .neq('id', id)
        .limit(1)

      if (conflicts && conflicts.length > 0) {
        return NextResponse.json(
          { error: 'Ya existe otra categoría con ese slug' },
          { status: 409 }
        )
      }
    }

    const updateData: Record<string, unknown> = {
      name: body.name,
      slug: body.slug,
      description: body.description,
    }
    if (typeof body.active === 'boolean') updateData.active = body.active

    const { data: category, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ category })
  } catch (err) {
    console.error('[Categorias PUT] Error:', err)
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const { admin, error: authError, status } = await requireAdmin()
  if (!admin) return NextResponse.json({ error: authError }, { status })

  try {
    const { id } = await params
    const supabase = createServiceClient()

    // La FK de products.category_id tiene ON DELETE SET NULL,
    // así que los productos asociados quedan con category_id=null
    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Categorias DELETE] Error:', err)
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
