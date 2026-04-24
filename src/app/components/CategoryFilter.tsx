'use client'

import Link from 'next/link'
import type { Category } from '@/types/product'

interface Props {
  categorias: Category[]
  activeSlug?: string
}

export default function CategoryFilter({ categorias, activeSlug }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/tienda"
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          !activeSlug
            ? 'bg-neutral-800 text-white shadow-sm'
            : 'bg-white text-neutral-700 border border-primary-200 hover:border-primary-400 hover:text-primary-700'
        }`}
      >
        Todos
      </Link>
      {categorias.map((cat) => (
        <Link
          key={cat.id}
          href={`/tienda?categoria=${cat.slug}`}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeSlug === cat.slug
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'bg-white text-neutral-700 border border-primary-200 hover:border-primary-400 hover:text-primary-700'
          }`}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  )
}
