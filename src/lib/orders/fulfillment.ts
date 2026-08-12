import { createServiceClient } from '@/lib/supabase/server'
import { getResend, FROM_EMAIL, OWNER_EMAIL } from '@/lib/resend'
import { sendOrderWhatsApp } from '@/lib/whatsapp'
import { formatARS } from '@/lib/formatters'
import type { Order } from '@/types/order'

/**
 * Ejecuta el cumplimiento de una orden aprobada:
 *  - Descuenta stock de cada producto.
 *  - Envía el email de confirmación al comprador.
 *  - Envía el email de aviso al dueño.
 *  - Dispara la notificación de WhatsApp al dueño.
 *
 * Es idempotente a nivel de efectos "suaves" (los emails podrían reenviarse si
 * se llama dos veces), por eso el que la invoca debe asegurarse de llamarla
 * solo en la transición pending → approved (ver la guarda en cada webhook).
 *
 * Compartida entre el webhook de Mercado Pago y el de Getnet.
 */
export async function fulfillApprovedOrder(order: Order): Promise<void> {
  const supabase = createServiceClient()

  for (const item of order.items) {
    await supabase.rpc('decrement_product_stock', {
      product_id: item.product_id,
      qty: item.quantity,
    })
  }

  await getResend()
    .emails.send({
      from: FROM_EMAIL,
      to: order.customer_email,
      subject: `¡Tu compra en Bel Distribuciones está confirmada! (#${order.id.slice(0, 8)})`,
      html: buildBuyerEmail(order),
    })
    .catch((err) => console.error('[Fulfillment] Error email comprador:', err))

  await getResend()
    .emails.send({
      from: FROM_EMAIL,
      to: OWNER_EMAIL,
      subject: `🛍️ Nueva venta #${order.id.slice(0, 8)} - ${order.customer_name}`,
      html: buildOwnerEmail(order),
    })
    .catch((err) => console.error('[Fulfillment] Error email dueño:', err))

  await sendOrderWhatsApp(order)
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
          ${
            order.discount_ars > 0
              ? `<p style="margin: 4px 0; color: #2f7d32;"><strong>Bonificación:</strong> -${formatARS(order.discount_ars)}</p>`
              : ''
          }
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
      <p><strong>Medio de pago:</strong> ${order.payment_provider === 'getnet' ? 'Getnet' : 'Mercado Pago'}</p>
      <p><strong>Cliente:</strong> ${order.customer_name}</p>
      <p><strong>Email:</strong> ${order.customer_email}</p>
      <p><strong>Teléfono:</strong> ${order.customer_phone || 'No informado'}</p>
      <h2>Productos</h2>
      <ul>${items}</ul>
      <p><strong>Subtotal:</strong> ${formatARS(order.subtotal_ars)}</p>
      ${
        order.discount_ars > 0
          ? `<p style="color: #2f7d32;"><strong>Bonificación:</strong> -${formatARS(order.discount_ars)}</p>`
          : ''
      }
      <p><strong>Envío:</strong> ${formatARS(order.shipping_cost_ars)}</p>
      <p><strong>Total cobrado:</strong> ${formatARS(order.total_ars)}</p>
      <h2>Dirección</h2>
      <p>${addr.calle} ${addr.numero}${addr.piso_dpto ? `, ${addr.piso_dpto}` : ''}<br>
        ${addr.ciudad}, ${addr.provincia} (${addr.codigo_postal})</p>
      <p style="color: #888; font-size: 12px;">ID completo: ${order.id}</p>
    </div>
  `
}
