import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type BrandRow = Tables<"brands">;

export type BrandWithCount = BrandRow & {
  /** Quantidade de miniaturas publicadas dessa marca em /pre-vendas. */
  productCount: number;
};

/**
 * Busca as marcas ativas (tabela `brands`, cadastradas em /admin/marcas) e o
 * número de miniaturas publicadas de cada uma — é o que alimenta os cards da
 * página inicial de Pré-vendas. RLS do banco já garante que visitantes
 * anônimos só recebem marcas com is_active = true.
 */
export function useBrands() {
  const [brands, setBrands] = useState<BrandWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data: brandRows, error: brandsError } = await supabase
        .from("brands")
        .select("*")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });

      if (brandsError) {
        setError(brandsError.message);
        setBrands([]);
        return;
      }

      const { data: productRows, error: productsError } = await supabase
        .from("presale_products")
        .select("brand_id")
        .eq("is_published", true);

      if (productsError) {
        // Não impede a página de mostrar as marcas — só fica sem a contagem.
        setError(productsError.message);
      } else {
        setError(null);
      }

      const counts = new Map<string, number>();
      for (const row of productRows ?? []) {
        if (!row.brand_id) continue;
        counts.set(row.brand_id, (counts.get(row.brand_id) ?? 0) + 1);
      }

      setBrands(
        (brandRows ?? []).map((b) => ({ ...b, productCount: counts.get(b.id) ?? 0 })),
      );
    } catch (err) {
      // Falha de rede (proxy, offline, etc.) — evita spinner infinito.
      setError(err instanceof Error ? err.message : "Falha de conexão");
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { brands, loading, error, refetch };
}
