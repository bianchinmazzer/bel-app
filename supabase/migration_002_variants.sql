-- ============================================================
-- BEL DISTRIBUCIONES — Migration 002
-- Simplificación de variantes: solo "tono" compartido precio/stock.
-- Correr DESPUÉS de migration.sql
-- ============================================================

-- Drop de la tabla anterior (si existe y estaba vacía, es seguro)
-- IMPORTANTE: solo correr esto si todavía no hay variantes cargadas.
DROP TABLE IF EXISTS product_variants;

-- Nueva tabla simplificada
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  -- El "tono" o etiqueta visible. Ej: "1", "6.66", "Rubio ceniza"
  label TEXT NOT NULL,
  -- Orden de aparición en el dropdown
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Un producto no puede tener dos variantes con el mismo label
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_variants_unique_label
  ON product_variants(product_id, label);

CREATE INDEX IF NOT EXISTS idx_product_variants_product
  ON product_variants(product_id, position);

-- RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Variantes son públicas para lectura" ON product_variants
  FOR SELECT USING (true);

-- La función decrement_variant_stock ya no es necesaria
DROP FUNCTION IF EXISTS decrement_variant_stock(UUID, INTEGER);
