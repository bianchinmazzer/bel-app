'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/store/cart'

export default function PagoExitoPage() {
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <main className="min-h-screen bg-neutral-50 pt-24 pb-20 px-4">
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="inline-flex w-20 h-20 rounded-full bg-green-100 text-green-700 items-center justify-center mb-6">
          <CheckCircleIcon className="w-10 h-10" strokeWidth={1.5} />
        </div>

        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="h-px w-8 bg-primary-500" />
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary-700">
            Pago confirmado
          </span>
          <span className="h-px w-8 bg-primary-500" />
        </div>

        <h1 className="font-display font-bold text-4xl md:text-5xl text-neutral-800 mb-4">
          ¡Gracias por tu <span className="italic text-gradient-gold">compra</span>!
        </h1>
        <p className="text-neutral-600 leading-relaxed mb-2 max-w-lg mx-auto">
          Recibimos tu pago correctamente. Te enviamos un email con los detalles
          del pedido.
        </p>
        <p className="text-sm text-neutral-500 mb-10">
          Pronto te contactaremos por WhatsApp para coordinar el envío.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/tienda"
            className="inline-flex items-center gap-2 bg-neutral-800 hover:bg-primary-700 text-white font-medium py-3 px-7 rounded-full transition-colors"
          >
            <span>Seguir comprando</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-primary-300 hover:border-primary-500 text-neutral-700 font-medium py-3 px-7 rounded-full transition-colors"
          >
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
