ALTER TABLE public.presale_products ADD COLUMN description text;

ALTER TABLE public.presale_products ADD COLUMN extra_image_url text;

ALTER TABLE public.presale_products ADD COLUMN lot_size integer NOT NULL DEFAULT 0;

ALTER TABLE public.presale_products ADD COLUMN units_reserved integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.presale_products.description IS 'Descrição detalhada do produto exibida na vitrine';

NOTIFY pgrst, 'reload schema';