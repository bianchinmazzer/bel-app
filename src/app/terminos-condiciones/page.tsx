import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y condiciones | Bel Distribuciones',
}

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-neutral-50 pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-8 bg-primary-500" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary-700">
              Legal
            </span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-neutral-800">
            Términos y condiciones
          </h1>
          <p className="text-xs text-neutral-500 mt-3 font-mono uppercase tracking-wider">
            Última actualización: Abril 2026
          </p>
        </div>

        <div className="prose prose-neutral max-w-none space-y-6 text-neutral-700 leading-relaxed text-sm">
          <Section title="1. Aceptación">
            Al utilizar el sitio web de Bel Distribuciones y realizar compras a
            través de él, aceptás estos términos y condiciones en su totalidad.
          </Section>

          <Section title="2. Productos y precios">
            Todos los precios están expresados en pesos argentinos (ARS) e
            incluyen IVA cuando corresponda. Nos reservamos el derecho de
            modificar precios sin previo aviso, sin afectar pedidos ya
            confirmados.
          </Section>

          <Section title="3. Stock">
            La disponibilidad de productos está sujeta a stock. Si un producto
            queda sin stock luego de tu compra, te contactaremos para ofrecerte
            una alternativa o reembolso.
          </Section>

          <Section title="4. Pagos">
            Procesamos pagos a través de Mercado Pago, aceptando tarjetas de
            crédito, débito, efectivo y transferencia bancaria. No almacenamos
            datos de tarjetas en nuestros servidores.
          </Section>

          <Section title="5. Envíos">
            Realizamos envíos a todo el país mediante Andreani. Los tiempos de
            entrega estimados son de 3 a 7 días hábiles desde la confirmación
            del pago. Los costos de envío se calculan según el destino y el
            peso del paquete.
          </Section>

          <Section title="6. Devoluciones">
            Tenés derecho a devolver los productos dentro de los 10 días
            corridos desde la recepción, según la Ley de Defensa del
            Consumidor. Los productos deben estar sin usar y en su empaque
            original.
          </Section>

          <Section title="7. Contacto">
            Para consultas, reclamos o solicitudes, podés contactarnos por
            email a{' '}
            <a
              href="mailto:ventas@beldistribuciones.com.ar"
              className="text-primary-700 hover:text-primary-900 underline"
            >
              ventas@beldistribuciones.com.ar
            </a>{' '}
            o por WhatsApp al número publicado en la web.
          </Section>
        </div>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display font-bold text-xl text-neutral-800 mb-3">{title}</h2>
      <div>{children}</div>
    </section>
  )
}
