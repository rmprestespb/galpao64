import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "g64_album_seen_count";

/**
 * Conta o total de itens reservados (reservation_items) e compara com o
 * último valor que o usuário "viu" (clicando no menu ÁLBUM/RESERVAS).
 *
 * Retorna `newCount` = quantos itens novos foram adicionados desde a
 * última visita. Usado para mostrar um badge vermelho no menu.
 */
export const useAlbumBadge = () => {
  const [total, setTotal] = useState<number | null>(null);
  const [seen, setSeen] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? Number(raw) || 0 : 0;
  });

  const fetchTotal = useCallback(async () => {
    const { count, error } = await supabase
      .from("reservation_items")
      .select("id", { count: "exact", head: true });
    if (!error && typeof count === "number") {
      setTotal(count);
    }
  }, []);

  useEffect(() => {
    fetchTotal();

    // Realtime: quando alguém adiciona/remove um item de reserva,
    // re-busca a contagem para atualizar o badge instantaneamente.
    const channel = supabase
      .channel("album-badge")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservation_items" },
        () => {
          fetchTotal();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTotal]);

  const markSeen = useCallback(() => {
    if (total == null) return;
    setSeen(total);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, String(total));
    }
  }, [total]);

  // Primeira visita: alinha o "seen" com o total atual para não mostrar
  // badge gigante logo de cara. A partir daqui, só conta o que for novo.
  useEffect(() => {
    if (total == null) return;
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(STORAGE_KEY) == null) {
      window.localStorage.setItem(STORAGE_KEY, String(total));
      setSeen(total);
    }
  }, [total]);

  const newCount = total == null ? 0 : Math.max(0, total - seen);

  return { total, newCount, markSeen };
};