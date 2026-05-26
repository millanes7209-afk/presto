-- Ejecutar este SQL en Supabase → SQL Editor
ALTER TABLE pagos
  ADD COLUMN IF NOT EXISTS saldo_antes DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS saldo_despues DECIMAL(10, 2);
