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

interface ProductPayload {
  name: string
  sku: string
  slug: string
  description: string | null
  category_id: string | null
  price_ars: number
  stock: number
  weight_grams: number
  active: boolean
  featured: boolean
  images?: ImagePayload[]
  variants?: VariantPayload[]
  has_variants?: boolean
}

export async function POST(req: NextRequest) {
  const { admin, error: authError, status } = await requireAdmin()
  if (!admin) return NextResponse.json({ error: authError }, { status })

  try {
    const body = (await req.json()) as ProductPayload

    if (!body.name || !body.sku || !body.slug) {
      return NextResponse.json(
        { error: 'Nombre, SKU y slug son requeridos' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Chequear unicidad de SKU y slug
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .or(`sku.eq.${body.sku},slug.eq.${body.slug}`)
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe un producto con ese SKU o slug' },
        { status: 409 }
      )
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert({
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
      })
      .select()
      .single()

    if (error) throw error

    // Insertar imágenes
    const newImages = (body.images ?? []).filter((i) => i.isNew && !i.isDeleted)
    if (newImages.length > 0) {
      const { error: imgError } = await supabase.from('product_images').insert(
        newImages.map((img, idx) => ({
          product_id: product.id,
          url: img.url,
          position: idx,
          is_primary: img.is_primary,
        }))
      )
      if (imgError) console.error('[Products POST] Error imágenes:', imgError)
    }

    // Insertar variantes (si hay)
    const newVariants = (body.variants ?? []).filter((v) => !v.isDeleted)
    if (body.has_variants && newVariants.length > 0) {
      const { error: varError } = await supabase.from('product_variants').insert(
        newVariants.map((v) => ({
          product_id: product.id,
          label: v.label,
          position: v.position,
        }))
      )
      if (varError) console.error('[Products POST] Error variantes:', varError)
    }

    return NextResponse.json({ product })
  } catch (err) {
    console.error('[Products POST] Error:', err)
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
