import type { ShippingAddress } from '@/types/order'
import { formatARS } from './formatters'

/**
 * Medio de pago elegido en el checkout.
 *  - mercadopago: pasa por la pasarela y vuelve a la app.
 *  - transferencia / tres_cuotas: se coordinan 100% por WhatsApp (no hay
 *    pasarela ni orden en la base; el mensaje lleva todo el detalle al dueño).
 */
export type PayMethod = 'mercadopago' | 'transferencia' | 'tres_cuotas'

export const PAY_METHOD_LABEL: Record<PayMethod, string> = {
  mercadopago: 'Mercado Pago',
  transferencia: 'Transferencia bancaria',
  tres_cuotas: '3 cuotas sin interés',
}

/** Clave de localStorage donde el checkout deja el pedido para la pantalla final. */
export const SNAPSHOT_KEY = 'bel-last-order'

/**
 * Foto del pedido que viaja del checkout a la pantalla de confirmación
 * (vía localStorage) para armar el mensaje de WhatsApp al dueño. Los montos
 * están en centavos.
 */
export interface OrderSnapshot {
  method: PayMethod
  items: {
    name: string
    variant_label: string | null
    quantity: number
    price_ars: number
  }[]
  customer: { nombre: string; email: string; telefono: string }
  address: ShippingAddress
  deliveryType: 'D' | 'S'
  subtotal_ars: number
  discount_ars: number
  total_ars: number
  ref: string | null
}

/** Primera línea del mensaje, según cómo pagó / va a pagar el cliente. */
const OPENERS: Record<PayMethod, string> = {
  mercadopago:
    '¡Hola! Te hice esta compra y *pagué con Mercado Pago* 💳. Tenemos que coordinar el envío 📦',
  transferencia:
    '¡Hola! Te hice esta compra y quiero *pagar por transferencia*. Pasame tu alias para transferir y coordinamos el envío 📦',
  tres_cuotas:
    '¡Hola! Te hice esta compra y quiero pagar en *3 cuotas sin interés*. Pasame el link de pago y coordinamos el envío 📦',
}

/**
 * Arma el texto del WhatsApp que recibe el dueño: detalle de la compra, datos
 * del cliente para cotizar el envío y cómo pagó o va a pagar.
 */
export function buildOrderWhatsApp(s: OrderSnapshot): string {
  const productos = s.items
    .map(
      (i) =>
        `• ${i.name}${i.variant_label ? ` (${i.variant_label})` : ''} ×${i.quantity} — ${formatARS(
          i.price_ars * i.quantity
        )}`
    )
    .join('\n')

  const entrega = s.deliveryType === 'S' ? 'Retiro en sucursal OCA' : 'Envío a domicilio'

  const a = s.address
  const direccion = `${a.calle} ${a.numero}${a.piso_dpto ? `, ${a.piso_dpto}` : ''}\n${a.ciudad}, ${a.provincia} (CP ${a.codigo_postal})`

  const totales = [
    `Subtotal: ${formatARS(s.subtotal_ars)}`,
    s.discount_ars > 0 ? `Descuento transferencia: -${formatARS(s.discount_ars)}` : null,
    `*Total productos: ${formatARS(s.total_ars)}* (envío a cotizar aparte)`,
  ]
    .filter(Boolean)
    .join('\n')

  return [
    OPENERS[s.method],
    '',
    '🛒 *Mi pedido:*',
    productos,
    '',
    totales,
    '',
    `📦 *Entrega:* ${entrega}`,
    direccion,
    '',
    '👤 *Mis datos:*',
    s.customer.nombre,
    `📱 ${s.customer.telefono}`,
    `✉️ ${s.customer.email}`,
    s.ref ? `\n🧾 Pedido #${s.ref.slice(0, 8)}` : '',
  ].join('\n')
}
