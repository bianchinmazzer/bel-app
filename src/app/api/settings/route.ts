import { NextResponse } from 'next/server'
import { getStoreSettings } from '@/lib/settings'

/**
 * Configuración pública de la tienda (no sensible).
 * La usa el checkout para mostrar la bonificación de Mercado Pago.
 */
export async function GET() {
  const settings = await getStoreSettings()
  return NextResponse.json({ mp_discount_percent: settings.mp_discount_percent })
}
