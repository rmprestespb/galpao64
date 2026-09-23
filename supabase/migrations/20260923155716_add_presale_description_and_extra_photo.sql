-- Descrição detalhada (linha por linha) e uma 3ª foto para as miniaturas de
-- pré-venda (/admin/pre-vendas). Antes disso o admin vinha usando o campo
-- "specs" (feito pra tags curtas tipo "Chassi de Metal") pra colar um texto
-- longo inteiro, o que aparecia como um bloco só, sem quebra de linha.
--
-- description: texto livre, uma informação por linha (ex.: forma de
-- pagamento, prazo de fechamento do lote, parcelamento) — exibido em
-- /pre-vendas linha a linha, dentro de uma caixa própria.
-- extra_image_url: 3ª foto opcional da miniatura (além da foto principal e
-- da foto de hover), pra dar mais ângulos/embalagem sem depender só do hover.

ALTER TABLE public.presale_products
  ADD COLUMN description text,
  ADD COLUMN extra_image_url text;
