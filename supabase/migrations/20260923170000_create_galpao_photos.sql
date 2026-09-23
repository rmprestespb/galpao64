-- Galeria "No Galpão" (/no-galpao) — fotos reais do espaço/estoque do Galpão 64,
-- cadastradas manualmente pelo admin em /admin/no-galpao (upload de imagem +
-- legenda opcional). Segue o mesmo padrão de presale_products: bucket de storage
-- "product-media" já existente, RLS por role de admin via has_role().

CREATE TABLE public.galpao_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text,
  is_published boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.galpao_photos TO anon, authenticated;
GRANT ALL ON public.galpao_photos TO service_role;

ALTER TABLE public.galpao_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published galpao photos are viewable by everyone"
ON public.galpao_photos FOR SELECT
USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert galpao photos"
ON public.galpao_photos FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update galpao photos"
ON public.galpao_photos FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete galpao photos"
ON public.galpao_photos FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER galpao_photos_set_updated_at
BEFORE UPDATE ON public.galpao_photos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX galpao_photos_display_order_idx ON public.galpao_photos (display_order);
