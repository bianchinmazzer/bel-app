import { createServerClient } from '@/lib/supabase/server'
import type { Product } from '@/types/product'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ProductDetail from './ProductDetail'

interface Props {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string): Promise<Product | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*),
      variants:product_variants(*)
    `)
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (error || !data) return null
  return data as Product
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return {}

  const image = product.images?.find((i) => i.is_primary)?.url ?? product.images?.[0]?.url

  return {
    title: `${product.name} | Bel Distribuciones`,
    description:
      product.description ??
      `Comprá ${product.name} con envío a todo el país desde Bel Distribuciones.`,
    openGraph: image ? { images: [image] } : undefined,
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) notFound()

  return <ProductDetail product={product} />
}
