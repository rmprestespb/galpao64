import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type GalpaoPhotoRow = Tables<"galpao_photos">;

/** Dados mínimos da pré-venda vinculada a uma foto — só o necessário pra
 * decidir se o lote encerrou e mostrar a previsão de chegada (ver
 * getAvailabilityStatus/formatEta em @/data/preVendas). */
export type LinkedPresaleInfo = Pick<
  Tables<"presale_products">,
  "id" | "name" | "eta_date" | "lot_closes_at" | "lot_size" | "units_reserved"
>;

export type GalpaoPhotoWithPresale = GalpaoPhotoRow & {
  linkedPresale: LinkedPresaleInfo | null;
};

/**
 * Busca as fotos publicadas da galeria "No Galpão" (/no-galpao), cadastradas
 * pelo admin em /admin/no-galpao. RLS do banco já garante que visitantes
 * anônimos só recebem fotos com is_published = true. Quando uma foto está
 * vinculada a uma pré-venda (presale_product_id), busca também os dados
 * mínimos dela pra permitir mostrar a previsão de chegada quando o lote
 * encerrar.
 */
export function useGalpaoPhotos() {
  const [photos, setPhotos] = useState<GalpaoPhotoWithPresale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("galpao_photos")
        .select("*")
        .eq("is_published", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
        setPhotos([]);
        return;
      }

      const rows = data ?? [];
      const presaleIds = Array.from(
        new Set(rows.map((r) => r.presale_product_id).filter((id): id is string => Boolean(id))),
      );

      let presaleById = new Map<string, LinkedPresaleInfo>();
      if (presaleIds.length > 0) {
        const { data: presaleRows } = await supabase
          .from("presale_products")
          .select("id, name, eta_date, lot_closes_at, lot_size, units_reserved")
          .in("id", presaleIds);
        presaleById = new Map((presaleRows ?? []).map((p) => [p.id, p]));
      }

      setError(null);
      setPhotos(
        rows.map((r) => ({
          ...r,
          linkedPresale: r.presale_product_id ? presaleById.get(r.presale_product_id) ?? null : null,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha de conexão");
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { photos, loading, error, refetch };
}
