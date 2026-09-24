-- Vincula (opcionalmente) uma foto de "No Galpão" a uma pré-venda específica.
-- Quando o lote da pré-venda vinculada encerra (prazo vence ou esgota), a
-- página /no-galpao passa a mostrar a previsão de chegada daquele modelo por
-- cima da foto — sinalizando que aquele item já não está mais em reserva,
-- só aguardando chegar fisicamente no Galpão. Puramente aditivo: não altera
-- nem remove nenhuma coluna existente.

ALTER TABLE public.galpao_photos
ADD COLUMN presale_product_id uuid REFERENCES public.presale_products(id) ON DELETE SET NULL;

CREATE INDEX galpao_photos_presale_product_id_idx ON public.galpao_photos (presale_product_id);

NOTIFY pgrst, 'reload schema';
