import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/admin'

interface ImagePayload {
  id: string
  url: string
  is_primary: boolean
  isNew?: boolean
  isDeleted?: boolean
}

interface VariantPayload {
  id: string
  label: string
  position: number
  isNew?: boolean
  isDeleted?: boolean
}

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

    // Validar unicidad de SKU/slug si cambiaron
    const { data: conflicts } = await supabase
      .from('products')
      .select('id')
      .or(`sku.eq.${body.sku},slug.eq.${body.slug}`)
      .neq('id', id)
      .limit(1)

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe otro producto con ese SKU o slug' },
        { status: 409 }
      )
    }

    const { data: product, error } = await supabase
      .from('products')
      .update({
        name: body.name,
        sku: body.sku,
        slug: body.slug,
        description: body.description,
        category_id: body.category_id,
        price_ars: body.price_ars,
        stock: body.stock,
        weight_grams: body.weight_grams,
        active: body.active,
        featured: body.featured,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Sincronizar imágenes
    const images: ImagePayload[] = body.images ?? []

    // Borrar las marcadas como deleted (tienen id del DB, no isNew)
    const toDelete = images.filter((i) => i.isDeleted && !i.isNew)
    if (toDelete.length > 0) {
      await supabase
        .from('product_images')
        .delete()
        .in(
          'id',
          toDelete.map((i) => i.id)
        )
    }

    // Actualizar is_primary en todas las imágenes que ya existían
    const existing = images.filter((i) => !i.isNew && !i.isDeleted)
    for (const img of existing) {
      await supabase
        .from('product_images')
        .update({ is_primary: img.is_primary })
        .eq('id', img.id)
    }

    // Insertar las nuevas
    const newImages = images.filter((i) => i.isNew && !i.isDeleted)
    if (newImages.length > 0) {
      await supabase.from('product_images').insert(
        newImages.map((img, idx) => ({
          product_id: id,
          url: img.url,
          position: existing.length + idx,
          is_primary: img.is_primary,
        }))
      )
    }

    // Sincronizar variantes
    const variants: VariantPayload[] = body.variants ?? []
    const hasVariants: boolean = body.has_variants ?? false

    if (!hasVariants) {
      // Si el admin desactivó el toggle, eliminamos todas las variantes
      await supabase.from('product_variants').delete().eq('product_id', id)
    } else {
      // Borrar las marcadas como deleted (tienen id del DB)
      const variantsToDelete = variants.filter((v) => v.isDeleted && !v.isNew)
      if (variantsToDelete.length > 0) {
        await supabase
          .from('product_variants')
          .delete()
          .in(
            'id',
            variantsToDelete.map((v) => v.id)
          )
      }

      // Actualizar las que ya existían (label/position pueden haber cambiado)
      const existingVariants = variants.filter((v) => !v.isNew && !v.isDeleted)
      for (const v of existingVariants) {
        await supabase
          .from('product_variants')
          .update({ label: v.label, position: v.position })
          .eq('id', v.id)
      }

      // Insertar las nuevas
      const newVariants = variants.filter((v) => v.isNew && !v.isDeleted)
      if (newVariants.length > 0) {
        await supabase.from('product_variants').insert(
          newVariants.map((v) => ({
            product_id: id,
            label: v.label,
            position: v.position,
          }))
        )
      }
    }

    return NextResponse.json({ product })
  } catch (err) {
    console.error('[Products PUT] Error:', err)
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

    // Las imágenes se borran en cascade por la FK
    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Products DELETE] Error:', err)
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
