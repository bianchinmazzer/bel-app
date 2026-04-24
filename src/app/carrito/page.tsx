'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  MinusIcon,
  PlusIcon,
  TrashIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import { useCart } from '@/store/cart'
import PriceDisplay from '@/app/components/PriceDisplay'
import { useEffect, useState } from 'react'

export default function CarritoPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCart()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <main className="min-h-screen bg-neutral-50 pt-24" />
  }

  const subtotal = items.reduce((sum, i) => sum + i.price_ars * i.quantity, 0)

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-neutral-50 pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="inline-flex w-20 h-20 rounded-full bg-primary-100 text-primary-700 items-center justify-center mb-6">
            <ShoppingBagIcon className="w-10 h-10" strokeWidth={1.5} />
          </div>
          <h1 className="font-display font-bold text-3xl text-neutral-800 mb-3">
            Tu carrito está vacío
          </h1>
          <p className="text-neutral-600 mb-8">
            Descubrí nuestro catálogo y encontrá los productos que necesitás.
          </p>
          <Link
            href="/tienda"
            className="inline-flex items-center gap-2 bg-neutral-800 hover:bg-primary-700 text-white font-medium py-3 px-8 rounded-full transition-colors"
          >
            <span>Ir a la tienda</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50 pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-8 bg-primary-500" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary-700">
              Tu carrito
            </span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-neutral-800">
            {items.reduce((s, i) => s + i.quantity, 0)} artículo
            {items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''} en tu carrito
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de items */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-primary-100 overflow-hidden">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-5 ${
                  idx !== items.length - 1 ? 'border-b border-primary-100' : ''
                }`}
              >
                <Link
                  href={`/tienda/${item.slug}`}
                  className="relative w-20 h-20 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0 border border-primary-100"
                >
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-contain p-2"
                    sizes="80px"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/tienda/${item.slug}`}
                    className="font-medium text-neutral-800 hover:text-primary-700 transition-colors line-clamp-2 text-sm md:text-base"
                  >
                    {item.name}
                    {item.variant_label && (
                      <span className="text-neutral-500"> ({item.variant_label})</span>
                    )}
                  </Link>
                  <PriceDisplay
                    centavos={item.price_ars}
                    className="text-sm text-neutral-500 mt-1 block"
                  />
                </div>

                {/* Cantidad */}
                <div className="flex items-center border border-primary-200 rounded-full">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-primary-700 transition-colors"
                  >
                    <MinusIcon className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-primary-700 transition-colors"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subtotal del item */}
                <PriceDisplay
                  centavos={item.price_ars * item.quantity}
                  className="hidden sm:inline text-sm font-bold text-neutral-800 w-24 text-right"
                />

                {/* Eliminar */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-neutral-400 hover:text-red-600 transition-colors p-2"
                  aria-label="Eliminar"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}

            <div className="p-5 border-t border-primary-100 bg-neutral-50">
              <button
                onClick={clearCart}
                className="text-xs text-neutral-500 hover:text-red-600 transition-colors font-medium uppercase tracking-wider"
              >
                Vaciar carrito
              </button>
            </div>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-primary-100 p-6 sticky top-28 shadow-gold-sm">
              <h2 className="font-display font-bold text-xl text-neutral-800 mb-5">
                Resumen del pedido
              </h2>

              <div className="space-y-3 mb-5 pb-5 border-b border-primary-100">
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Subtotal</span>
                  <PriceDisplay centavos={subtotal} className="font-medium text-neutral-800" />
                </div>
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Envío</span>
                  <span className="text-neutral-500 text-xs">
                    Se calcula en el checkout
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-baseline mb-6">
                <span className="font-medium text-neutral-800">Total</span>
                <PriceDisplay
                  centavos={subtotal}
                  className="font-display font-bold text-2xl text-neutral-900"
                />
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="w-full bg-neutral-800 hover:bg-primary-700 text-white py-3.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mb-3"
              >
                <span>Continuar al checkout</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>

              <Link
                href="/tienda"
                className="block w-full text-center border border-primary-200 hover:border-primary-400 text-neutral-700 py-3 rounded-lg font-medium transition-colors text-sm"
              >
                Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
