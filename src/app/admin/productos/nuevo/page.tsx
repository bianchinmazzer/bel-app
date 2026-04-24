import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { createServiceClient } from '@/lib/supabase/server'
import type { Category } from '@/types/product'
import ProductForm from '../../components/ProductForm'
import AdminShell from '../../components/AdminShell'

export const dynamic = 'force-dynamic'

async function getCategorias(): Promise<Category[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('active', true)
    .order('position')
  return (data ?? []) as Category[]
}

export default async function NuevoProductoPage() {
  const categorias = await getCategorias()

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
              Nuevo producto
            </span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-neutral-800">
            Agregar al <span className="italic text-gradient-gold">catálogo</span>
          </h1>
        </header>

        <ProductForm categories={categorias} />
      </div>
    </AdminShell>
  )
}
