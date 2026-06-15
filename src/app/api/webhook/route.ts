import { NextRequest, NextResponse } from 'next/server'
import { mpPayment } from '@/lib/mercadopago'
import { createServiceClient } from '@/lib/supabase/server'
import { getResend, FROM_EMAIL, OWNER_EMAIL } from '@/lib/resend'
import { sendOrderWhatsApp } from '@/lib/whatsapp'
import { formatARS } from '@/lib/formatters'
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

    await supabase
      .from('orders')
      .update({
        status: orderStatus,
        mp_payment_id: String(paymentId),
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)

    if (orderStatus === 'approved') {
      for (const item of order.items) {
        await supabase.rpc('decrement_product_stock', {
          product_id: item.product_id,
          qty: item.quantity,
        })
      }

      const typedOrder = order as Order

      await getResend()
        .emails.send({
          from: FROM_EMAIL,
          to: typedOrder.customer_email,
          subject: `¡Tu compra en Bel Distribuciones está confirmada! (#${order.id.slice(0, 8)})`,
          html: buildBuyerEmail(typedOrder),
        })
        .catch((err) => console.error('[Webhook] Error email comprador:', err))

      await getResend()
        .emails.send({
          from: FROM_EMAIL,
          to: OWNER_EMAIL,
          subject: `🛍️ Nueva venta #${order.id.slice(0, 8)} - ${typedOrder.customer_name}`,
          html: buildOwnerEmail(typedOrder),
        })
        .catch((err) => console.error('[Webhook] Error email dueño:', err))

      await sendOrderWhatsApp(typedOrder)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Webhook] processPayment error:', err)
    return NextResponse.json({ ok: true })
  }
}

function buildBuyerEmail(order: Order): string {
  const addr = order.shipping_address
  const items = order.items
    .map(
      (i) =>
        `<li style="padding: 6px 0;">${i.name}${i.variant_label ? ` (${i.variant_label})` : ''} ×${i.quantity} — <strong>${formatARS(i.price_ars * i.quantity)}</strong></li>`
    )
    .join('')

  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #26251F; background: #FAFAF8;">
      <div style="background: linear-gradient(135deg, #B8A078 0%, #D4C4A0 100%); padding: 32px 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Bel Distribuciones</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Desde 1993</p>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #8B7654; font-size: 20px;">¡Gracias por tu compra, ${order.customer_name}!</h2>
        <p style="line-height: 1.6; color: #52504A;">Recibimos tu pago correctamente. Pronto te contactaremos por WhatsApp para coordinar el envío.</p>
        
        <h3 style="color: #26251F; border-bottom: 2px solid #B8A078; padding-bottom: 8px; margin-top: 32px;">Resumen del pedido</h3>
        <ul style="list-style: none; padding: 0;">${items}</ul>
        
        <div style="background: #F2EADC; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Subtotal:</strong> ${formatARS(order.subtotal_ars)}</p>
          <p style="margin: 4px 0;"><strong>Envío:</strong> ${formatARS(order.shipping_cost_ars)}</p>
          <p style="margin: 8px 0 0; font-size: 18px;"><strong>Total:</strong> ${formatARS(order.total_ars)}</p>
        </div>

        <h3 style="color: #26251F; border-bottom: 2px solid #B8A078; padding-bottom: 8px;">Dirección de entrega</h3>
        <p style="line-height: 1.6; color: #52504A;">
          ${addr.calle} ${addr.numero}${addr.piso_dpto ? `, ${addr.piso_dpto}` : ''}<br>
          ${addr.ciudad}, ${addr.provincia} (${addr.codigo_postal})
        </p>
      </div>
      <div style="background: #26251F; color: #A8A397; padding: 16px; text-align: center; font-size: 11px;">
        <p style="margin: 0;">Bel Distribuciones · Bahía Blanca, Buenos Aires · Argentina</p>
        <p style="margin: 4px 0 0; color: #B8A078;">Más de 30 años distribuyendo calidad</p>
      </div>
    </div>
  `
}

function buildOwnerEmail(order: Order): string {
  const addr = order.shipping_address
  const items = order.items
    .map(
      (i) =>
        `<li>${i.name}${i.variant_label ? ` (${i.variant_label})` : ''} ×${i.quantity} — ${formatARS(i.price_ars * i.quantity)}</li>`
    )
    .join('')

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h1 style="color: #8B7654;">🛍️ Nueva venta #${order.id.slice(0, 8)}</h1>
      <p><strong>Cliente:</strong> ${order.customer_name}</p>
      <p><strong>Email:</strong> ${order.customer_email}</p>
      <p><strong>Teléfono:</strong> ${order.customer_phone || 'No informado'}</p>
      <h2>Productos</h2>
      <ul>${items}</ul>
      <p><strong>Subtotal:</strong> ${formatARS(order.subtotal_ars)}</p>
      <p><strong>Envío:</strong> ${formatARS(order.shipping_cost_ars)}</p>
      <p><strong>Total cobrado:</strong> ${formatARS(order.total_ars)}</p>
      <h2>Dirección</h2>
      <p>${addr.calle} ${addr.numero}${addr.piso_dpto ? `, ${addr.piso_dpto}` : ''}<br>
        ${addr.ciudad}, ${addr.provincia} (${addr.codigo_postal})</p>
      <p style="color: #888; font-size: 12px;">ID completo: ${order.id}</p>
    </div>
  `
}
