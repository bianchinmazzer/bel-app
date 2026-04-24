'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types/product'
import PriceDisplay from './PriceDisplay'
import { useCartDrawer } from '@/store/cartDrawer'
import { useCart } from '@/store/cart'

interface ShopProductCardProps {
  product: Product
}

export default function ShopProductCard({ product }: ShopProductCardProps) {
  const { addItem } = useCart()
  const { open } = useCartDrawer()

  const primaryImage =
    product.images?.find((i) => i.is_primary)?.url ??
    product.images?.[0]?.url ??
    '/bel-logo.png'

  const outOfStock = product.stock <= 0
  const hasVariants = (product.variants?.length ?? 0) > 0

  const handleAddToCart = (e: React.MouseEvent) => {
    // Si tiene variantes, dejamos que el Link navegue al detalle
    // (no preventDefault ni stopPropagation)
    if (hasVariants) return

    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      product_id: product.id,
      variant_id: null,
      name: product.name,
      variant_label: null,
      price_ars: product.price_ars,
      image_url: primaryImage,
      slug: product.slug,
      weight_grams: product.weight_grams,
    })
    open()
  }

  return (
    <Link href={`/tienda/${product.slug}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden border border-primary-100 hover:border-primary-300 hover:shadow-gold-sm transition-all duration-300 h-full flex flex-col">
        {/* Imagen */}
        <div className="relative aspect-square overflow-hidden bg-neutral-100">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {outOfStock && (
            <div className="absolute inset-0 bg-neutral-900/50 flex items-center justify-center">
              <span className="bg-neutral-50 text-neutral-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                Sin stock
              </span>
            </div>
          )}
          {product.featured && !outOfStock && (
            <div className="absolute top-3 left-3">
              <span className="bg-primary-600 text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full">
                Destacado
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1 gap-1">
          {product.category && (
            <p className="font-mono text-[10px] text-primary-700 uppercase tracking-[0.2em]">
              {product.category.name}
            </p>
          )}
          <h3 className="font-display text-neutral-800 font-semibold text-base leading-tight line-clamp-2 flex-1 mt-1">
            {product.name}
          </h3>
          <PriceDisplay
            centavos={product.price_ars}
            className="text-lg font-bold text-neutral-900 mt-2"
          />

          {/* Botón */}
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className={`mt-3 w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
              outOfStock
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : 'bg-neutral-800 text-white hover:bg-primary-700'
            }`}
          >
            {outOfStock
              ? 'Sin stock'
              : hasVariants
                ? 'Elegir tono'
                : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </Link>
  )
}
