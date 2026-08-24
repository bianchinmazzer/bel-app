-- ============================================================
-- BEL DISTRIBUCIONES — Migration 005
-- Envío por Correo Argentino: caja estándar configurable + datos
-- del envío en cada orden (sucursal / rótulo PAQ.AR).
-- Correr DESPUÉS de migration_004_settings.sql
-- ============================================================

-- ------------------------------------------------------------
-- Caja estándar de despacho (se usa para cotizar el volumen).
-- Bel despacha en una caja de tamaño fijo; a veces va más llena,
-- a veces más vacía. Estas medidas se editan desde /admin/configuracion.
-- ------------------------------------------------------------
ALTER TABLE store_settings
  ADD COLUMN IF NOT EXISTS box_largo_cm INTEGER NOT NULL DEFAULT 30
    CHECK (box_largo_cm > 0 AND box_largo_cm <= 150),
  ADD COLUMN IF NOT EXISTS box_ancho_cm INTEGER NOT NULL DEFAULT 20
    CHECK (box_ancho_cm > 0 AND box_ancho_cm <= 150),
  ADD COLUMN IF NOT EXISTS box_alto_cm INTEGER NOT NULL DEFAULT 15
    CHECK (box_alto_cm > 0 AND box_alto_cm <= 150);

-- ------------------------------------------------------------
-- Datos de envío por orden.
--   delivery_type      → 'D' domicilio | 'S' sucursal.
--   agency_code/name   → sucursal elegida (solo para 'S').
--   correo_tracking_number → nº de seguimiento devuelto por PAQ.AR.
--   correo_label_url   → link/base64 del rótulo (PDF) para imprimir.
-- ------------------------------------------------------------
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_type TEXT NOT NULL DEFAULT 'D'
    CHECK (delivery_type IN ('D', 'S')),
  ADD COLUMN IF NOT EXISTS agency_code TEXT,
  ADD COLUMN IF NOT EXISTS agency_name TEXT,
  ADD COLUMN IF NOT EXISTS correo_tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS correo_label_url TEXT;
