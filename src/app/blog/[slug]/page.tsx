import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import {
  articles,
  getArticle,
  articlePlainText,
  type Article,
} from '@/lib/blog'
import { SITE_NAME, absoluteUrl } from '@/lib/site'
import { whatsappLink } from '@/lib/contact'

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) return {}

  return {
    title: `${article.title} | Blog Bel Distribuciones`,
    description: article.description,
    keywords: article.keywords,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `/blog/${article.slug}`,
      type: 'article',
      publishedTime: article.date,
    },
  }
}

function formatFecha(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function blogPostingJsonLd(article: Article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    articleBody: articlePlainText(article),
    datePublished: article.date,
    dateModified: article.date,
    inLanguage: 'es-AR',
    keywords: article.keywords.join(', '),
    articleSection: article.category,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(`/blog/${article.slug}`),
    },
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: absoluteUrl('/bel-logo.png') },
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = getArticle(slug)

  if (!article) notFound()

  return (
    <main className="min-h-screen bg-neutral-50 pt-24 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd(article)) }}
      />

      {/* Header */}
      <div className="bg-gradient-to-b from-primary-50 to-neutral-50 border-b border-primary-100">
        <div className="max-w-3xl mx-auto px-4 py-14 md:py-16">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:gap-2.5 transition-all mb-8"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Volver al blog
          </Link>
          <div className="flex items-center gap-3 mb-5 text-xs">
            <span className="font-mono uppercase tracking-widest text-primary-700 bg-primary-50 rounded-full px-3 py-1">
              {article.category}
            </span>
            <time dateTime={article.date} className="text-neutral-500">
              {formatFecha(article.date)}
            </time>
            <span className="text-neutral-400">· {article.readingMinutes} min</span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-5xl text-neutral-800 leading-[1.1]">
            {article.title}
          </h1>
        </div>
      </div>

      {/* Cuerpo */}
      <article className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <div className="space-y-10">
          {article.sections.map((section, i) => (
            <section key={i} className="space-y-4">
              {section.heading && (
                <h2 className="font-display font-bold text-2xl md:text-3xl text-neutral-800 leading-snug">
                  {section.heading}
                </h2>
              )}
              {section.paragraphs?.map((p, j) => (
                <p key={j} className="text-neutral-700 leading-relaxed text-[17px]">
                  {p}
                </p>
              ))}
              {section.list && (
                <ul className="space-y-3 pl-1">
                  {section.list.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-neutral-700 leading-relaxed">
                      <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-8 md:p-10 text-center shadow-gold">
          <h2 className="font-display font-bold text-2xl text-white mb-3">
            ¿Comprás para tu negocio?
          </h2>
          <p className="text-primary-50/90 mb-6 leading-relaxed max-w-md mx-auto">
            Accedé a precios mayoristas en peluquería, estética y hogar. Escribinos y te
            asesoramos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={whatsappLink('¡Hola! Vengo del blog y quiero conocer las condiciones mayoristas.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 hover:bg-neutral-100 font-semibold py-3 px-7 rounded-full transition-colors"
            >
              Consultar por WhatsApp
            </a>
            <Link
              href="/mayoristas"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/70 text-white hover:bg-white/10 font-semibold py-3 px-7 rounded-full transition-colors"
            >
              Ver venta mayorista
            </Link>
          </div>
        </div>
      </article>
    </main>
  )
}
