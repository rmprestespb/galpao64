import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type GalpaoPhotoRow = Tables<"galpao_photos">;

/**
 * Busca as fotos publicadas da galeria "No Galpão" (/no-galpao), cadastradas
 * pelo admin em /admin/no-galpao. RLS do banco já garante que visitantes
 * anônimos só recebem fotos com is_published = true.
 */
export function useGalpaoPhotos() {
  const [photos, setPhotos] = useState<GalpaoPhotoRow[]>([]);
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
      } else {
        setError(null);
        setPhotos(data ?? []);
      }
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
