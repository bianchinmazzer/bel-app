import { NextRequest, NextResponse } from 'next/server'
import { getGetnetPayment } from '@/lib/getnet'
import { createServiceClient } from '@/lib/supabase/server'
import { fulfillApprovedOrder } from '@/lib/orders/fulfillment'
import type { Order } from '@/types/order'

/**
 * Webhook de notificaciones de Getnet Argentina.
 *
 * Getnet notifica con el uuid de la orden (data.order.uuid). Siguiendo el
 * mandato del documento y el plugin oficial, NO se confía en el payload:
 * se re-consulta el estado real de la orden contra la API de Getnet y recién
 * ahí se valida y se marca pagada.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as Record<string, unknown>))
    const { searchParams } = new URL(req.url)

    // uuid de la orden en Getnet. Viene en data.order.uuid (formato AR).
    const data = body.data as { order?: { uuid?: string }; uuid?: string } | undefined
    const uuid =
      data?.order?.uuid ??
      data?.uuid ??
      (body.uuid as string | undefined) ??
      searchParams.get('uuid') ??
      undefined

    if (!uuid) {
      console.warn('[Webhook Getnet] Notificación sin uuid:', JSON.stringify(body))
      return NextResponse.json({ ok: true })
    }

    // 1) Re-consultar el estado REAL de la orden en Getnet.
    const payment = await getGetnetPayment(uuid)

    const supabase = createServiceClient()

    // 2) Ubicar nuestra orden por el uuid que guardamos al crear el checkout.
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('getnet_checkout_id', uuid)
      .single()

    if (!order) {
      console.warn('[Webhook Getnet] Orden no encontrada para uuid:', uuid)
      return NextResponse.json({ ok: true })
    }

    const typedOrder = order as Order

    // 3a) Idempotencia: solo cumplir en la transición pending → approved.
    const wasAlreadyApproved = typedOrder.status === 'approved'

    // 3b) Si Getnet informa monto, validar que coincida con el total.
    const amountMatches =
      payment.amountCents == null || payment.amountCents === typedOrder.total_ars

    if (payment.status === 'approved' && !amountMatches) {
      console.error(
        `[Webhook Getnet] ⚠️ Monto no coincide en orden ${typedOrder.id}: ` +
          `Getnet=${payment.amountCents} vs esperado=${typedOrder.total_ars}. No se aprueba.`
      )
      await supabase
        .from('orders')
        .update({
          getnet_payment_id: payment.orderId,
          paid_amount_ars: payment.amountCents,
          updated_at: new Date().toISOString(),
        })
        .eq('id', typedOrder.id)
      return NextResponse.json({ ok: true })
    }

    // 4) Actualizar el estado de la orden.
    await supabase
      .from('orders')
      .update({
        status: payment.status,
        getnet_payment_id: payment.orderId,
        paid_amount_ars: payment.amountCents,
        updated_at: new Date().toISOString(),
      })
      .eq('id', typedOrder.id)

    // 5) Cumplir SOLO en la transición pending → approved.
    if (payment.status === 'approved' && !wasAlreadyApproved) {
      await fulfillApprovedOrder(typedOrder)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Webhook Getnet] Error:', err)
    return NextResponse.json({ ok: true })
  }
}
