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
GRANT INSERT, UPDATE, DELETE ON public.presale_products TO authenticated;
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