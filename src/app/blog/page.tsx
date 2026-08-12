import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { getArticlesSorted } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog | Guías para peluquerías, barberías y comercios',
  description:
    'Consejos y guías para peluquerías, centros de estética, barberías y comercios: coloración profesional, alisados, barbería y cómo comprar mejor al por mayor.',
  keywords: [
    'blog peluquería argentina',
    'guías para peluqueros',
    'consejos estética profesional',
    'blog barbería',
    'compra mayorista peluquería',
  ],
  openGraph: {
    title: 'Blog Bel Distribuciones | Guías para el rubro de la belleza',
    description:
      'Recursos para peluquerías, barberías y comercios que quieren crecer.',
    url: '/blog',
  },
  alternates: {
    canonical: '/blog',
  },
}

function formatFecha(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function BlogPage() {
  const articulos = getArticlesSorted()

  return (
    <main className="min-h-screen bg-neutral-50 pt-24 pb-20">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-neutral-50 to-neutral-50 border-b border-primary-100">
        <div className="absolute inset-0 texture-paper opacity-50 pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-16 md:py-20">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-primary-500" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary-700">
              Blog
            </span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-6xl text-neutral-800 leading-[1.05] max-w-3xl mb-5">
            Guías para hacer <span className="italic text-gradient-gold">crecer</span> tu negocio
          </h1>
          <p className="text-neutral-600 text-base md:text-lg max-w-2xl leading-relaxed">
            Recursos prácticos para peluquerías, centros de estética, barberías y comercios.
            Escrito desde la experiencia de más de 30 años distribuyendo en el rubro.
          </p>
        </div>
      </section>

      {/* Listado */}
      <section className="max-w-5xl mx-auto px-4 mt-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {articulos.map((articulo) => (
            <article
              key={articulo.slug}
              className="group bg-white rounded-2xl border border-primary-100 p-8 shadow-gold-sm hover:shadow-gold transition-shadow duration-300 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4 text-xs">
                <span className="font-mono uppercase tracking-widest text-primary-700 bg-primary-50 rounded-full px-3 py-1">
                  {articulo.category}
                </span>
                <span className="text-neutral-400">{articulo.readingMinutes} min de lectura</span>
              </div>
              <h2 className="font-display font-bold text-2xl text-neutral-800 leading-snug mb-3">
                <Link
                  href={`/blog/${articulo.slug}`}
                  className="hover:text-primary-700 transition-colors"
                >
                  {articulo.title}
                </Link>
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed mb-6 flex-1">
                {articulo.description}
              </p>
              <div className="flex items-center justify-between">
                <time
                  dateTime={articulo.date}
                  className="text-xs text-neutral-500 font-mono uppercase tracking-wider"
                >
                  {formatFecha(articulo.date)}
                </time>
                <Link
                  href={`/blog/${articulo.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 group-hover:gap-2.5 transition-all"
                >
                  Leer
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
