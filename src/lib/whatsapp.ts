import type { Order } from '@/types/order'
import { formatARS } from './formatters'

/**
 * Envía una notificación a WhatsApp del dueño.
 * Si no hay credenciales de Twilio/API, solo loguea.
 */
export async function sendOrderWhatsApp(order: Order): Promise<void> {
  const ownerPhone = process.env.OWNER_WHATSAPP
  const twilioSid = process.env.TWILIO_ACCOUNT_SID
  const twilioToken = process.env.TWILIO_AUTH_TOKEN
  const twilioFrom = process.env.TWILIO_WHATSAPP_FROM

  const message = buildMessage(order)

  if (!ownerPhone || !twilioSid || !twilioToken || !twilioFrom) {
    console.log('[WhatsApp] Credenciales faltantes, no se envía. Mensaje:', message)
    return
  }

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: `whatsapp:${twilioFrom}`,
          To: `whatsapp:${ownerPhone}`,
          Body: message,
        }),
      }
    )

    if (!res.ok) {
      console.error('[WhatsApp] Twilio error:', await res.text())
    }
  } catch (err) {
    console.error('[WhatsApp] Error enviando:', err)
  }
}

function buildMessage(order: Order): string {
  const addr = order.shipping_address
  const items = order.items
    .map((i) => `• ${i.name}${i.variant_label ? ` (${i.variant_label})` : ''} ×${i.quantity}`)
    .join('\n')

  return `🛒 *Nueva venta Bel #${order.id.slice(0, 8)}*

Cliente: ${order.customer_name}
Tel: ${order.customer_phone || '-'}
Email: ${order.customer_email}

${items}

Subtotal: ${formatARS(order.subtotal_ars)}
Envío: ${formatARS(order.shipping_cost_ars)}
*Total: ${formatARS(order.total_ars)}*

Envío a:
${addr.calle} ${addr.numero}${addr.piso_dpto ? `, ${addr.piso_dpto}` : ''}
${addr.ciudad}, ${addr.provincia} (${addr.codigo_postal})`
}
