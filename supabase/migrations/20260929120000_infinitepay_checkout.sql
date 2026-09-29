-- Troca o pagamento manual via PIX (cliente marca "já paguei", admin confere na
-- planilha) por um checkout de verdade via InfinitePay: o cliente paga com Pix
-- ou cartão parcelado direto no checkout deles, e a confirmação chega sozinha
-- por webhook — sem depender do cliente ser honesto nem do admin conferir.

-- InfiniteTag da conta (sem o "$"), usada pra gerar os links de checkout.
-- pix_key/pix_merchant_name/pix_city ficam como estavam: não são mais usados
-- pelo formulário de pedido, mas não têm por que sumir do banco.
ALTER TABLE public.site_settings
  ADD COLUMN infinitepay_handle text;

-- Novo estado inicial: pedido criado, aguardando o cliente terminar o
-- pagamento no checkout da InfinitePay (que pode nem voltar pra confirmar).
-- 'novo' continua existindo só pra não quebrar pedidos antigos (fluxo PIX
-- manual, já descontinuado). 'confirmado' agora é setado automaticamente
-- pelo webhook, não mais manualmente pelo admin.
ALTER TABLE public.presale_orders
  DROP CONSTRAINT presale_orders_status_check;

ALTER TABLE public.presale_orders
  ADD CONSTRAINT presale_orders_status_check
  CHECK (status IN ('aguardando_pagamento', 'novo', 'confirmado', 'cancelado'));

ALTER TABLE public.presale_orders
  ALTER COLUMN status SET DEFAULT 'aguardando_pagamento';

-- Dados devolvidos pela InfinitePay (via payment_check, confirmado no webhook):
-- método de pagamento, parcelas, valor efetivamente pago, identificadores da
-- transação (pra rastrear/conferir depois) e o link do recibo/comprovante.
ALTER TABLE public.presale_orders
  ADD COLUMN payment_method text,
  ADD COLUMN installments integer,
  ADD COLUMN paid_amount_cents integer,
  ADD COLUMN checkout_slug text,
  ADD COLUMN checkout_url text,
  ADD COLUMN transaction_nsu text,
  ADD COLUMN receipt_url text;

NOTIFY pgrst, 'reload schema';
