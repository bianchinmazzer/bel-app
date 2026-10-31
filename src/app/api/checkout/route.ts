import { NextRequest, NextResponse } from 'next/server'
import { mpPreference } from '@/lib/mercadopago'
import { validateCart, CartValidationError } from '@/lib/orders/pricing'
import { createServiceClient } from '@/lib/supabase/server'
import type { CartItem } from '@/types/cart'
import type { ShippingAddress } from '@/types/order'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

interface CheckoutBody {
  items: CartItem[]
  customer: {
    nombre: string
    email: string
    telefono: string
  }
  shipping_address: ShippingAddress
  /** El envío se coordina por WhatsApp, así que entra siempre en 0. */
  shipping_cost_ars?: number
  /** 'D' domicilio (default) | 'S' sucursal. */
  delivery_type?: 'D' | 'S'
}

/**
 * Checkout con Mercado Pago. Transferencia y 3 cuotas NO pasan por acá: se
 * coordinan 100% por WhatsApp desde el front (sin orden en la base).
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutBody
    const { customer, shipping_address } = body
    const deliveryType: 'D' | 'S' = body.delivery_type === 'S' ? 'S' : 'D'
    const shipping_cost_ars = 0

    const supabase = createServiceClient()

    // Revalidar carrito contra la DB. Los PRECIOS salen de la base, no del front.
    const { items, subtotal_ars } = await validateCart(supabase, body.items)
    const total_ars = subtotal_ars + shipping_cost_ars

    // Guardar la orden pendiente PRIMERO para obtener su id. Ese id es la
    // referencia externa en Mercado Pago: vuelve en la URL de retorno.
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        payment_provider: 'mercadopago',
        status: 'pending',
        customer_name: customer.nombre,
        customer_email: customer.email,
        customer_phone: customer.telefono,
        shipping_address,
        shipping_method: deliveryType === 'S' ? 'oca_sucursal' : 'oca_domicilio',
        shipping_cost_ars,
        items,
        subtotal_ars,
        discount_ars: 0,
        total_ars,
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('[Checkout] Error guardando orden:', orderError)
      return NextResponse.json({ error: 'No se pudo crear la orden' }, { status: 500 })
    }

    const redirect_url = await startMercadoPagoCheckout(order.id, items, customer, supabase)

    console.log(`[Checkout] Orden ${order.id} creada | Mercado Pago`)

    return NextResponse.json({ redirect_url, order_id: order.id })
  } catch (err: unknown) {
    if (err instanceof CartValidationError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    const message = err instanceof Error ? err.message : JSON.stringify(err)
    console.error('[Checkout] Error:', message)
    return NextResponse.json(
      { error: 'Error al procesar el pago', detail: message },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// Mercado Pago
// ---------------------------------------------------------------------------
async function startMercadoPagoCheckout(
  orderId: string,
  items: CartItem[],
  customer: CheckoutBody['customer'],
  supabase: ReturnType<typeof createServiceClient>
): Promise<string> {
  const isLocalhost = BASE_URL.includes('localhost')

  const preference = await mpPreference.create({
    body: {
      external_reference: orderId,
      items: items.map((item) => ({
        id: item.product_id,
        title: item.variant_label ? `${item.name} (${item.variant_label})` : item.name,
        quantity: item.quantity,
        unit_price: Math.max(item.price_ars / 100, 1),
        currency_id: 'ARS',
      })),
      payer: {
        name: customer.nombre,
        email: customer.email,
        phone: { number: customer.telefono },
      },
      ...(isLocalhost
        ? {}
        : {
            back_urls: {
              success: `${BASE_URL}/pago/exito`,
              pending: `${BASE_URL}/pago/pendiente`,
              failure: `${BASE_URL}/pago/error`,
            },
            auto_return: 'approved' as const,
            notification_url: `${BASE_URL}/api/webhook`,
          }),
      expires: true,
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      statement_descriptor: 'BEL DISTRIB',
    },
  })

  if (!preference.id || !preference.init_point) {
    throw new Error('Mercado Pago no devolvió init_point')
  }

  const { error } = await supabase
    .from('orders')
    .update({ mp_preference_id: preference.id })
    .eq('id', orderId)

  if (error) console.error('[Checkout] Error vinculando preference:', error)

  return preference.init_point
}
