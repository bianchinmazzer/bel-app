-- ============================================================
-- BEL DISTRIBUCIONES — Migration 003
-- Soporte multi-pasarela: Mercado Pago + Getnet conviviendo.
-- Correr DESPUÉS de migration_002_variants.sql
-- ============================================================

-- ------------------------------------------------------------
-- Proveedor de pago usado en cada orden.
-- 'mercadopago' | 'getnet'. Default mercadopago para no romper
-- las órdenes existentes.
-- ------------------------------------------------------------
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_provider TEXT NOT NULL DEFAULT 'mercadopago'
  CHECK (payment_provider IN ('mercadopago', 'getnet'));

-- ------------------------------------------------------------
-- Identificadores del lado de Getnet.
--   getnet_checkout_id → id de la sesión/checkout creada (equivale a mp_preference_id)
--   getnet_payment_id  → id de la transacción/pago aprobado (equivale a mp_payment_id)
-- ------------------------------------------------------------
ALTER TABLE orders ADD COLUMN IF NOT EXISTS getnet_checkout_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS getnet_payment_id TEXT;

-- ------------------------------------------------------------
-- Monto realmente confirmado por la pasarela (en centavos).
-- Se completa cuando el webhook valida el pago; permite comparar
-- contra total_ars antes de marcar la orden como pagada.
-- ------------------------------------------------------------
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_amount_ars INTEGER;

-- ------------------------------------------------------------
-- Índices para buscar la orden desde el webhook de Getnet.
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_orders_getnet_checkout ON orders(getnet_checkout_id);
CREATE INDEX IF NOT EXISTS idx_orders_getnet_payment ON orders(getnet_payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_provider ON orders(payment_provider);
