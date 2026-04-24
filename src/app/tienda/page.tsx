import { createServerClient } from '@/lib/supabase/server'
import type { Product, Category } from '@/types/product'
import ShopProductCard from '@/app/components/ShopProductCard'
import CategoryFilter from '@/app/components/CategoryFilter'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Tienda | Bel Distribuciones',
  description:
    'Comprá online productos de peluquería, estética y hogar. Envíos a todo el país. Precios mayoristas y minoristas.',
}

interface PageProps {
  searchParams: Promise<{ categoria?: string }>
}

async function getCategorias(): Promise<Category[]> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('active', true)
    .order('position', { ascending: true })
  return (data ?? []) as Category[]
}

async function getProducts(categoriaSlug?: string): Promise<Product[]> {
  const supabase = createServerClient()

  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*),
      variants:product_variants(*)
    `)
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (categoriaSlug) {
    // Primero obtenemos el id de la categoría
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categoriaSlug)
      .single()

    if (cat) {
      query = query.eq('category_id', cat.id)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('[Tienda] Error fetching products:', error)
    return []
  }

  return data as Product[]
}

export default async function TiendaPage({ searchParams }: PageProps) {
  const params = await searchParams
  const categoriaSlug = params.categoria

  const [productos, categorias] = await Promise.all([
    getProducts(categoriaSlug),
    getCategorias(),
  ])

  const categoriaActual = categoriaSlug
    ? categorias.find((c) => c.slug === categoriaSlug)
    : null

  return (
    <main className="min-h-screen bg-neutral-50 pt-24 pb-20">
      {/* Header de la tienda */}
      <div className="bg-gradient-to-b from-primary-50 to-neutral-50 border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-8 bg-primary-500" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary-700">
              Tienda online
            </span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-neutral-800 leading-tight mb-3">
            {categoriaActual ? (
              <>
                {categoriaActual.name}{' '}
                <span className="italic text-gradient-gold">
                  en Bel
                </span>
              </>
            ) : (
              <>
                Nuestro <span className="italic text-gradient-gold">catálogo</span>
              </>
            )}
          </h1>
          <p className="text-neutral-600 text-sm md:text-base max-w-2xl">
            {categoriaActual?.description ??
              'Productos seleccionados con la misma calidad que distribuimos a comercios hace 27 años. Envíos a todo el país.'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        {/* Filtro de categorías */}
        <CategoryFilter categorias={categorias} activeSlug={categoriaSlug} />

        {/* Resultados */}
        <div className="mt-8 mb-6 flex items-baseline justify-between">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            {productos.length} producto{productos.length !== 1 ? 's' : ''}
          </p>
        </div>

        {productos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-primary-100">
            <p className="font-display text-xl text-neutral-600 mb-2">
              Estamos cargando productos
            </p>
            <p className="text-sm text-neutral-500">
              Volvé pronto — muy pronto vamos a tener novedades.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {productos.map((product) => (
              <ShopProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
