-- ============================================================
-- BEL DISTRIBUCIONES — Migration 004
-- Configuración de tienda editable desde el panel admin.
-- Correr DESPUÉS de migration_003_getnet.sql
-- ============================================================

-- ------------------------------------------------------------
-- SETTINGS de tienda (fila única, patrón singleton id = 1).
--   mp_discount_percent → bonificación % al pagar con Mercado Pago.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS store_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  mp_discount_percent NUMERIC NOT NULL DEFAULT 10
    CHECK (mp_discount_percent >= 0 AND mp_discount_percent <= 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fila única inicial con los valores por defecto.
INSERT INTO store_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- RLS: solo el service_role (backend) lee/escribe. El sitio público consulta
-- la bonificación a través de /api/settings, que corre en el servidor.
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- Órdenes: guardar la bonificación aplicada (en centavos) para que
-- el total quede desglosado y auditable.
-- ------------------------------------------------------------
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_ars INTEGER NOT NULL DEFAULT 0;
