import { NextRequest, NextResponse } from 'next/server'
import { mpPayment } from '@/lib/mercadopago'
import { createServiceClient } from '@/lib/supabase/server'
import { fulfillApprovedOrder } from '@/lib/orders/fulfillment'
import type { Order } from '@/types/order'

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const topicParam = searchParams.get('topic')
    const idParam = searchParams.get('id')

    const body = await req.json().catch(() => ({}))
    const topic = topicParam ?? body.type

    // merchant_order: buscar el payment aprobado
    if (topic === 'merchant_order' && idParam) {
      const { MercadoPagoConfig, MerchantOrder } = await import('mercadopago')
      const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
      const merchantOrderApi = new MerchantOrder(mpClient)
      const merchantOrder = await merchantOrderApi.get({ merchantOrderId: Number(idParam) })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const approvedPayment = (merchantOrder as any).payments?.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any) => p.status === 'approved'
      )
      if (!approvedPayment) return NextResponse.json({ ok: true })
      return processPayment(String(approvedPayment.id))
    }

    const paymentId = body.data?.id ?? (topic === 'payment' ? idParam : null)
    if (topic !== 'payment' || !paymentId) {
      return NextResponse.json({ ok: true })
    }

    return processPayment(String(paymentId))
  } catch (err) {
    console.error('[Webhook] Error:', err)
    return NextResponse.json({ ok: true })
  }
}

async function processPayment(paymentId: string): Promise<NextResponse> {
  try {
    const payment = await mpPayment.get({ id: paymentId })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentData = payment as any
    const status = paymentData.status as string
    const preferenceId = paymentData.preference_id as string | undefined
    const paidAmount =
      paymentData.transaction_amount != null
        ? Math.round(Number(paymentData.transaction_amount) * 100)
        : null

    if (!preferenceId) return NextResponse.json({ ok: true })

    const supabase = createServiceClient()

    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('mp_preference_id', preferenceId)
      .single()

    if (!order) {
      console.warn('[Webhook] Orden no encontrada para preference_id:', preferenceId)
      return NextResponse.json({ ok: true })
    }

    const orderStatus =
      status === 'approved'
        ? 'approved'
        : status === 'rejected'
          ? 'rejected'
          : status === 'cancelled'
            ? 'cancelled'
            : 'pending'

    // Guarda de idempotencia: solo cumplir en la transición pending → approved.
    const wasAlreadyApproved = order.status === 'approved'

    await supabase
      .from('orders')
      .update({
        status: orderStatus,
        mp_payment_id: String(paymentId),
        paid_amount_ars: paidAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)

    if (orderStatus === 'approved' && !wasAlreadyApproved) {
      await fulfillApprovedOrder(order as Order)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Webhook] processPayment error:', err)
    return NextResponse.json({ ok: true })
  }
}
