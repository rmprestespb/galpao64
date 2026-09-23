-- Controle de estoque por lote nas pré-vendas (/admin/pre-vendas).
--
-- lot_size: quantas unidades físicas existem naquele lote — o admin escolhe
-- entre 6, 12 ou 24 ao cadastrar/editar a miniatura.
-- units_reserved: quantas dessas unidades já foram reservadas. O site não
-- processa pagamento nem reserva automática (tudo é confirmado no WhatsApp/
-- Instagram), então esse número é atualizado manualmente pelo admin conforme
-- fecha cada reserva. Quando bate no lot_size, a miniatura passa a aparecer
-- como "Encerrada" em /pre-vendas mesmo que o prazo (lot_closes_at) não
-- tenha vencido.

ALTER TABLE public.presale_products
  ADD COLUMN lot_size integer NOT NULL DEFAULT 12,
  ADD COLUMN units_reserved integer NOT NULL DEFAULT 0;

ALTER TABLE public.presale_products
  ADD CONSTRAINT presale_products_lot_size_check CHECK (lot_size IN (6, 12, 24)),
  ADD CONSTRAINT presale_products_units_reserved_check CHECK (units_reserved >= 0 AND units_reserved <= lot_size);
