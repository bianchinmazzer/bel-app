'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ChevronRightIcon,
  ShoppingBagIcon,
  TruckIcon,
  ShieldCheckIcon,
  CheckBadgeIcon,
  MinusIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import type { Product } from '@/types/product'
import { useCart } from '@/store/cart'
import { useCartDrawer } from '@/store/cartDrawer'
import PriceDisplay from '@/app/components/PriceDisplay'

interface Props {
  product: Product
}

export default function ProductDetail({ product }: Props) {
  const { addItem } = useCart()
  const { open } = useCartDrawer()

  const images = product.images ?? []
  const primaryIdx = images.findIndex((i) => i.is_primary)
  const [selectedIdx, setSelectedIdx] = useState(primaryIdx >= 0 ? primaryIdx : 0)
  const [quantity, setQuantity] = useState(1)

  // Variantes ordenadas
  const variants = (product.variants ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
  const hasVariants = variants.length > 0
  const [selectedVariantId, setSelectedVariantId] = useState<string>('')
  const [variantError, setVariantError] = useState(false)

  const selectedVariant = variants.find((v) => v.id === selectedVariantId)

  const selectedImage = images[selectedIdx]?.url ?? '/bel-logo.png'
  const outOfStock = product.stock <= 0
  const maxQty = Math.min(product.stock, 99)

  const handleAddToCart = () => {
    // Si tiene variantes, es obligatorio elegir una
    if (hasVariants && !selectedVariant) {
      setVariantError(true)
      // Scroll al selector para que sea evidente
      document
        .getElementById('variant-selector')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    // El id del carrito incluye la variante para que se agrupe bien
    // (dos tonos distintos del mismo producto son items separados)
    const cartId = selectedVariant
      ? `${product.id}__${selectedVariant.id}`
      : product.id

    addItem({
      id: cartId,
      product_id: product.id,
      variant_id: selectedVariant?.id ?? null,
      name: product.name,
      variant_label: selectedVariant?.label ?? null,
      price_ars: product.price_ars,
      image_url: selectedImage,
      slug: product.slug,
      weight_grams: product.weight_grams,
      quantity,
    })
    open()
  }

  return (
    <main className="min-h-screen bg-neutral-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-8 flex-wrap">
          <Link href="/" className="hover:text-primary-700 transition-colors">
            Inicio
          </Link>
          <ChevronRightIcon className="w-3 h-3" />
          <Link href="/tienda" className="hover:text-primary-700 transition-colors">
            Tienda
          </Link>
          {product.category && (
            <>
              <ChevronRightIcon className="w-3 h-3" />
              <Link
                href={`/tienda?categoria=${product.category.slug}`}
                className="hover:text-primary-700 transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRightIcon className="w-3 h-3" />
          <span className="text-neutral-800 font-medium line-clamp-1">{product.name}</span>
        </nav>

        {/* Grid de detalle */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Galería */}
          <div>
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-primary-100 shadow-gold-sm">
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                className="object-contain p-6"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedIdx(idx)}
                    className={`relative aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all ${
                      selectedIdx === idx
                        ? 'border-primary-600'
                        : 'border-primary-100 hover:border-primary-300'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-contain p-2"
                      sizes="100px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {product.category && (
              <Link
                href={`/tienda?categoria=${product.category.slug}`}
                className="font-mono text-xs uppercase tracking-[0.25em] text-primary-700 hover:text-primary-900 transition-colors mb-3 self-start"
              >
                {product.category.name}
              </Link>
            )}

            <h1 className="font-display font-bold text-3xl md:text-4xl text-neutral-800 leading-tight mb-4">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-6">
              <PriceDisplay
                centavos={product.price_ars}
                className="font-display font-bold text-4xl text-neutral-900"
              />
              {!outOfStock && (
                <span className="text-xs text-primary-700 font-medium">
                  {product.stock} disponible{product.stock !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {product.description && (
              <div className="prose prose-sm text-neutral-600 leading-relaxed mb-8 whitespace-pre-wrap">
                {product.description}
              </div>
            )}

            {/* Cantidad + CTA */}
            {!outOfStock ? (
              <div className="space-y-4">
                {/* Selector de variantes */}
                {hasVariants && (
                  <div id="variant-selector">
                    <label className="flex items-baseline justify-between mb-2">
                      <span className="text-xs font-mono uppercase tracking-wider text-neutral-600 font-semibold">
                        Elegí el tono
                        <span className="text-primary-600 ml-1">*</span>
                      </span>
                      {selectedVariant && (
                        <span className="text-xs text-primary-700 font-medium">
                          Tono {selectedVariant.label}
                        </span>
                      )}
                    </label>
                    <select
                      value={selectedVariantId}
                      onChange={(e) => {
                        setSelectedVariantId(e.target.value)
                        setVariantError(false)
                      }}
                      className={`w-full px-4 py-3 border-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all text-sm font-medium ${
                        variantError
                          ? 'border-red-400 focus:border-red-500'
                          : selectedVariantId
                            ? 'border-primary-500'
                            : 'border-primary-200 focus:border-primary-500'
                      }`}
                    >
                      <option value="">Seleccioná una opción</option>
                      {variants.map((v) => (
                        <option key={v.id} value={v.id}>
                          Tono {v.label}
                        </option>
                      ))}
                    </select>
                    {variantError && (
                      <p className="text-xs text-red-600 mt-1.5 font-medium">
                        Tenés que elegir un tono antes de continuar
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                    Cantidad
                  </span>
                  <div className="flex items-center border border-primary-200 rounded-full">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:text-primary-700 transition-colors disabled:opacity-30"
                      disabled={quantity <= 1}
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:text-primary-700 transition-colors disabled:opacity-30"
                      disabled={quantity >= maxQty}
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-neutral-800 hover:bg-primary-700 text-white py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBagIcon className="w-5 h-5" strokeWidth={1.5} />
                  <span>Agregar al carrito</span>
                </button>
              </div>
            ) : (
              <div className="bg-neutral-100 text-neutral-600 py-4 rounded-lg text-center font-medium">
                Sin stock por el momento
              </div>
            )}

            {/* Features */}
            <div className="mt-8 pt-8 border-t border-primary-100 space-y-3">
              <Feature
                icon={TruckIcon}
                text="Envíos a todo el país por Andreani"
              />
              <Feature
                icon={ShieldCheckIcon}
                text="Producto original con garantía de origen"
              />
              <Feature
                icon={CheckBadgeIcon}
                text="Más de 30 años distribuyendo calidad"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function Feature({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  text: string
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-neutral-600">
      <Icon className="w-5 h-5 text-primary-600 flex-shrink-0" strokeWidth={1.5} />
      <span>{text}</span>
    </div>
  )
}
