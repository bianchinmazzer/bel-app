'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  TruckIcon,
  CreditCardIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'
import { useCart } from '@/store/cart'
import PriceDisplay from '@/app/components/PriceDisplay'
import { SNAPSHOT_KEY, type OrderSnapshot, type PayMethod } from '@/lib/order-message'
import type { ShippingAddress } from '@/types/order'

/** Ícono simple de WhatsApp para el botón de coordinación manual. */
function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

export default function CheckoutPage() {
  const { items } = useCart()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const [customer, setCustomer] = useState({
    nombre: '',
    email: '',
    telefono: '',
  })
  const [address, setAddress] = useState<ShippingAddress>({
    calle: '',
    numero: '',
    piso_dpto: '',
    ciudad: '',
    provincia: '',
    codigo_postal: '',
  })
  const [deliveryType, setDeliveryType] = useState<'D' | 'S'>('D')
  const [method, setMethod] = useState<PayMethod>('mercadopago')
  /** Descuento (%) por transferencia. Lo configura el dueño desde el admin. */
  const [transferDiscountPercent, setTransferDiscountPercent] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => setTransferDiscountPercent(Number(d.mp_discount_percent) || 0))
      .catch(() => {})
  }, [])
  useEffect(() => {
    if (mounted && items.length === 0) router.push('/carrito')
  }, [mounted, items, router])

  const subtotal = items.reduce((sum, i) => sum + i.price_ars * i.quantity, 0)
  // El envío ya no se cotiza en el checkout: se coordina por WhatsApp con el
  // dueño. El descuento solo aplica si el cliente elige transferencia.
  const discount =
    method === 'transferencia' && transferDiscountPercent > 0
      ? Math.round((subtotal * transferDiscountPercent) / 100)
      : 0
  const total = subtotal - discount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Foto del pedido para la pantalla final (arma el WhatsApp al dueño).
    const snapshot: OrderSnapshot = {
      method,
      items: items.map((i) => ({
        name: i.name,
        variant_label: i.variant_label,
        quantity: i.quantity,
        price_ars: i.price_ars,
      })),
      customer,
      address,
      deliveryType,
      subtotal_ars: subtotal,
      discount_ars: discount,
      total_ars: total,
      ref: null,
    }

    try {
      if (method === 'mercadopago') {
        // Mercado Pago: creamos la orden + preferencia y redirigimos a pagar.
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items,
            customer,
            shipping_address: address,
            shipping_cost_ars: 0,
            delivery_type: deliveryType,
            provider: 'mercadopago',
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Error procesando el pago')
        snapshot.ref = data.order_id ?? null
        localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot))
        window.location.href = data.redirect_url
        return
      }

      // Transferencia / 3 cuotas: no hay pasarela. Guardamos el pedido para la
      // pantalla final, que abre WhatsApp con el detalle para coordinar.
      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot))
      router.push('/pago/exito')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error procesando el pago')
      setLoading(false)
    }
  }

  if (!mounted || items.length === 0) return null

  const submitLabel =
    method === 'mercadopago' ? 'Pagar con Mercado Pago' : 'Coordinar por WhatsApp'

  return (
    <main className="min-h-screen bg-neutral-50 pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/carrito"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-700 transition-colors mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Volver al carrito</span>
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-8 bg-primary-500" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary-700">
              Checkout
            </span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-neutral-800">
            Finalizá tu <span className="italic text-gradient-gold">compra</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2 space-y-6">
            {/* Datos personales */}
            <section className="bg-white rounded-2xl border border-primary-100 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-5">
                <UserIcon className="w-5 h-5 text-primary-600" strokeWidth={1.5} />
                <h2 className="font-display font-bold text-xl text-neutral-800">
                  Tus datos
                </h2>
              </div>
              <div className="space-y-4">
                <Input
                  icon={UserIcon}
                  label="Nombre completo"
                  value={customer.nombre}
                  onChange={(v) => setCustomer({ ...customer, nombre: v })}
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    icon={EnvelopeIcon}
                    label="Email"
                    type="email"
                    value={customer.email}
                    onChange={(v) => setCustomer({ ...customer, email: v })}
                    required
                  />
                  <Input
                    icon={PhoneIcon}
                    label="Teléfono"
                    type="tel"
                    value={customer.telefono}
                    onChange={(v) => setCustomer({ ...customer, telefono: v })}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Envío */}
            <section className="bg-white rounded-2xl border border-primary-100 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-5">
                <TruckIcon className="w-5 h-5 text-primary-600" strokeWidth={1.5} />
                <h2 className="font-display font-bold text-xl text-neutral-800">
                  Envío
                </h2>
              </div>

              {/* Selector domicilio / sucursal */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {(
                  [
                    ['D', 'A domicilio', 'Te lo llevamos a la puerta'],
                    ['S', 'A sucursal', 'Retirás en una sucursal OCA'],
                  ] as const
                ).map(([value, title, subtitle]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDeliveryType(value)}
                    className={`text-left rounded-xl border p-4 transition-colors ${
                      deliveryType === value
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-100'
                        : 'border-primary-200 bg-neutral-50 hover:border-primary-300'
                    }`}
                  >
                    <span className="block font-display font-bold text-neutral-800">
                      {title}
                    </span>
                    <span className="block text-xs text-neutral-500 mt-0.5">
                      {subtitle}
                    </span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {deliveryType === 'D' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
                      <Input
                        label="Calle"
                        value={address.calle}
                        onChange={(v) => setAddress({ ...address, calle: v })}
                        required
                      />
                      <Input
                        label="Número"
                        value={address.numero}
                        onChange={(v) => setAddress({ ...address, numero: v })}
                        required
                      />
                    </div>
                    <Input
                      label="Piso / Dpto (opcional)"
                      value={address.piso_dpto}
                      onChange={(v) => setAddress({ ...address, piso_dpto: v })}
                    />
                  </>
                )}

                {deliveryType === 'S' && (
                  <p className="text-sm text-neutral-600 bg-neutral-50 border border-primary-100 rounded-lg p-3">
                    Retirás tu pedido en una sucursal OCA.
                    Ingresá tu <strong>localidad y código postal</strong>;{' '}
                    <strong>coordinamos la sucursal exacta y el costo del envío
                    por WhatsApp</strong> después de la compra.
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Ciudad / Localidad"
                    value={address.ciudad}
                    onChange={(v) => setAddress({ ...address, ciudad: v })}
                    required
                  />
                  <Input
                    label="Provincia"
                    value={address.provincia}
                    onChange={(v) => setAddress({ ...address, provincia: v })}
                    required
                  />
                </div>
                <Input
                  label="Código postal"
                  value={address.codigo_postal}
                  onChange={(v) => setAddress({ ...address, codigo_postal: v })}
                  required
                />
                <p className="text-xs text-neutral-500">
                  El costo del envío lo coordinamos por WhatsApp con estos datos.
                </p>
              </div>
            </section>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-primary-100 p-6 sticky top-28 shadow-gold-sm">
              <h2 className="font-display font-bold text-xl text-neutral-800 mb-5">
                Tu pedido
              </h2>

              <div className="space-y-3 mb-5 pb-5 border-b border-primary-100 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-start">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-neutral-700 line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        ×{item.quantity}
                      </p>
                    </div>
                    <PriceDisplay
                      centavos={item.price_ars * item.quantity}
                      className="text-xs font-semibold text-neutral-700"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-5 pb-5 border-b border-primary-100 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <PriceDisplay centavos={subtotal} />
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-700 font-medium">
                    <span>Descuento transferencia (-{transferDiscountPercent}%)</span>
                    <span>
                      -<PriceDisplay centavos={discount} className="inline" />
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>Envío</span>
                  <span className="text-xs text-neutral-400">A coordinar</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline mb-5">
                <span className="font-medium text-neutral-800">Total</span>
                <PriceDisplay
                  centavos={total}
                  className="font-display font-bold text-2xl text-neutral-900"
                />
              </div>

              <div className="mb-5">
                <p className="text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
                  Medio de pago
                </p>
                <div className="space-y-2">
                  {(
                    [
                      {
                        id: 'mercadopago',
                        label: 'Mercado Pago',
                        desc: 'Pagás online con tarjeta, dinero en cuenta o efectivo.',
                      },
                      {
                        id: 'transferencia',
                        label:
                          transferDiscountPercent > 0
                            ? `Transferencia · ${transferDiscountPercent}% OFF`
                            : 'Transferencia',
                        desc: 'Te pasamos el alias por WhatsApp para coordinar.',
                      },
                      {
                        id: 'tres_cuotas',
                        label: '3 cuotas sin interés',
                        desc: 'Te enviamos el link de pago por WhatsApp.',
                      },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setMethod(opt.id)}
                      className={`w-full text-left rounded-lg border px-3 py-2.5 transition-colors ${
                        method === opt.id
                          ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-100'
                          : 'border-primary-200 bg-white hover:border-primary-300'
                      }`}
                    >
                      <span
                        className={`block text-sm font-medium ${
                          method === opt.id ? 'text-primary-800' : 'text-neutral-700'
                        }`}
                      >
                        {opt.label}
                      </span>
                      <span className="block text-xs text-neutral-500 mt-0.5">
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full disabled:bg-neutral-300 text-white py-3.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  method === 'mercadopago'
                    ? 'bg-neutral-800 hover:bg-primary-700'
                    : 'bg-[#25D366] hover:bg-[#1DA851]'
                }`}
              >
                {method === 'mercadopago' ? (
                  <CreditCardIcon className="w-5 h-5" strokeWidth={1.5} />
                ) : (
                  <WhatsAppGlyph className="w-5 h-5" />
                )}
                <span>{loading ? 'Procesando...' : submitLabel}</span>
              </button>
              <p className="text-xs text-neutral-500 text-center mt-3">
                {method === 'mercadopago'
                  ? 'Serás redirigido a Mercado Pago para completar el pago de forma segura.'
                  : 'Te abrimos WhatsApp con el detalle del pedido ya escrito para coordinar el pago y el envío.'}
              </p>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}

function Input({
  icon: Icon,
  label,
  type = 'text',
  value,
  onChange,
  required = false,
}: {
  icon?: React.ComponentType<{ className?: string }>
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
        {label} {required && <span className="text-primary-600">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={`w-full ${
            Icon ? 'pl-10' : 'pl-4'
          } pr-4 py-3 border border-primary-200 rounded-lg bg-neutral-50 focus:bg-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all text-sm`}
        />
      </div>
    </div>
  )
}
