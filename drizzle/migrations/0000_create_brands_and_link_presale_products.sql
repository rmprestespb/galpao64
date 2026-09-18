CREATE TABLE public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  card_image_url text,
  cover_image_url text,
  description text,
  accent_color text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.brands TO anon, authenticated;
GRANT ALL ON public.brands TO service_role;

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active brands are viewable by everyone"
ON public.brands FOR SELECT
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert brands"
ON public.brands FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update brands"
ON public.brands FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete brands"
ON public.brands FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER brands_set_updated_at
BEFORE UPDATE ON public.brands
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX brands_display_order_idx ON public.brands (display_order);

INSERT INTO public.brands (name, slug, description, display_order) VALUES
  ('Mini GT', 'mini-gt', 'Detalhes de resina em escala de bolso: freios pintados, faróis transparentes e vidros de verdade.', 1),
  ('Pop Race', 'pop-race', 'Widebodies e liveries JDM que esgotam em minutos assim que abre a pré-venda.', 2),
  ('Tarmac Works', 'tarmac-works', 'Licenças oficiais de pista com acabamento de colecionador — chassi de metal e rodas de aro real.', 3),
  ('Kaido House', 'kaido-house', 'Edições limitadas com peças fotogravadas e suspensão detalhada, para quem coleciona história.', 4);

ALTER TABLE public.presale_products
  ADD COLUMN brand_id uuid REFERENCES public.brands(id);

UPDATE public.presale_products p
SET brand_id = b.id
FROM public.brands b
WHERE p.brand = b.name;

CREATE INDEX presale_products_brand_id_idx ON public.presale_products (brand_id);