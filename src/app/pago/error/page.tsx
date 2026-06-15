import Link from 'next/link'
import { XCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { whatsappLink } from '@/lib/contact'

export default function PagoErrorPage() {
  return (
    <main className="min-h-screen bg-neutral-50 pt-24 pb-20 px-4">
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="inline-flex w-20 h-20 rounded-full bg-red-100 text-red-700 items-center justify-center mb-6">
          <XCircleIcon className="w-10 h-10" strokeWidth={1.5} />
        </div>

        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="h-px w-8 bg-primary-500" />
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary-700">
            Pago rechazado
          </span>
          <span className="h-px w-8 bg-primary-500" />
        </div>

        <h1 className="font-display font-bold text-4xl md:text-5xl text-neutral-800 mb-4">
          No pudimos procesar <span className="italic text-gradient-gold">tu pago</span>
        </h1>
        <p className="text-neutral-600 leading-relaxed mb-10 max-w-lg mx-auto">
          El pago fue rechazado. Por favor intentá nuevamente o contactanos por
          WhatsApp si el problema persiste.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/carrito"
            className="inline-flex items-center gap-2 bg-neutral-800 hover:bg-primary-700 text-white font-medium py-3 px-7 rounded-full transition-colors"
          >
            <span>Volver al carrito</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
          <a
            href={whatsappLink('¡Hola! Tuve un problema con mi pago')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-primary-300 hover:border-primary-500 text-neutral-700 font-medium py-3 px-7 rounded-full transition-colors"
          >
            <span>Contactar por WhatsApp</span>
          </a>
        </div>
      </div>
    </main>
  )
}
