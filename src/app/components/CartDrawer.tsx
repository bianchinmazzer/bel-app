'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { XMarkIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/store/cart'
import { useCartDrawer } from '@/store/cartDrawer'
import PriceDisplay from './PriceDisplay'

export default function CartDrawer() {
  const { items } = useCart()
  const { isOpen, close } = useCartDrawer()
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isOpen) {
      timerRef.current = setTimeout(() => close(), 6000)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isOpen, close])

  const subtotal = items.reduce((sum, i) => sum + i.price_ars * i.quantity, 0)
  const lastItem = items[items.length - 1]

  const handleCheckout = () => {
    close()
    router.push('/checkout')
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/30 backdrop-blur-sm"
          onClick={close}
        />
      )}

      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-neutral-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Línea dorada superior */}
        <div className="h-0.5 bg-gold-gradient" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-primary-100">
          <div className="flex items-center gap-2 text-neutral-800 font-display font-bold">
            <ShoppingBagIcon className="w-5 h-5 text-primary-600" strokeWidth={1.5} />
            <span>Agregado al carrito</span>
          </div>
          <button
            onClick={close}
            className="text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Último item agregado */}
        {lastItem && (
          <div className="px-5 py-4 border-b border-primary-100 bg-primary-50/60">
            <div className="flex gap-3 items-center">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white border border-primary-100 flex-shrink-0">
                <Image
                  src={lastItem.image_url}
                  alt={lastItem.name}
                  fill
                  className="object-contain p-1"
                  sizes="64px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 line-clamp-2 leading-tight">
                  {lastItem.name}
                  {lastItem.variant_label && (
                    <span className="text-neutral-500"> ({lastItem.variant_label})</span>
                  )}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Cantidad: {lastItem.quantity}
                </p>
                <PriceDisplay
                  centavos={lastItem.price_ars}
                  className="text-sm font-bold text-neutral-800 mt-0.5"
                />
              </div>
            </div>
          </div>
        )}

        {/* Items del carrito */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {items.length > 1 && (
            <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-[0.2em]">
              También en tu carrito
            </p>
          )}
          {items.slice(0, -1).map((item) => (
            <div key={item.id} className="flex gap-3 items-center">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white border border-primary-100 flex-shrink-0">
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  className="object-contain p-1"
                  sizes="48px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-700 line-clamp-1">{item.name}</p>
                <p className="text-xs text-neutral-400">×{item.quantity}</p>
              </div>
              <PriceDisplay
                centavos={item.price_ars * item.quantity}
                className="text-xs font-semibold text-neutral-700 flex-shrink-0"
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-primary-100 px-5 py-5 space-y-3 bg-white">
          <div className="flex justify-between text-sm font-semibold text-neutral-800">
            <span>
              Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} artículo
              {items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''})
            </span>
            <PriceDisplay centavos={subtotal} />
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-neutral-800 hover:bg-primary-700 text-white py-3 rounded-lg font-medium text-sm transition-colors"
          >
            Finalizar compra
          </button>

          <Link
            href="/carrito"
            onClick={close}
            className="block w-full text-center border border-primary-200 hover:border-primary-400 text-neutral-700 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            Ver carrito
          </Link>
        </div>
      </div>
    </>
  )
}
