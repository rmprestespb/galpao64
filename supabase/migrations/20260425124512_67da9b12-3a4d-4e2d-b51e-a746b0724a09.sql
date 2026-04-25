ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS sale_image_original_url text,
ADD COLUMN IF NOT EXISTS sale_image_processed_url text,
ADD COLUMN IF NOT EXISTS sale_image_crop jsonb;

UPDATE public.products
SET
  sale_image_original_url = COALESCE(sale_image_original_url, images[2], images[1]),
  sale_image_processed_url = COALESCE(sale_image_processed_url, images[2], images[1])
WHERE sale_image_original_url IS NULL
   OR sale_image_processed_url IS NULL;

COMMENT ON COLUMN public.products.sale_image_original_url IS 'Original sales photo uploaded for the Garage Pro product stage.';
COMMENT ON COLUMN public.products.sale_image_processed_url IS 'Processed transparent-background sales image used by default in the Garage Pro product stage.';
COMMENT ON COLUMN public.products.sale_image_crop IS 'Manual crop adjustment metadata for fallback product isolation.';