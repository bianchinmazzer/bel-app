import { createServerClient } from '@/lib/supabase/server'
import type { Product } from '@/types/product'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SITE_NAME, absoluteUrl } from '@/lib/site'
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
    alternates: { canonical: `/tienda/${slug}` },
    openGraph: {
      title: `${product.name} | Bel Distribuciones`,
      description:
        product.description ??
        `Comprá ${product.name} con envío a todo el país desde Bel Distribuciones.`,
      url: `/tienda/${slug}`,
      type: 'website',
      images: image ? [image] : undefined,
    },
  }
}

/** Datos estructurados Product (JSON-LD) para rich results en Google. */
function productJsonLd(product: Product) {
  const images = (product.images ?? [])
    .slice()
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
    .map((i) => i.url)

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description:
      product.description ??
      `${product.name} disponible en Bel Distribuciones con envío a todo el país.`,
    sku: product.sku,
    ...(images.length > 0 ? { image: images } : {}),
    ...(product.category?.name
      ? { category: product.category.name }
      : {}),
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/tienda/${product.slug}`),
      priceCurrency: 'ARS',
      price: product.price_ars,
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) notFound()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
      />
      <ProductDetail product={product} />
    </>
  )
}
