import type { SupabaseClient } from '@supabase/supabase-js'
import type { CartItem } from '@/types/cart'

/**
 * Resultado de validar el carrito contra la base de datos.
 * Los precios provienen SIEMPRE de la tabla `products`, nunca del frontend.
 */
export interface ValidatedCart {
  /** Items con el precio real de la DB (los demás campos se conservan del carrito). */
  items: CartItem[]
  /** Subtotal en centavos, calculado con precios de la DB. */
  subtotal_ars: number
}

export class CartValidationError extends Error {
  status: number
  constructor(message: string, status = 409) {
    super(message)
    this.name = 'CartValidationError'
    this.status = status
  }
}

/**
 * Revalida el carrito contra la base de datos:
 *  - Verifica que cada producto exista y esté activo.
 *  - Verifica que haya stock suficiente.
 *  - Reemplaza el precio de cada item por el precio REAL de `products`.
 *
 * En este catálogo las variantes comparten precio con el producto padre
 * (ver migration_002), así que el precio de referencia es siempre
 * `products.price_ars`.
 *
 * Nunca confía en el `price_ars` que llega del cliente: ese valor solo se
 * usa para mostrar, y acá se descarta en favor del de la DB.
 */
export async function validateCart(
  supabase: SupabaseClient,
  items: CartItem[]
): Promise<ValidatedCart> {
  if (!items?.length) {
    throw new CartValidationError('El carrito está vacío', 400)
  }

  const validated: CartItem[] = []

  for (const item of items) {
    if (!item.quantity || item.quantity < 1) {
      throw new CartValidationError(`Cantidad inválida para "${item.name}"`, 400)
    }

    const { data: product } = await supabase
      .from('products')
      .select('price_ars, stock, name, active')
      .eq('id', item.product_id)
      .single()

    if (!product || !product.active) {
      throw new CartValidationError(`El producto "${item.name}" ya no está disponible`)
    }

    if (product.stock < item.quantity) {
      throw new CartValidationError(`Stock insuficiente para "${item.name}"`)
    }

    // Precio autoritativo: el de la base, no el del carrito.
    validated.push({ ...item, price_ars: product.price_ars })
  }

  const subtotal_ars = validated.reduce((sum, i) => sum + i.price_ars * i.quantity, 0)

  return { items: validated, subtotal_ars }
}
