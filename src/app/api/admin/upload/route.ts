import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/admin'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest) {
  const { admin, error, status } = await requireAdmin()
  if (!admin) return NextResponse.json({ error }, { status })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'products'

    if (!file) {
      return NextResponse.json({ error: 'No se envió archivo' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'El archivo debe ser una imagen' },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'El archivo excede el máximo de 5MB' },
        { status: 400 }
      )
    }

    const bucket =
      folder === 'categories' ? 'category-images' : 'product-images'
    const ext = file.name.split('.').pop() ?? 'jpg'
    const fileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`
    const path = `${folder}/${fileName}`

    const buffer = Buffer.from(await file.arrayBuffer())

    const supabase = createServiceClient()
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type,
        cacheControl: '31536000',
        upsert: false,
      })

    if (uploadError) {
      console.error('[Upload] Error:', uploadError)
      return NextResponse.json(
        { error: `Error subiendo: ${uploadError.message}` },
        { status: 500 }
      )
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path)

    return NextResponse.json({ url: publicUrl, path })
  } catch (err) {
    console.error('[Upload] Error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
