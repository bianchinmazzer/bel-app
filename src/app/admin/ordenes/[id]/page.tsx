import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { formatARS, formatDate } from '@/lib/formatters'
import {
  ArrowLeftIcon,
  UserIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'
import AdminShell from '../../components/AdminShell'
import OrderStatusBadge from '../../components/OrderStatusBadge'
import OrderActions from './OrderActions'
import type { Order } from '@/types/order'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

async function getOrder(id: string): Promise<Order | null> {
  const supabase = createServiceClient()
  const { data } = await supabase.from('orders').select('*').eq('id', id).single()
  return (data as Order) ?? null
}

export default async function AdminOrdenDetailPage({ params }: Props) {
  const { id } = await params
  const order = await getOrder(id)
  if (!order) notFound()

  const addr = order.shipping_address

  // Mensaje pre-escrito para que el dueño contacte al cliente por su teléfono.
  const customerPhone = order.customer_phone?.replace(/\D/g, '')
  const waMessage = `¡Hola ${order.customer_name}! Te escribimos de Bel Distribuciones por tu pedido #${order.id.slice(0, 8)} para coordinar el envío 📦`
  const waHref = customerPhone
    ? `https://wa.me/${customerPhone}?text=${encodeURIComponent(waMessage)}`
    : null

  return (
    <AdminShell>
      <div className="mt-16 lg:mt-0">
        <Link
          href="/admin/ordenes"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-700 transition-colors mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Volver a pedidos</span>
        </Link>

        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary-700">
                Pedido #{order.id.slice(0, 8)}
              </span>
              <OrderStatusBadge status={order.status} />
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-neutral-800">
              {order.customer_name}
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              {formatDate(order.created_at)}
            </p>
          </div>
          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white font-medium py-3 px-6 rounded-lg transition-colors self-start"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              <span>Contactar al cliente</span>
            </a>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Productos */}
            <section className="bg-white border border-primary-100 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-primary-100">
                <h2 className="font-display font-bold text-lg text-neutral-800">
                  Productos
                </h2>
              </div>
              <div className="divide-y divide-primary-50">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="px-6 py-4 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-800">
                        {item.name}
                        {item.variant_label ? (
                          <span className="text-neutral-500">
                            {' '}
                            ({item.variant_label})
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {formatARS(item.price_ars)} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-neutral-800 whitespace-nowrap">
                      {formatARS(item.price_ars * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 border-t border-primary-100 bg-neutral-50 space-y-1.5 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>{formatARS(order.subtotal_ars)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Envío</span>
                  <span>{formatARS(order.shipping_cost_ars)}</span>
                </div>
                <div className="flex justify-between font-display font-bold text-lg text-neutral-900 pt-1">
                  <span>Total</span>
                  <span>{formatARS(order.total_ars)}</span>
                </div>
              </div>
            </section>

            {/* Datos del cliente */}
            <section className="bg-white border border-primary-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <UserIcon className="w-5 h-5 text-primary-600" strokeWidth={1.5} />
                <h2 className="font-display font-bold text-lg text-neutral-800">
                  Cliente
                </h2>
              </div>
              <dl className="space-y-2 text-sm">
                <Row label="Nombre" value={order.customer_name} />
                <Row label="Email" value={order.customer_email} />
                <Row label="Teléfono" value={order.customer_phone || '—'} />
              </dl>
            </section>

            {/* Dirección de envío */}
            <section className="bg-white border border-primary-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPinIcon className="w-5 h-5 text-primary-600" strokeWidth={1.5} />
                <h2 className="font-display font-bold text-lg text-neutral-800">
                  Envío
                </h2>
              </div>
              <p className="text-sm text-neutral-700 leading-relaxed">
                {addr.calle} {addr.numero}
                {addr.piso_dpto ? `, ${addr.piso_dpto}` : ''}
                <br />
                {addr.ciudad}, {addr.provincia} ({addr.codigo_postal})
              </p>
              <p className="text-xs text-neutral-500 mt-3">
                Método: {order.shipping_method}
              </p>
            </section>
          </div>

          {/* Columna lateral: acciones */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <OrderActions
                orderId={order.id}
                initialStatus={order.status}
                initialTracking={order.andreani_tracking_number}
              />

              {/* Datos de pago */}
              <div className="bg-white border border-primary-100 rounded-2xl p-6 text-sm">
                <h2 className="font-display font-bold text-lg text-neutral-800 mb-4">
                  Pago
                </h2>
                <dl className="space-y-2">
                  <Row
                    label="Mercado Pago"
                    value={order.mp_payment_id ?? 'Sin pago registrado'}
                  />
                  <Row
                    label="Preference"
                    value={order.mp_preference_id?.slice(0, 16) ?? '—'}
                  />
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-neutral-800 font-medium text-right break-all">
        {value}
      </dd>
    </div>
  )
}
