export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  position: number
  active: boolean
  created_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  position: number
  is_primary: boolean
}

export interface ProductVariant {
  id: string
  product_id: string
  label: string
  position: number
}

export interface Product {
  id: string
  sku: string
  name: string
  slug: string
  description: string | null
  category_id: string | null
  price_ars: number
  stock: number
  active: boolean
  featured: boolean
  weight_grams: number
  dimensions_cm: { largo: number; ancho: number; alto: number } | null
  created_at: string
  updated_at: string
  category?: Category | null
  images?: ProductImage[]
  variants?: ProductVariant[]
}
