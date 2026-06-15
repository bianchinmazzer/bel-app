'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircleIcon, ArrowRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/store/cart'
import { whatsappLink } from '@/lib/contact'
import type { CartItem } from '@/types/cart'

const SNAPSHOT_KEY = 'bel-last-order'

interface OrderSnapshot {
  items: { name: string; variant_label: string | null; quantity: number }[]
  ref: string | null
}

export default function PagoExitoPage() {
  const { items, clearCart } = useCart()
  const [snapshot, setSnapshot] = useState<OrderSnapshot | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Referencia del pedido que Mercado Pago agrega a la URL de retorno.
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('external_reference')

    // El carrito sigue en localStorage al volver del pago: lo capturamos
    // para armar el mensaje de WhatsApp antes de vaciarlo.
    let snap: OrderSnapshot | null = null
    if (items.length > 0) {
      snap = {
        items: items.map((i: CartItem) => ({
          name: i.name,
          variant_label: i.variant_label,
          quantity: i.quantity,
        })),
        ref,
      }
      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snap))
    } else {
      // Fallback si la página se recarga (carrito ya vacío).
      const stored = localStorage.getItem(SNAPSHOT_KEY)
      if (stored) {
        try {
          snap = JSON.parse(stored) as OrderSnapshot
          if (ref) snap.ref = ref
        } catch {
          snap = null
        }
      }
    }

    setSnapshot(snap)
    if (snap) setShowModal(true)
    clearCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const message = buildWhatsAppMessage(snapshot)
  const waHref = whatsappLink(message)

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
        <p className="text-sm text-neutral-500 mb-8">
          Para coordinar la entrega, escribinos por WhatsApp 👇
        </p>

        {/* Botón siempre visible en la página (además del popup) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white font-medium py-3 px-7 rounded-full transition-colors shadow-lg"
          >
            <WhatsAppGlyph className="w-5 h-5" />
            <span>Coordinar entrega por WhatsApp</span>
          </a>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
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

      {/* Popup automático */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <button
              onClick={() => setShowModal(false)}
              aria-label="Cerrar"
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <div className="inline-flex w-16 h-16 rounded-full bg-[#25D366]/15 text-[#25D366] items-center justify-center mb-5">
              <WhatsAppGlyph className="w-8 h-8" />
            </div>

            <h2 className="font-display font-bold text-2xl text-neutral-800 mb-2">
              ¡Último paso!
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-6">
              Para coordinar la entrega de tu pedido, envianos un mensaje por
              WhatsApp. Ya lo dejamos escrito por vos.
            </p>

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowModal(false)}
              className="inline-flex w-full items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white font-semibold py-3.5 px-7 rounded-full transition-colors shadow-lg"
            >
              <WhatsAppGlyph className="w-5 h-5" />
              <span>Coordinar mi envío</span>
            </a>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              Lo hago más tarde
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

function buildWhatsAppMessage(snapshot: OrderSnapshot | null): string {
  if (!snapshot || snapshot.items.length === 0) {
    return '¡Hola! Acabo de hacer una compra y quiero coordinar el envío 📦'
  }
  const lines = snapshot.items
    .map((i) => `• ${i.name}${i.variant_label ? ` (${i.variant_label})` : ''} ×${i.quantity}`)
    .join('\n')
  const ref = snapshot.ref ? `\nPedido #${snapshot.ref.slice(0, 8)}` : ''
  return `¡Hola! Te compré:\n${lines}${ref}\n\nQuiero coordinar el envío 📦`
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}
