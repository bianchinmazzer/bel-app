import type { CartItem } from './cart'

export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export type PaymentProvider = 'mercadopago' | 'getnet'

export interface ShippingAddress {
  calle: string
  numero: string
  piso_dpto: string
  ciudad: string
  provincia: string
  codigo_postal: string
}

export interface Order {
  id: string
  payment_provider: PaymentProvider
  mp_preference_id: string | null
  mp_payment_id: string | null
  getnet_checkout_id: string | null
  getnet_payment_id: string | null
  paid_amount_ars: number | null
  status: OrderStatus
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: ShippingAddress
  shipping_method: string
  shipping_cost_ars: number
  items: CartItem[]
  subtotal_ars: number
  discount_ars: number
  total_ars: number
  andreani_tracking_number: string | null
  created_at: string
  updated_at: string
}
