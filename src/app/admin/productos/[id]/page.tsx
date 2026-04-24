import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { createServiceClient } from '@/lib/supabase/server'
import type { Product, Category } from '@/types/product'
import ProductForm from '../../components/ProductForm'
import AdminShell from '../../components/AdminShell'

export const dynamic = 'force-dynamic'

async function getData(id: string): Promise<{ product: Product | null; categories: Category[] }> {
  const supabase = createServiceClient()
  const [productRes, categoriesRes] = await Promise.all([
    supabase
      .from('products')
      .select(
        `*, category:categories(*), images:product_images(*), variants:product_variants(*)`
      )
      .eq('id', id)
      .single(),
    supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('position'),
  ])

  return {
    product: (productRes.data as Product) ?? null,
    categories: (categoriesRes.data ?? []) as Category[],
  }
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarProductoPage({ params }: Props) {
  const { id } = await params
  const { product, categories } = await getData(id)

  if (!product) notFound()

  return (
    <AdminShell>
      <div className="mt-16 lg:mt-0">
        <Link
          href="/admin/productos"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-700 transition-colors mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Volver a productos</span>
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="h-px w-8 bg-primary-500" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary-700">
              Editar producto · SKU {product.sku}
            </span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-neutral-800 line-clamp-2">
            {product.name}
          </h1>
        </header>

        <ProductForm product={product} categories={categories} />
      </div>
    </AdminShell>
  )
}
