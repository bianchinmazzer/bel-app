import { NextRequest, NextResponse } from 'next/server'
import { mpPreference } from '@/lib/mercadopago'
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
  shipping_cost_ars: number
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutBody
    const { items, customer, shipping_address, shipping_cost_ars } = body

    if (!items?.length) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Validar stock en tiempo real
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('stock, name')
        .eq('id', item.product_id)
        .single()

      if (!product || product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para "${item.name}"` },
          { status: 409 }
        )
      }
    }

    // Calcular totales (en centavos)
    const subtotal_ars = items.reduce((sum, i) => sum + i.price_ars * i.quantity, 0)
    const total_ars = subtotal_ars + shipping_cost_ars

    const isLocalhost = BASE_URL.includes('localhost')

    // Guardar la orden pendiente PRIMERO para obtener su id.
    // Ese id se usa como external_reference en Mercado Pago: viaja en la URL
    // de retorno y permite recuperar el pedido en la pantalla de éxito.
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        status: 'pending',
        customer_name: customer.nombre,
        customer_email: customer.email,
        customer_phone: customer.telefono,
        shipping_address,
        shipping_method: 'andreani_domicilio',
        shipping_cost_ars,
        items,
        subtotal_ars,
        total_ars,
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('[Checkout] Error guardando orden:', orderError)
      return NextResponse.json({ error: 'No se pudo crear la orden' }, { status: 500 })
    }

    // Crear preference en Mercado Pago
    const preference = await mpPreference.create({
      body: {
        external_reference: order.id,
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
        // Statement descriptor — lo que ve el cliente en el resumen de tarjeta
        statement_descriptor: 'BEL DISTRIB',
      },
    })

    if (!preference.id || !preference.init_point) {
      throw new Error('Mercado Pago no devolvió init_point')
    }

    // Vincular la preference a la orden ya creada
    const { error: updateError } = await supabase
      .from('orders')
      .update({ mp_preference_id: preference.id })
      .eq('id', order.id)

    if (updateError) {
      console.error('[Checkout] Error vinculando preference:', updateError)
    }

    console.log('[Checkout] Orden creada:', order.id, '| Preference:', preference.id)

    return NextResponse.json({ init_point: preference.init_point })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : JSON.stringify(err)
    console.error('[Checkout] Error:', message)
    return NextResponse.json(
      { error: 'Error al procesar el pago', detail: message },
      { status: 500 }
    )
  }
}
