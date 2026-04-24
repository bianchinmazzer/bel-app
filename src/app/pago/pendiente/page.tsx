import Link from 'next/link'
import { ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export default function PagoPendientePage() {
  return (
    <main className="min-h-screen bg-neutral-50 pt-24 pb-20 px-4">
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="inline-flex w-20 h-20 rounded-full bg-yellow-100 text-yellow-700 items-center justify-center mb-6">
          <ClockIcon className="w-10 h-10" strokeWidth={1.5} />
        </div>

        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="h-px w-8 bg-primary-500" />
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary-700">
            Pago pendiente
          </span>
          <span className="h-px w-8 bg-primary-500" />
        </div>

        <h1 className="font-display font-bold text-4xl md:text-5xl text-neutral-800 mb-4">
          Tu pago está <span className="italic text-gradient-gold">en proceso</span>
        </h1>
        <p className="text-neutral-600 leading-relaxed mb-2 max-w-lg mx-auto">
          Estamos esperando la confirmación de Mercado Pago. Te vamos a avisar
          por email apenas se acredite.
        </p>
        <p className="text-sm text-neutral-500 mb-10">
          Si elegiste pagar en efectivo (Pago Fácil, Rapipago), tenés 48 horas
          para completar el pago.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-neutral-800 hover:bg-primary-700 text-white font-medium py-3 px-7 rounded-full transition-colors"
        >
          <span>Volver al inicio</span>
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    </main>
  )
}
