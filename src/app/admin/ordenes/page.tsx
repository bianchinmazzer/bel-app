import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { formatARS, formatDate } from '@/lib/formatters'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import AdminShell from '../components/AdminShell'
import OrderStatusBadge from '../components/OrderStatusBadge'
import type { Order } from '@/types/order'

export const dynamic = 'force-dynamic'

type OrderRow = Pick<
  Order,
  'id' | 'customer_name' | 'total_ars' | 'status' | 'created_at' | 'items'
>

async function getOrders(): Promise<OrderRow[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('orders')
    .select('id, customer_name, total_ars, status, created_at, items')
    .order('created_at', { ascending: false })
  return (data ?? []) as OrderRow[]
}

export default async function AdminOrdenesPage() {
  const orders = await getOrders()
  const aprobadas = orders.filter((o) => o.status === 'approved').length

  return (
    <AdminShell>
      <div className="mt-16 lg:mt-0">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="h-px w-8 bg-primary-500" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary-700">
              Pedidos
            </span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-neutral-800">
            Órdenes
          </h1>
          <p className="text-neutral-600 text-sm mt-2">
            {orders.length} orden{orders.length !== 1 ? 'es' : ''} en total ·{' '}
            {aprobadas} aprobada{aprobadas !== 1 ? 's' : ''}
          </p>
        </header>

        {orders.length === 0 ? (
          <div className="bg-white border border-primary-100 rounded-2xl p-12 text-center">
            <p className="font-display text-xl text-neutral-600 mb-2">
              Todavía no hay pedidos
            </p>
            <p className="text-sm text-neutral-500">
              Cuando alguien compre en la tienda, vas a verlo acá.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-primary-100 rounded-2xl overflow-hidden">
            {/* Header tabla desktop */}
            <div className="hidden md:grid md:grid-cols-[120px_2fr_1fr_100px_120px_40px] gap-3 px-5 py-3 border-b border-primary-100 bg-neutral-50 text-[10px] uppercase tracking-wider text-neutral-500 font-mono">
              <div>Pedido</div>
              <div>Cliente</div>
              <div>Fecha</div>
              <div className="text-center">Estado</div>
              <div className="text-right">Total</div>
              <div></div>
            </div>

            {orders.map((o) => {
              const cantItems = Array.isArray(o.items)
                ? o.items.reduce((s, i) => s + (i.quantity ?? 0), 0)
                : 0
              return (
                <Link
                  key={o.id}
                  href={`/admin/ordenes/${o.id}`}
                  className="grid grid-cols-[1fr_auto] md:grid-cols-[120px_2fr_1fr_100px_120px_40px] gap-3 px-5 py-4 border-b border-primary-50 last:border-b-0 items-center hover:bg-primary-50/30 transition-colors"
                >
                  <div className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 order-1">
                    #{o.id.slice(0, 8)}
                  </div>

                  <div className="min-w-0 order-3 md:order-2 col-span-2 md:col-span-1">
                    <p className="font-medium text-sm text-neutral-800 truncate">
                      {o.customer_name}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {cantItems} artículo{cantItems !== 1 ? 's' : ''}
                    </p>
                    {/* Fecha + total inline en mobile */}
                    <div className="md:hidden flex items-center gap-3 mt-1.5 text-xs">
                      <span className="text-neutral-500">
                        {formatDate(o.created_at)}
                      </span>
                      <span className="font-bold text-neutral-800">
                        {formatARS(o.total_ars ?? 0)}
                      </span>
                    </div>
                  </div>

                  <div className="hidden md:block text-sm text-neutral-600 order-3">
                    {formatDate(o.created_at)}
                  </div>

                  <div className="flex md:justify-center order-2 md:order-4">
                    <OrderStatusBadge status={o.status} />
                  </div>

                  <div className="hidden md:block text-right text-sm font-semibold text-neutral-800 order-5">
                    {formatARS(o.total_ars ?? 0)}
                  </div>

                  <div className="hidden md:flex justify-center text-neutral-400 order-6">
                    <ChevronRightIcon className="w-4 h-4" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </AdminShell>
  )
}
