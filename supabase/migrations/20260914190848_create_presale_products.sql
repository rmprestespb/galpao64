-- Catálogo de miniaturas em pré-venda (/pre-vendas), gerenciado manualmente pelo admin
-- em /admin/pre-vendas. Antes esses dados viviam hardcoded em src/data/preVendas.ts;
-- agora ficam no banco para poderem ser cadastrados/editados sem precisar de deploy.

CREATE TABLE public.presale_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL CHECK (brand IN ('Mini GT', 'Pop Race', 'Tarmac Works', 'Kaido House')),
  ref text NOT NULL,
  name text NOT NULL,
  specs text[] NOT NULL DEFAULT '{}',
  image_url text NOT NULL,
  hover_image_url text,
  full_price_cents integer NOT NULL DEFAULT 0,
  deposit_price_cents integer NOT NULL DEFAULT 0,
  eta_date date,
  lot_code text,
  lot_closes_at timestamptz,
  is_published boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.presale_products TO anon, authenticated;
GRANT ALL ON public.presale_products TO service_role;

ALTER TABLE public.presale_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published presale products are viewable by everyone"
ON public.presale_products FOR SELECT
USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert presale products"
ON public.presale_products FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update presale products"
ON public.presale_products FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete presale products"
ON public.presale_products FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER presale_products_set_updated_at
BEFORE UPDATE ON public.presale_products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX presale_products_brand_idx ON public.presale_products (brand);
CREATE INDEX presale_products_display_order_idx ON public.presale_products (display_order);

-- Seed com os 16 itens (4 por marca) que estavam hardcoded na vitrine, usando as
-- fotos de estoque que já existiam no site (agora servidas de /presale-seed/*.jpg).
-- É só um ponto de partida: o admin pode editar, trocar a foto ou apagar cada um em
-- /admin/pre-vendas.
INSERT INTO public.presale_products
  (brand, ref, name, specs, image_url, hover_image_url, full_price_cents, deposit_price_cents, eta_date, lot_code, lot_closes_at, display_order)
VALUES
  ('Mini GT', 'Mini GT #642', 'Porsche 911 GT3 RS Weissach',
    ARRAY['Chassi de Metal', 'Pneus de Borracha', 'Licença Oficial'],
    '/presale-seed/car-porsche-green.jpg', '/presale-seed/car-gtr-grey.jpg',
    18990, 5500, '2026-11-01', 'LOTE 01', '2026-10-31T23:59:59-03:00', 1),
  ('Mini GT', 'Mini GT #655', 'Nissan Skyline GT-R R34 V-Spec',
    ARRAY['Chassi de Metal', 'Pneus de Borracha', 'Licença Oficial'],
    '/presale-seed/car-skyline-white.jpg', '/presale-seed/car-datsun-blue.jpg',
    17990, 5200, '2026-12-01', 'LOTE 01', '2026-10-31T23:59:59-03:00', 2),
  ('Mini GT', 'Mini GT #661', 'Lamborghini Countach LPI 800-4',
    ARRAY['Chassi de Metal', 'Rodas Aro Real', 'Licença Oficial'],
    '/presale-seed/car-lambo-black.jpg', '/presale-seed/car-mclaren-silver.jpg',
    19990, 6000, '2027-02-01', 'LOTE 02', '2027-01-31T23:59:59-03:00', 3),
  ('Mini GT', 'Mini GT #672', 'Toyota GR Supra A90 Jarama Racing',
    ARRAY['Chassi de Metal', 'Pneus de Borracha', 'Licença Oficial'],
    '/presale-seed/car-gtr-grey.jpg', '/presale-seed/car-skyline-white.jpg',
    19490, 5800, '2027-05-01', 'LOTE 03', '2027-04-30T23:59:59-03:00', 4),

  ('Pop Race', 'Pop Race #001', 'Toyota GR Yaris Pandem',
    ARRAY['Chassi de Metal', 'Pneus de Borracha', 'Widebody Oficial'],
    '/presale-seed/car-mustang-orange.jpg', '/presale-seed/car-bumblebee.jpg',
    20990, 6300, '2026-10-01', 'LOTE 01', '2026-10-31T23:59:59-03:00', 5),
  ('Pop Race', 'Pop Race #014', 'Nissan Silvia S15 Rocket Bunny',
    ARRAY['Chassi de Metal', 'Pneus de Borracha', 'Licença Oficial'],
    '/presale-seed/car-datsun-blue.jpg', '/presale-seed/car-skyline-white.jpg',
    21490, 6500, '2026-11-01', 'LOTE 01', '2026-10-31T23:59:59-03:00', 6),
  ('Pop Race', 'Pop Race #022', 'Ferrari F40 Liberty Walk',
    ARRAY['Chassi de Metal', 'Interior Detalhado', 'Licença Oficial'],
    '/presale-seed/car-ferrari-redline.jpg', '/presale-seed/car-ferrari-vintage.jpg',
    22990, 6900, '2027-01-01', 'LOTE 02', '2027-01-31T23:59:59-03:00', 7),
  ('Pop Race', 'Pop Race #031', 'Mazda RX-7 FD3S RE Amemiya',
    ARRAY['Chassi de Metal', 'Widebody Oficial', 'Edição Limitada'],
    '/presale-seed/car-datsun-blue.jpg', '/presale-seed/car-mustang-orange.jpg',
    21990, 6600, '2027-04-01', 'LOTE 03', '2027-04-30T23:59:59-03:00', 8),

  ('Tarmac Works', 'Tarmac Works T64', 'McLaren Senna GTR Test Car',
    ARRAY['Chassi de Metal', 'Pneus de Borracha', 'Livery Oficial'],
    '/presale-seed/car-mclaren-silver.jpg', '/presale-seed/car-lambo-black.jpg',
    23990, 7200, '2026-12-01', 'LOTE 01', '2026-10-31T23:59:59-03:00', 9),
  ('Tarmac Works', 'Tarmac Works T64R', 'Nissan GT-R R35 Nismo Nürburgring',
    ARRAY['Chassi de Metal', 'Rodas Aro Real', 'Licença Oficial'],
    '/presale-seed/car-gtr-grey.jpg', '/presale-seed/car-porsche-green.jpg',
    24990, 7500, '2027-03-01', 'LOTE 02', '2027-01-31T23:59:59-03:00', 10),
  ('Tarmac Works', 'Tarmac Works T64G', 'Porsche 911 GT3 Cup Manthey Racing',
    ARRAY['Chassi de Metal', 'Livery Oficial', 'Edição Limitada'],
    '/presale-seed/car-porsche-green.jpg', '/presale-seed/car-ferrari-redline.jpg',
    24490, 7300, '2027-01-01', 'LOTE 01', '2026-10-31T23:59:59-03:00', 11),
  ('Tarmac Works', 'Tarmac Works T64-GT3', 'BMW M4 GT3 Team WRT',
    ARRAY['Chassi de Metal', 'Pneus de Borracha', 'Livery Oficial'],
    '/presale-seed/car-lambo-black.jpg', '/presale-seed/car-gtr-grey.jpg',
    25490, 7600, '2027-05-01', 'LOTE 03', '2027-04-30T23:59:59-03:00', 12),

  ('Kaido House', 'Kaido House x MINI GT', 'Datsun 510 Wagon Kaido GT',
    ARRAY['Chassi de Metal', 'Peças Fotogravadas', 'Edição Limitada'],
    '/presale-seed/car-kombi-red.jpg', '/presale-seed/car-camaro-purple.jpg',
    25990, 7800, '2026-11-01', 'LOTE 01', '2026-10-31T23:59:59-03:00', 13),
  ('Kaido House', 'Kaido House V3', 'Datsun 240Z Kaido Works',
    ARRAY['Chassi de Metal', 'Pneus de Borracha', 'Edição Limitada'],
    '/presale-seed/car-camaro-purple.jpg', '/presale-seed/car-kombi-red.jpg',
    26990, 8100, '2027-02-01', 'LOTE 02', '2027-01-31T23:59:59-03:00', 14),
  ('Kaido House', 'Kaido House V4', 'Toyota Hilux Kaido Overland',
    ARRAY['Chassi de Metal', 'Suspensão Detalhada', 'Edição Limitada'],
    '/presale-seed/car-bumblebee.jpg', '/presale-seed/car-mustang-orange.jpg',
    27990, 8400, '2027-04-01', 'LOTE 03', '2027-04-30T23:59:59-03:00', 15),
  ('Kaido House', 'Kaido House V5', 'Toyota Supra Kaido Works V1',
    ARRAY['Chassi de Metal', 'Peças Fotogravadas', 'Edição Limitada'],
    '/presale-seed/car-ferrari-vintage.jpg', '/presale-seed/car-datsun-blue.jpg',
    27490, 8200, '2027-03-01', 'LOTE 02', '2027-01-31T23:59:59-03:00', 16);
