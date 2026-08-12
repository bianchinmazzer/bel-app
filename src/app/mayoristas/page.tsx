import type { Metadata } from 'next'
import Link from 'next/link'
import {
  BuildingStorefrontIcon,
  ScissorsIcon,
  SparklesIcon,
  TruckIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import { whatsappLink } from '@/lib/contact'

export const metadata: Metadata = {
  title: 'Venta mayorista | Precios para peluquerías, comercios y distribuidores',
  description:
    'Convertite en cliente mayorista de Bel Distribuciones. Precios especiales para peluquerías, centros de estética, barberías y comercios. Distribuidores oficiales de Alfaparf, Exel, Schwarzkopf, Yellow y Sir Fausto. Envíos a todo el país.',
  keywords: [
    'venta mayorista peluquería argentina',
    'proveedor mayorista estética',
    'distribuidora peluquería precios mayoristas',
    'abastecer peluquería argentina',
    'mayorista productos de belleza',
    'distribuidor Alfaparf argentina',
    'proveedor barbería Sir Fausto',
  ],
  openGraph: {
    title: 'Venta mayorista Bel Distribuciones | Para peluquerías y comercios',
    description:
      'Precios mayoristas en productos de peluquería, estética y hogar. Más de 30 años abasteciendo comercios de todo el país.',
    url: '/mayoristas',
  },
  alternates: {
    canonical: '/mayoristas',
  },
}

const CTA_MENSAJE =
  '¡Hola! Quiero ser cliente mayorista de Bel Distribuciones. ¿Me pasan condiciones y lista de precios?'

export default function MayoristasPage() {
  return (
    <main className="min-h-screen bg-neutral-50 pt-24 pb-20">
      {/* ——— HERO ——— */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-neutral-50 to-neutral-50 border-b border-primary-100">
        <div className="absolute inset-0 texture-paper opacity-50 pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-16 md:py-24">
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-8 bg-primary-500" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary-700">
              Canal mayorista
            </span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-6xl text-neutral-800 leading-[1.05] max-w-3xl mb-6">
            Somos tu <span className="italic text-gradient-gold">proveedor</span> mayorista
          </h1>
          <p className="text-neutral-600 text-base md:text-lg max-w-2xl leading-relaxed mb-8">
            Abastecemos peluquerías, centros de estética, barberías y comercios de todo el país
            con productos de primeras marcas a precio mayorista. Importamos y distribuimos hace
            más de 30 años, con stock permanente y atención personalizada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={whatsappLink(CTA_MENSAJE)}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-neutral-800 hover:bg-neutral-900 text-neutral-50 font-medium py-4 px-8 rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <span>Quiero ser cliente mayorista</span>
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <Link
              href="/tienda"
              className="group border-2 border-primary-600 hover:bg-primary-600 text-primary-700 hover:text-white font-medium py-4 px-8 rounded-full transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>Ver catálogo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ——— A QUIÉN LE VENDEMOS ——— */}
      <section className="max-w-6xl mx-auto px-4 py-20 md:py-28">
        <div className="mb-14 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-primary-500" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary-700">
              A quién abastecemos
            </span>
          </div>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-neutral-800 leading-tight">
            Pensado para tu <span className="italic text-gradient-gold">negocio</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-primary-200 rounded-2xl overflow-hidden shadow-gold-sm">
          <PublicoCard
            icon={ScissorsIcon}
            title="Peluquerías"
            text="Coloración, alisados, cuidado capilar y todo lo que tu salón necesita, siempre en stock."
          />
          <PublicoCard
            icon={SparklesIcon}
            title="Centros de estética"
            text="Productos profesionales para tratamientos faciales, corporales y cuidado de la piel."
          />
          <PublicoCard
            icon={BuildingStorefrontIcon}
            title="Comercios y revendedores"
            text="Perfumerías, kioscos de belleza y revendedores que quieren ampliar su oferta."
          />
          <PublicoCard
            icon={BuildingStorefrontIcon}
            title="Barberías"
            text="Línea Sir Fausto y productos de cuidado masculino para el sillón y el mostrador."
          />
        </div>
      </section>

      {/* ——— MARCAS / LÍNEAS ——— */}
      <section className="bg-gradient-to-b from-neutral-50 to-primary-50 border-y border-primary-100">
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28">
          <div className="mb-14 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-primary-500" />
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary-700">
                Nuestras líneas
              </span>
            </div>
            <h2 className="font-display font-bold text-3xl md:text-5xl text-neutral-800 leading-tight">
              Distribuidores <span className="italic text-gradient-gold">oficiales</span>
            </h2>
            <p className="text-neutral-600 mt-4 leading-relaxed">
              Trabajamos únicamente con producto original de primeras marcas, con garantía de
              origen. Estas son algunas de las líneas que distribuimos:
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {['Alfaparf', 'Exel', 'Schwarzkopf', 'Yellow', 'Sir Fausto'].map((marca) => (
              <span
                key={marca}
                className="bg-white border border-primary-200 rounded-full px-6 py-3 font-display font-semibold text-neutral-800 shadow-gold-sm"
              >
                {marca}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14">
            <LineaCard
              title="Peluquería"
              text="Coloración profesional, decolorantes, oxidantes, shampoos y acondicionadores, tratamientos y herramientas."
            />
            <LineaCard
              title="Estética y cuidado personal"
              text="Productos para tratamientos faciales y corporales, cuidado de la piel y línea de belleza."
            />
            <LineaCard
              title="Hogar"
              text="Artículos de bazar y hogar para complementar el surtido de tu comercio con un solo proveedor."
            />
          </div>
        </div>
      </section>

      {/* ——— POR QUÉ ELEGIRNOS ——— */}
      <section className="max-w-6xl mx-auto px-4 py-20 md:py-28">
        <div className="mb-14 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-primary-500" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary-700">
              Por qué Bel
            </span>
          </div>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-neutral-800 leading-tight">
            Más de 30 años <span className="italic text-gradient-gold">respaldándote</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          <VentajaItem
            title="Precios mayoristas competitivos"
            text="Condiciones especiales por volumen para que mejores el margen de tu negocio."
          />
          <VentajaItem
            title="Producto original garantizado"
            text="Somos distribuidores oficiales. Trazabilidad y garantía de origen en cada producto."
          />
          <VentajaItem
            title="Envíos a todo el país"
            text="Despachos por Andreani con seguimiento, en 3 a 7 días hábiles desde Bahía Blanca."
          />
          <VentajaItem
            title="Atención personalizada"
            text="Un asesor dedicado para cada cliente, con respuesta por WhatsApp en horario comercial."
          />
          <VentajaItem
            title="Stock permanente"
            text="Mantenemos disponibilidad de los productos de mayor rotación para que nunca cortes un servicio."
          />
          <VentajaItem
            title="Formas de pago flexibles"
            text="Mercado Pago, transferencia y cuenta corriente para clientes mayoristas con historial."
          />
        </div>
      </section>

      {/* ——— CTA FINAL ——— */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl px-8 py-14 md:px-16 md:py-20 text-center shadow-gold">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400 rounded-full opacity-30 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <TruckIcon className="w-12 h-12 text-primary-100 mx-auto mb-6" strokeWidth={1.2} />
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white leading-tight mb-4">
              Empecemos a trabajar juntos
            </h2>
            <p className="text-primary-50/90 max-w-xl mx-auto mb-8 leading-relaxed">
              Contanos qué tipo de negocio tenés y te enviamos la lista de precios mayoristas
              vigente. Respondemos en el día, en horario comercial.
            </p>
            <a
              href={whatsappLink(CTA_MENSAJE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-primary-700 hover:bg-neutral-100 font-semibold py-4 px-8 rounded-full transition-all duration-300 shadow-lg"
            >
              <span>Solicitar lista de precios</span>
              <ArrowRightIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

function PublicoCard({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  title: string
  text: string
}) {
  return (
    <div className="bg-neutral-50 p-8 hover:bg-white transition-colors duration-300 group">
      <div className="w-14 h-14 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center mb-6 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
        <Icon className="w-7 h-7" strokeWidth={1.5} />
      </div>
      <h3 className="font-display font-bold text-xl text-neutral-800 mb-3">{title}</h3>
      <p className="text-sm text-neutral-600 leading-relaxed">{text}</p>
    </div>
  )
}

function LineaCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-white rounded-2xl border border-primary-100 p-8 shadow-gold-sm">
      <h3 className="font-display font-bold text-xl text-neutral-800 mb-3">{title}</h3>
      <p className="text-sm text-neutral-600 leading-relaxed">{text}</p>
    </div>
  )
}

function VentajaItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex items-start gap-4">
      <CheckBadgeIcon className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="font-display font-semibold text-lg text-neutral-800 mb-1">{title}</h3>
        <p className="text-sm text-neutral-600 leading-relaxed">{text}</p>
      </div>
    </div>
  )
}
