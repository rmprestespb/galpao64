import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { mapPresaleRow, PreOrder } from "@/data/preVendas";

/**
 * Busca as miniaturas de pré-venda publicadas (tabela presale_products).
 * O RLS do banco já garante que visitantes anônimos só recebem linhas com
 * is_published = true — aqui é só ordenar e mapear pro formato da UI.
 */
export function usePresaleProducts() {
  const [products, setProducts] = useState<PreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("presale_products")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setError(null);
        setProducts((data ?? []).map(mapPresaleRow));
      }
    } catch (err) {
      // Falha de rede (proxy, offline, etc.) — evita spinner infinito.
      setError(err instanceof Error ? err.message : "Falha de conexão");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { products, loading, error, refetch };
}
