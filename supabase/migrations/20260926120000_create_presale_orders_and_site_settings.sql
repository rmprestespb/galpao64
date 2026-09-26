-- Pedido direto no card de pré-venda: cliente escolhe sinal ou integral (com desconto),
-- paga via PIX (copia-e-cola/QR, sem gateway) e preenche um formulário rápido sem
-- precisar de cadastro. O pedido fica salvo aqui (visível em /admin/pedidos) e também
-- é encaminhado pra um webhook do Make.com (e-mail + Google Sheets), configurado
-- separadamente como secret da edge function submit-presale-order.

-- Configurações do site editáveis pelo admin, visíveis publicamente quando fazem
-- parte do que já é exposto ao cliente de qualquer forma (a chave PIX aparece pra
-- qualquer visitante dentro do QR Code/copia-e-cola gerado no card, então não há
-- ganho de segurança em escondê-la aqui). Linha única (id fixo 'default').
CREATE TABLE public.site_settings (
  id text PRIMARY KEY DEFAULT 'default',
  pix_key text,
  pix_merchant_name text,
  pix_city text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.site_settings (id) VALUES ('default');

GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings are viewable by everyone"
ON public.site_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can update site settings"
ON public.site_settings FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER site_settings_set_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Pedidos de pré-venda feitos pelo cliente direto no card. Inserido só pela edge
-- function submit-presale-order (service role) — o valor cobrado é sempre calculado
-- no servidor a partir do preço real do produto, nunca aceito direto do navegador
-- do cliente, pra não dar pra manipular o valor. Não existe confirmação automática
-- de pagamento (PIX sem gateway): customer_confirmed_payment é só o que o cliente
-- marcou no formulário ("já paguei"); status é ajustado manualmente pelo admin
-- depois de conferir.
CREATE TABLE public.presale_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  presale_product_id uuid NOT NULL REFERENCES public.presale_products(id) ON DELETE RESTRICT,
  payment_mode text NOT NULL CHECK (payment_mode IN ('deposit', 'full')),
  amount_cents integer NOT NULL,
  customer_name text NOT NULL,
  customer_whatsapp text NOT NULL,
  customer_email text,
  customer_confirmed_payment boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'confirmado', 'cancelado')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.presale_orders TO service_role;

ALTER TABLE public.presale_orders ENABLE ROW LEVEL SECURITY;

-- Sem policy de INSERT/SELECT pra anon/authenticated de propósito: o cliente nunca
-- lê ou grava essa tabela direto do navegador (isso passaria os dados de outros
-- clientes e permitiria valores forjados). Toda escrita é feita pela edge function
-- com a service role key, que já bypassa RLS.
CREATE POLICY "Admins can view presale orders"
ON public.presale_orders FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update presale orders"
ON public.presale_orders FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER presale_orders_set_updated_at
BEFORE UPDATE ON public.presale_orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX presale_orders_product_idx ON public.presale_orders (presale_product_id);
CREATE INDEX presale_orders_status_idx ON public.presale_orders (status);
CREATE INDEX presale_orders_created_at_idx ON public.presale_orders (created_at DESC);

NOTIFY pgrst, 'reload schema';
