'use client'

import Link from 'next/link'
import { ShoppingBagIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/store/cart'
import { useEffect, useState } from 'react'

export default function CartIcon() {
  const { items } = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const count = mounted ? items.reduce((sum, i) => sum + i.quantity, 0) : 0

  return (
    <Link
      href="/carrito"
      className="relative group inline-flex items-center gap-2 text-neutral-700 hover:text-primary-700 transition-colors"
      aria-label="Ver carrito"
    >
      <div className="relative">
        <ShoppingBagIcon className="w-5 h-5" strokeWidth={1.5} />
        {count > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {count}
          </span>
        )}
      </div>
      <span className="text-sm font-medium hidden md:inline">Carrito</span>
    </Link>
  )
}
