-- ============================================================
-- BEL DISTRIBUCIONES — Migration inicial
-- Correr en: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- ------------------------------------------------------------
-- CATEGORÍAS (antes era "brands" en DALT — acá son dinámicas)
-- El admin las crea y edita desde el panel.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- PRODUCTOS (simples por ahora; estructura lista para variantes)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  price_ars INTEGER NOT NULL DEFAULT 0, -- en centavos (ej: $8500 = 850000)
  stock INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false, -- destacado en home
  weight_grams INTEGER NOT NULL DEFAULT 500,
  dimensions_cm JSONB, -- { "largo": 30, "ancho": 20, "alto": 15 }
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- IMÁGENES DE PRODUCTOS (multi-imagen por producto)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL, -- URL completa de Supabase Storage
  position INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false
);

-- ------------------------------------------------------------
-- VARIANTES (dejamos la tabla lista para el futuro)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  sku_suffix TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  price_modifier_ars INTEGER NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- ÓRDENES (sin cuenta de cliente — igual que DALT)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mp_preference_id TEXT,
  mp_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address JSONB NOT NULL,
  shipping_method TEXT NOT NULL DEFAULT 'andreani_domicilio',
  shipping_cost_ars INTEGER NOT NULL DEFAULT 0,
  items JSONB NOT NULL, -- snapshot del carrito
  subtotal_ars INTEGER NOT NULL DEFAULT 0,
  total_ars INTEGER NOT NULL DEFAULT 0,
  andreani_tracking_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- ADMINS — usuarios autorizados a usar el panel
-- Se vinculan con auth.users de Supabase Auth por email.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- ÍNDICES
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_mp_preference ON orders(mp_preference_id);
CREATE INDEX IF NOT EXISTS idx_orders_mp_payment ON orders(mp_payment_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "Categorías activas son públicas" ON categories FOR SELECT USING (active = true);
CREATE POLICY "Productos activos son públicos" ON products FOR SELECT USING (active = true);
CREATE POLICY "Imágenes de productos son públicas" ON product_images FOR SELECT USING (true);
CREATE POLICY "Variantes son públicas" ON product_variants FOR SELECT USING (true);

-- Órdenes: insertar libremente; el resto lo hace el service_role
CREATE POLICY "Insertar órdenes libremente" ON orders FOR INSERT WITH CHECK (true);

-- Admins: solo el propio admin puede leerse a sí mismo
CREATE POLICY "Admins pueden verse a sí mismos" ON admins
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- FUNCIÓN HELPER: decrementar stock
-- ============================================================
CREATE OR REPLACE FUNCTION decrement_product_stock(product_id UUID, qty INTEGER)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(0, stock - qty),
      updated_at = now()
  WHERE id = product_id;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_variant_stock(variant_id UUID, qty INTEGER)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE product_variants
  SET stock = GREATEST(0, stock - qty)
  WHERE id = variant_id;
END;
$$;

-- Helper para chequear si un user es admin (se usa en middleware/API)
CREATE OR REPLACE FUNCTION is_admin(uid UUID)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS(SELECT 1 FROM admins WHERE user_id = uid);
$$;

-- ============================================================
-- DATOS INICIALES: categorías por defecto
-- ============================================================
INSERT INTO categories (name, slug, description, position) VALUES
  ('Peluquería', 'peluqueria', 'Productos profesionales para peluquería y estética', 1),
  ('Hogar', 'hogar', 'Artículos para el hogar y uso diario', 2),
  ('Cuidado personal', 'cuidado-personal', 'Productos de higiene y cuidado personal', 3)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEMILLA ADMIN — correr manualmente después de crear el user en Supabase Auth
-- ============================================================
-- 1. Crear usuario en Authentication > Users con email/password
-- 2. Ejecutar:
--    INSERT INTO admins (user_id, email, name, role)
--    VALUES (
--      (SELECT id FROM auth.users WHERE email = 'tu-email@bel.com'),
--      'tu-email@bel.com',
--      'Admin Bel',
--      'superadmin'
--    );

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Crear manualmente en Supabase Dashboard > Storage:
--   - Bucket: "product-images" (público, max 5MB por archivo)
--   - Bucket: "category-images" (público, max 2MB)
-- Políticas del bucket product-images:
--   SELECT: public
--   INSERT/UPDATE/DELETE: solo authenticated users que estén en admins
