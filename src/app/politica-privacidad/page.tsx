import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de privacidad | Bel Distribuciones',
}

export default function PrivacidadPage() {
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
            Política de privacidad
          </h1>
          <p className="text-xs text-neutral-500 mt-3 font-mono uppercase tracking-wider">
            Última actualización: Abril 2026
          </p>
        </div>

        <div className="prose prose-neutral max-w-none space-y-6 text-neutral-700 leading-relaxed text-sm">
          <Section title="1. Datos que recopilamos">
            Cuando hacés una compra recopilamos: nombre, email, teléfono y
            dirección de envío. Estos datos son necesarios para procesar el
            pedido y despacharlo por Andreani.
          </Section>

          <Section title="2. Uso de los datos">
            Utilizamos tus datos únicamente para: (a) procesar y despachar tu
            pedido, (b) comunicarnos con vos sobre tu compra, (c) cumplir
            obligaciones legales y fiscales.
          </Section>

          <Section title="3. Terceros">
            Compartimos datos estrictamente necesarios con: Mercado Pago (para
            procesar el pago), Andreani (para despachar el envío) y Supabase
            (como proveedor de infraestructura). No vendemos ni cedemos tus
            datos con fines comerciales.
          </Section>

          <Section title="4. Cookies">
            Usamos cookies técnicas para mantener tu carrito activo entre
            sesiones y para analíticas básicas de uso del sitio (Vercel
            Analytics). No usamos cookies de publicidad de terceros.
          </Section>

          <Section title="5. Derechos del titular">
            Conforme a la Ley 25.326 de Protección de Datos Personales de
            Argentina, podés solicitar acceso, rectificación o supresión de
            tus datos escribiéndonos a{' '}
            <a
              href="mailto:ventas@beldistribuciones.com.ar"
              className="text-primary-700 hover:text-primary-900 underline"
            >
              ventas@beldistribuciones.com.ar
            </a>
            .
          </Section>

          <Section title="6. Seguridad">
            Implementamos medidas técnicas razonables para proteger tus datos:
            cifrado TLS en las comunicaciones, autenticación de acceso al panel
            administrativo y almacenamiento en servicios certificados.
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
