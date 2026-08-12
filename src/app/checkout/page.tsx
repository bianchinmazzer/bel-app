'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  TruckIcon,
  CreditCardIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'
import { useCart } from '@/store/cart'
import PriceDisplay from '@/app/components/PriceDisplay'
import type { ShippingAddress, PaymentProvider } from '@/types/order'

interface QuoteResponse {
  costo_ars: number
  metodo: string
  dias_estimados: string
  estimado: boolean
}

/** Getnet solo se ofrece cuando está habilitado por env (credenciales listas). */
const GETNET_ENABLED = process.env.NEXT_PUBLIC_GETNET_ENABLED === 'true'

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
  const [shipping, setShipping] = useState<QuoteResponse | null>(null)
  const [provider, setProvider] = useState<PaymentProvider>('mercadopago')
  const [mpDiscountPercent, setMpDiscountPercent] = useState(0)
  const [quoting, setQuoting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => setMpDiscountPercent(Number(d.mp_discount_percent) || 0))
      .catch(() => {})
  }, [])
  useEffect(() => {
    if (mounted && items.length === 0) router.push('/carrito')
  }, [mounted, items, router])

  const subtotal = items.reduce((sum, i) => sum + i.price_ars * i.quantity, 0)
  const pesoTotal = items.reduce((sum, i) => sum + i.weight_grams * i.quantity, 0)
  // La bonificación por Mercado Pago se muestra acá; el backend la recalcula y
  // es el valor autoritativo de lo que efectivamente se cobra.
  const discount =
    provider === 'mercadopago' && mpDiscountPercent > 0
      ? Math.round((subtotal * mpDiscountPercent) / 100)
      : 0
  const total = subtotal - discount + (shipping?.costo_ars ?? 0)

  const handleCotizar = async () => {
    if (!address.codigo_postal || address.codigo_postal.length < 4) {
      setError('Ingresá un código postal válido')
      return
    }
    setError(null)
    setQuoting(true)
    try {
      const res = await fetch('/api/shipping/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cp_destino: address.codigo_postal,
          peso_gramos: pesoTotal,
          largo_cm: 30,
          ancho_cm: 20,
          alto_cm: 15,
          valor_declarado: Math.floor(subtotal / 100),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error cotizando envío')
      setShipping(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cotizando envío')
    } finally {
      setQuoting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shipping) {
      setError('Primero cotizá el envío')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customer,
          shipping_address: address,
          shipping_cost_ars: shipping.costo_ars,
          provider,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error procesando el pago')
      window.location.href = data.redirect_url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error procesando el pago')
      setLoading(false)
    }
  }

  if (!mounted || items.length === 0) return null

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

            {/* Dirección */}
            <section className="bg-white rounded-2xl border border-primary-100 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-5">
                <MapPinIcon className="w-5 h-5 text-primary-600" strokeWidth={1.5} />
                <h2 className="font-display font-bold text-xl text-neutral-800">
                  Dirección de envío
                </h2>
              </div>
              <div className="space-y-4">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Ciudad"
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
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
                  <Input
                    label="Código postal"
                    value={address.codigo_postal}
                    onChange={(v) => setAddress({ ...address, codigo_postal: v })}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleCotizar}
                    disabled={quoting || !address.codigo_postal}
                    className="bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors whitespace-nowrap"
                  >
                    {quoting ? 'Cotizando...' : 'Cotizar envío'}
                  </button>
                </div>
              </div>
            </section>

            {/* Envío */}
            {shipping && (
              <section className="bg-primary-50 rounded-2xl border border-primary-200 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <TruckIcon className="w-5 h-5 text-primary-700" strokeWidth={1.5} />
                  <h2 className="font-display font-bold text-lg text-neutral-800">
                    Envío por Andreani
                  </h2>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-700">
                      Entrega en {shipping.dias_estimados}
                    </p>
                    {shipping.estimado && (
                      <p className="text-xs text-primary-700 mt-1">
                        * Tarifa estimada, se confirma al despacho
                      </p>
                    )}
                  </div>
                  <PriceDisplay
                    centavos={shipping.costo_ars}
                    className="font-display font-bold text-xl text-neutral-900"
                  />
                </div>
              </section>
            )}
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
                    <span>Bonificación Mercado Pago (-{mpDiscountPercent}%)</span>
                    <span>
                      -<PriceDisplay centavos={discount} className="inline" />
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>Envío</span>
                  {shipping ? (
                    <PriceDisplay centavos={shipping.costo_ars} />
                  ) : (
                    <span className="text-xs text-neutral-400">A cotizar</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-baseline mb-5">
                <span className="font-medium text-neutral-800">Total</span>
                <PriceDisplay
                  centavos={total}
                  className="font-display font-bold text-2xl text-neutral-900"
                />
              </div>

              {GETNET_ENABLED && (
                <div className="mb-5">
                  <p className="text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
                    Medio de pago
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: 'mercadopago', label: 'Mercado Pago' },
                        { id: 'getnet', label: 'Getnet · 3 cuotas sin interés' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setProvider(opt.id)}
                        className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                          provider === opt.id
                            ? 'border-primary-500 bg-primary-50 text-primary-800'
                            : 'border-primary-200 bg-white text-neutral-600 hover:border-primary-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !shipping}
                className="w-full bg-neutral-800 hover:bg-primary-700 disabled:bg-neutral-300 text-white py-3.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <CreditCardIcon className="w-5 h-5" strokeWidth={1.5} />
                <span>
                  {loading
                    ? 'Procesando...'
                    : provider === 'getnet'
                      ? 'Pagar con Getnet'
                      : 'Pagar con Mercado Pago'}
                </span>
              </button>
              <p className="text-xs text-neutral-500 text-center mt-3">
                Serás redirigido a {provider === 'getnet' ? 'Getnet' : 'Mercado Pago'}{' '}
                para completar el pago de forma segura.
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
