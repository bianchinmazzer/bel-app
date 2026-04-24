export interface CartItem {
  id: string // product_id + variant_id (o solo product_id)
  product_id: string
  variant_id: string | null
  name: string
  variant_label: string | null
  price_ars: number
  quantity: number
  image_url: string
  slug: string
  weight_grams: number
}
