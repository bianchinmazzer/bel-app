import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { articles } from '@/lib/blog'
import { createServerClient } from '@/lib/supabase/server'

// Regeneramos el sitemap cada hora para que aparezcan los productos nuevos
// sin depender de un rebuild.
export const revalidate = 3600

/** Trae slugs de productos activos y de categorías desde Supabase (best-effort). */
async function getDynamicEntries(): Promise<{
  products: { slug: string; updatedAt: string }[]
  categories: string[]
}> {
  try {
    const supabase = createServerClient()

    const [{ data: products }, { data: categories }] = await Promise.all([
      supabase
        .from('products')
        .select('slug, updated_at')
        .eq('active', true),
      supabase
        .from('categories')
        .select('slug')
        .eq('active', true),
    ])

    return {
      products: (products ?? []).map((p) => ({
        slug: p.slug as string,
        updatedAt: (p.updated_at as string) ?? new Date().toISOString(),
      })),
      categories: (categories ?? []).map((c) => c.slug as string),
    }
  } catch (error) {
    console.error('[sitemap] No se pudieron obtener productos/categorías:', error)
    return { products: [], categories: [] }
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const { products, categories } = await getDynamicEntries()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/tienda`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/mayoristas`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/terminos-condiciones`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/politica-privacidad`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((slug) => ({
    url: `${SITE_URL}/tienda?categoria=${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/tienda/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const blogRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/blog/${a.slug}`,
    lastModified: new Date(a.date),
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes]
}
