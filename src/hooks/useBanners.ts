import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type BannerRow = Tables<"banners">;

/** Chave de página usada pra filtrar banners específicos de uma rota — um
 * banner sem `pagina` (null) aparece em todas. Novas páginas podem usar essa
 * mesma union conforme forem recebendo banners (mystery-box, album, no-galpao). */
export type BannerPage = "pre-vendas";

export type BannerPosition = "LEFT" | "RIGHT";

/**
 * Busca os banners verticais ativos (tabela `banners`, cadastrados em
 * /admin/banners) pra uma página + posição específicas. RLS do banco já
 * garante que visitantes anônimos só recebem banners ativos e dentro do
 * período de campanha — o filtro de página/posição é feito aqui porque é
 * barato (poucas linhas) e evita duplicar índices/policies por página.
 */
export function useBanners(page: BannerPage, position: BannerPosition) {
  const [banners, setBanners] = useState<BannerRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("posicao", position)
        .or(`pagina.is.null,pagina.eq.${page}`)
        .order("ordem", { ascending: true });

      if (error) {
        setBanners([]);
        return;
      }
      setBanners(data ?? []);
    } catch {
      // Falha de rede (proxy, offline, etc.) — evita quebrar a página; a
      // coluna de banner simplesmente fica vazia.
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, [page, position]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { banners, loading, refetch };
}
