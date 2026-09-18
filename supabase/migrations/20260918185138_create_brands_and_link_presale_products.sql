-- Etapa 1 da reestruturação de Pré-vendas: cadastro de marcas pelo admin.
-- Antes, a marca de cada miniatura era um dos 4 valores travados num CHECK
-- (Mini GT, Pop Race, Tarmac Works, Kaido House), escritos direto no código.
-- Agora marca é uma entidade de verdade no banco, gerenciável pelo painel:
-- cadastrar uma marca aqui já cria o card em /pre-vendas e a página
-- /pre-vendas/:slug correspondente, sem precisar tocar em código.
--
-- Este passo é só ADITIVO: cria a tabela `brands` e adiciona a coluna
-- `brand_id` em `presale_products`, mas MANTÉM a coluna antiga `brand`
-- (texto) intacta, porque as páginas /pre-vendas/:marca e os cards de
-- produto ainda dependem dela até a próxima etapa (quando elas passam a
-- usar `brand_id`/`brands` também). Nada é removido nem quebrado aqui.

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

-- Semente com as 4 marcas que já existiam hardcoded no código (mesmos slugs
-- usados hoje em BRAND_SLUGS, pra não quebrar as rotas /pre-vendas/:marca
-- que já estão no ar). Sem logo/imagem por enquanto — o admin sobe as artes
-- reais pelo painel assim que a tela de cadastro de marcas estiver pronta
-- (próxima etapa); até lá o card mostra um placeholder com o nome da marca.
INSERT INTO public.brands (name, slug, description, display_order) VALUES
  ('Mini GT', 'mini-gt', 'Detalhes de resina em escala de bolso: freios pintados, faróis transparentes e vidros de verdade.', 1),
  ('Pop Race', 'pop-race', 'Widebodies e liveries JDM que esgotam em minutos assim que abre a pré-venda.', 2),
  ('Tarmac Works', 'tarmac-works', 'Licenças oficiais de pista com acabamento de colecionador — chassi de metal e rodas de aro real.', 3),
  ('Kaido House', 'kaido-house', 'Edições limitadas com peças fotogravadas e suspensão detalhada, para quem coleciona história.', 4);

-- Liga cada miniatura já cadastrada à marca correspondente. brand_id fica
-- nullable por enquanto (produto sem marca ainda aparece nas listagens
-- antigas via a coluna `brand` de texto, que continua existindo).
ALTER TABLE public.presale_products
  ADD COLUMN brand_id uuid REFERENCES public.brands(id);

UPDATE public.presale_products p
SET brand_id = b.id
FROM public.brands b
WHERE p.brand = b.name;

CREATE INDEX presale_products_brand_id_idx ON public.presale_products (brand_id);
