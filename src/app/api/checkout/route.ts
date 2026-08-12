import { NextRequest, NextResponse } from 'next/server'
import { mpPreference } from '@/lib/mercadopago'
import { createGetnetCheckout, isGetnetConfigured } from '@/lib/getnet'
import { validateCart, CartValidationError } from '@/lib/orders/pricing'
import { getStoreSettings, calcDiscountCents } from '@/lib/settings'
import { createServiceClient } from '@/lib/supabase/server'
import type { CartItem } from '@/types/cart'
import type { ShippingAddress, PaymentProvider } from '@/types/order'

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
  /** Pasarela elegida por el cliente. Default: mercadopago. */
  provider?: PaymentProvider
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutBody
    const { customer, shipping_address, shipping_cost_ars } = body
    const provider: PaymentProvider = body.provider === 'getnet' ? 'getnet' : 'mercadopago'

    if (provider === 'getnet' && !isGetnetConfigured()) {
      return NextResponse.json(
        { error: 'El pago con Getnet no está disponible por el momento.' },
        { status: 503 }
      )
    }

    const supabase = createServiceClient()

    // Revalidar carrito contra la DB. Los PRECIOS salen de la base, no del front.
    const { items, subtotal_ars } = await validateCart(supabase, body.items)

    // Bonificación: solo aplica al pagar con Mercado Pago. El porcentaje se
    // configura desde el panel admin. Se calcula en el backend (autoritativo).
    const settings = await getStoreSettings()
    const discount_ars =
      provider === 'mercadopago'
        ? calcDiscountCents(subtotal_ars, settings.mp_discount_percent)
        : 0
    const total_ars = subtotal_ars - discount_ars + shipping_cost_ars

    // Guardar la orden pendiente PRIMERO para obtener su id.
    // Ese id se usa como referencia externa en la pasarela: viaja en la URL
    // de retorno y permite recuperar el pedido en la pantalla de éxito.
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        payment_provider: provider,
        status: 'pending',
        customer_name: customer.nombre,
        customer_email: customer.email,
        customer_phone: customer.telefono,
        shipping_address,
        shipping_method: 'andreani_domicilio',
        shipping_cost_ars,
        items,
        subtotal_ars,
        discount_ars,
        total_ars,
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('[Checkout] Error guardando orden:', orderError)
      return NextResponse.json({ error: 'No se pudo crear la orden' }, { status: 500 })
    }

    const redirect_url =
      provider === 'getnet'
        ? await startGetnetCheckout(order.id, items, shipping_cost_ars, supabase)
        : await startMercadoPagoCheckout(
            order.id,
            items,
            customer,
            settings.mp_discount_percent,
            supabase
          )

    console.log(`[Checkout] Orden ${order.id} creada | Proveedor: ${provider}`)

    return NextResponse.json({ redirect_url })
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
  discountPercent: number,
  supabase: ReturnType<typeof createServiceClient>
): Promise<string> {
  const isLocalhost = BASE_URL.includes('localhost')

  // La bonificación se refleja escalando el precio unitario de cada ítem,
  // así el total que cobra Mercado Pago ya viene con el descuento aplicado.
  const factor = 1 - discountPercent / 100

  const preference = await mpPreference.create({
    body: {
      external_reference: orderId,
      items: items.map((item) => ({
        id: item.product_id,
        title: item.variant_label ? `${item.name} (${item.variant_label})` : item.name,
        quantity: item.quantity,
        unit_price: Math.max((item.price_ars / 100) * factor, 1),
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

// ---------------------------------------------------------------------------
// Getnet
// ---------------------------------------------------------------------------
async function startGetnetCheckout(
  orderId: string,
  items: CartItem[],
  shippingCents: number,
  supabase: ReturnType<typeof createServiceClient>
): Promise<string> {
  const { checkoutId, redirectUrl } = await createGetnetCheckout({
    items: items.map((item) => ({
      name: item.variant_label ? `${item.name} (${item.variant_label})` : item.name,
      amountCents: item.price_ars * item.quantity,
    })),
    shippingCents,
    urls: {
      success: `${BASE_URL}/pago/exito`,
      failure: `${BASE_URL}/pago/error`,
      notification: `${BASE_URL}/api/webhook/getnet`,
    },
  })

  const { error } = await supabase
    .from('orders')
    .update({ getnet_checkout_id: checkoutId })
    .eq('id', orderId)

  if (error) console.error('[Checkout] Error vinculando checkout Getnet:', error)

  return redirectUrl
}
