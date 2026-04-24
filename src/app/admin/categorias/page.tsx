import { createServiceClient } from '@/lib/supabase/server'
import type { Category } from '@/types/product'
import CategoriasManager from '../components/CategoriasManager'
import AdminShell from '../components/AdminShell'

export const dynamic = 'force-dynamic'

async function getCategorias(): Promise<Category[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('position', { ascending: true })
  return (data ?? []) as Category[]
}

export default async function AdminCategoriasPage() {
  const categorias = await getCategorias()

  return (
    <AdminShell>
      <div className="mt-16 lg:mt-0">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="h-px w-8 bg-primary-500" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary-700">
              Categorías
            </span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-neutral-800">
            Organizá tu <span className="italic text-gradient-gold">catálogo</span>
          </h1>
          <p className="text-neutral-600 text-sm mt-2">
            Creá categorías para agrupar productos. Aparecen como filtros en la tienda.
          </p>
        </header>

        <CategoriasManager initialCategorias={categorias} />
      </div>
    </AdminShell>
  )
}
