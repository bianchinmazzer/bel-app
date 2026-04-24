import type { CartItem } from './cart'

export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

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
  mp_preference_id: string
  mp_payment_id: string | null
  status: OrderStatus
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: ShippingAddress
  shipping_method: string
  shipping_cost_ars: number
  items: CartItem[]
  subtotal_ars: number
  total_ars: number
  andreani_tracking_number: string | null
  created_at: string
  updated_at: string
}
