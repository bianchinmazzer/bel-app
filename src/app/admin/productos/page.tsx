import Link from 'next/link'
import Image from 'next/image'
import { createServiceClient } from '@/lib/supabase/server'
import type { Product } from '@/types/product'
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline'
import { formatARS } from '@/lib/formatters'
import AdminShell from '../components/AdminShell'

export const dynamic = 'force-dynamic'

async function getProducts(): Promise<Product[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('products')
    .select(
      `*,
      category:categories(*),
      images:product_images(*),
      variants:product_variants(id, label)`
    )
    .order('created_at', { ascending: false })
  return (data ?? []) as Product[]
}

export default async function AdminProductosPage() {
  const productos = await getProducts()

  return (
    <AdminShell>
      <div className="mt-16 lg:mt-0">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="h-px w-8 bg-primary-500" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary-700">
              Productos
            </span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-neutral-800">
            Catálogo
          </h1>
          <p className="text-neutral-600 text-sm mt-2">
            {productos.length} producto{productos.length !== 1 ? 's' : ''} en total
          </p>
        </div>

        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center gap-2 bg-neutral-800 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Nuevo producto</span>
        </Link>
      </header>

      {productos.length === 0 ? (
        <div className="bg-white border border-primary-100 rounded-2xl p-12 text-center">
          <p className="font-display text-xl text-neutral-600 mb-2">
            Todavía no hay productos cargados
          </p>
          <p className="text-sm text-neutral-500 mb-6">
            Empezá agregando el primer producto a tu catálogo.
          </p>
          <Link
            href="/admin/productos/nuevo"
            className="inline-flex items-center gap-2 bg-neutral-800 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Cargar primer producto</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-primary-100 rounded-2xl overflow-hidden">
          {/* Header tabla desktop */}
          <div className="hidden md:grid md:grid-cols-[80px_2fr_1fr_100px_100px_80px_60px] gap-3 px-5 py-3 border-b border-primary-100 bg-neutral-50 text-[10px] uppercase tracking-wider text-neutral-500 font-mono">
            <div>Imagen</div>
            <div>Producto</div>
            <div>Categoría</div>
            <div className="text-right">Precio</div>
            <div className="text-center">Stock</div>
            <div className="text-center">Estado</div>
            <div></div>
          </div>

          {productos.map((p) => {
            const img =
              p.images?.find((i) => i.is_primary)?.url ??
              p.images?.[0]?.url ??
              '/bel-logo.png'
            return (
              <div
                key={p.id}
                className="grid grid-cols-[60px_1fr_40px] md:grid-cols-[80px_2fr_1fr_100px_100px_80px_60px] gap-3 px-5 py-4 border-b border-primary-50 last:border-b-0 items-center hover:bg-primary-50/30 transition-colors"
              >
                <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden bg-neutral-100 border border-primary-100 flex-shrink-0">
                  <Image
                    src={img}
                    alt={p.name}
                    fill
                    className="object-contain p-1"
                    sizes="64px"
                  />
                </div>

                <div className="min-w-0">
                  <p className="font-medium text-sm text-neutral-800 line-clamp-2">
                    {p.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider">
                      SKU: {p.sku}
                    </p>
                    {(p.variants?.length ?? 0) > 0 && (
                      <span className="inline-flex items-center gap-1 bg-primary-100 text-primary-800 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        {p.variants!.length} tono{p.variants!.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {/* Info mobile inline */}
                  <div className="md:hidden flex items-center gap-3 mt-2 text-xs">
                    <span className="font-bold text-neutral-800">
                      {formatARS(p.price_ars)}
                    </span>
                    <span className="text-neutral-500">Stock: {p.stock}</span>
                  </div>
                </div>

                <div className="hidden md:block text-sm text-neutral-600 truncate">
                  {p.category?.name ?? '—'}
                </div>

                <div className="hidden md:block text-right text-sm font-semibold text-neutral-800">
                  {formatARS(p.price_ars)}
                </div>

                <div className="hidden md:block text-center">
                  <span
                    className={`text-sm font-medium ${
                      p.stock === 0
                        ? 'text-red-600'
                        : p.stock < 5
                          ? 'text-yellow-600'
                          : 'text-neutral-700'
                    }`}
                  >
                    {p.stock}
                  </span>
                </div>

                <div className="hidden md:flex justify-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      p.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    {p.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <Link
                  href={`/admin/productos/${p.id}`}
                  className="text-neutral-500 hover:text-primary-700 transition-colors flex items-center justify-center p-2"
                  aria-label="Editar"
                >
                  <PencilIcon className="w-4 h-4" />
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
    </AdminShell>
  )
}
