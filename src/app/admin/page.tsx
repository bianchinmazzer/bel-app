import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import {
  CubeIcon,
  TagIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { formatARS } from '@/lib/formatters'
import AdminShell from './components/AdminShell'

export const dynamic = 'force-dynamic'

async function getStats() {
  const supabase = createServiceClient()

  const [products, categories, orders, approvedOrders] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase
      .from('categories')
      .select('id', { count: 'exact', head: true })
      .eq('active', true),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select('total_ars')
      .eq('status', 'approved'),
  ])

  const revenueTotal =
    (approvedOrders.data ?? []).reduce(
      (sum, o) => sum + (o.total_ars ?? 0),
      0
    ) || 0

  return {
    totalProducts: products.count ?? 0,
    totalCategories: categories.count ?? 0,
    totalOrders: orders.count ?? 0,
    revenue: revenueTotal,
  }
}

async function getRecentOrders() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('orders')
    .select('id, customer_name, total_ars, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
  return data ?? []
}

export default async function AdminDashboardPage() {
  const [stats, recentOrders] = await Promise.all([
    getStats(),
    getRecentOrders(),
  ])

  return (
    <AdminShell>
      <div className="mt-16 lg:mt-0">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="h-px w-8 bg-primary-500" />
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary-700">
            Dashboard
          </span>
        </div>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-neutral-800">
          Bienvenido a tu <span className="italic text-gradient-gold">panel</span>
        </h1>
        <p className="text-neutral-600 text-sm mt-2">
          Un resumen de lo que está pasando en tu tienda.
        </p>
      </header>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          icon={CubeIcon}
          label="Productos"
          value={stats.totalProducts.toString()}
          href="/admin/productos"
        />
        <StatCard
          icon={TagIcon}
          label="Categorías"
          value={stats.totalCategories.toString()}
          href="/admin/categorias"
        />
        <StatCard
          icon={ShoppingCartIcon}
          label="Órdenes totales"
          value={stats.totalOrders.toString()}
        />
        <StatCard
          icon={CurrencyDollarIcon}
          label="Facturación"
          value={formatARS(stats.revenue)}
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <Link
          href="/admin/productos/nuevo"
          className="group bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-2xl p-6 hover:shadow-gold transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <PlusIcon className="w-10 h-10" strokeWidth={1.5} />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-100">
              Acción rápida
            </span>
          </div>
          <h3 className="font-display font-bold text-xl mb-1">
            Cargar producto nuevo
          </h3>
          <p className="text-sm text-primary-100">
            Agregá un producto al catálogo con fotos, precio y stock.
          </p>
        </Link>

        <Link
          href="/admin/categorias"
          className="group bg-white border border-primary-100 rounded-2xl p-6 hover:border-primary-300 hover:shadow-gold-sm transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <TagIcon
              className="w-10 h-10 text-primary-600"
              strokeWidth={1.5}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
              Organización
            </span>
          </div>
          <h3 className="font-display font-bold text-xl text-neutral-800 mb-1">
            Administrar categorías
          </h3>
          <p className="text-sm text-neutral-600">
            Creá o editá categorías para agrupar productos.
          </p>
        </Link>
      </div>

      {/* Órdenes recientes */}
      <section className="bg-white rounded-2xl border border-primary-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-primary-100">
          <h2 className="font-display font-bold text-xl text-neutral-800">
            Últimas órdenes
          </h2>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-10 text-center text-neutral-500 text-sm">
            Todavía no hay órdenes. Cuando alguien compre aparecerán acá.
          </div>
        ) : (
          <div className="divide-y divide-primary-50">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-primary-50/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-neutral-800 text-sm">
                    {order.customer_name}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 mt-1">
                    #{order.id.slice(0, 8)} ·{' '}
                    {new Date(order.created_at).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={order.status} />
                  <span className="font-display font-bold text-neutral-800 text-sm">
                    {formatARS(order.total_ars ?? 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
    </AdminShell>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  value: string
  href?: string
}) {
  const content = (
    <div className="bg-white border border-primary-100 rounded-2xl p-5 hover:border-primary-300 hover:shadow-gold-sm transition-all h-full">
      <div className="flex items-center gap-2 text-primary-600 mb-3">
        <Icon className="w-5 h-5" strokeWidth={1.5} />
        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
          {label}
        </span>
      </div>
      <div className="font-display font-bold text-2xl md:text-3xl text-neutral-800">
        {value}
      </div>
    </div>
  )
  return href ? <Link href={href}>{content}</Link> : content
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
    cancelled: 'bg-neutral-100 text-neutral-700',
  }
  const labels: Record<string, string> = {
    approved: 'Aprobada',
    pending: 'Pendiente',
    rejected: 'Rechazada',
    cancelled: 'Cancelada',
  }
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
        styles[status] ?? styles.cancelled
      }`}
    >
      {labels[status] ?? status}
    </span>
  )
}
