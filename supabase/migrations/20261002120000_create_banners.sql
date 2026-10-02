-- Banners verticais das laterais do site (desktop largo): espaços
-- editoriais/publicitários ao lado do conteúdo central (pré-vendas, mystery
-- box, álbum, no galpão). Mesmo padrão de permissões já usado em `brands`
-- (RLS: todo mundo vê os ativos, só admin cadastra/edita/apaga).
--
-- `pagina` nula = aparece em todas as páginas; preenchida com uma chave de
-- rota (ex.: "pre-vendas", "mystery-box", "album", "no-galpao") = só aparece
-- naquela página. `posicao` escolhe o lado. `data_inicio`/`data_fim` nulas =
-- sem limite de período; quando preenchidas, o banner só aparece dentro
-- da janela.
CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  imagem_url text,
  link text,
  cta_label text,
  selo text,
  posicao text NOT NULL CHECK (posicao IN ('LEFT', 'RIGHT')),
  pagina text,
  ordem integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  data_inicio timestamptz,
  data_fim timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.banners TO anon, authenticated;
GRANT ALL ON public.banners TO service_role;

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Visitante só vê banner ativo e dentro do período de campanha; admin vê tudo
-- (inclusive rascunho/fora do período), pra poder revisar antes de publicar.
CREATE POLICY "Active in-range banners are viewable by everyone"
ON public.banners FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin')
  OR (
    ativo = true
    AND (data_inicio IS NULL OR data_inicio <= now())
    AND (data_fim IS NULL OR data_fim >= now())
  )
);

CREATE POLICY "Admins can insert banners"
ON public.banners FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update banners"
ON public.banners FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete banners"
ON public.banners FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER banners_set_updated_at
BEFORE UPDATE ON public.banners
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX banners_pagina_posicao_idx ON public.banners (pagina, posicao, ordem);

NOTIFY pgrst, 'reload schema';
