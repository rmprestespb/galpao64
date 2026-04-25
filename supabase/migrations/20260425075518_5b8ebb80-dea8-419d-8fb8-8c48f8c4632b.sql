-- Enum para status do produto
DO $$ BEGIN
  CREATE TYPE public.product_status AS ENUM ('disponivel', 'reservado', 'vendido');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Adiciona colunas na products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS status public.product_status NOT NULL DEFAULT 'disponivel',
  ADD COLUMN IF NOT EXISTS reservation_started_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);