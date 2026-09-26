import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  pixKey: string | null;
  pixMerchantName: string | null;
  pixCity: string | null;
};

/**
 * Configurações públicas do site (hoje só a chave PIX usada pra gerar o QR no
 * pedido do cliente). Linha única na tabela site_settings, id fixo "default".
 * A chave já fica visível pra qualquer visitante de qualquer forma (ela aparece
 * dentro do QR Code/copia-e-cola mostrado no card), então não há problema em
 * o RLS permitir leitura pública.
 */
export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("site_settings")
      .select("pix_key, pix_merchant_name, pix_city")
      .eq("id", "default")
      .maybeSingle();
    setSettings({
      pixKey: data?.pix_key ?? null,
      pixMerchantName: data?.pix_merchant_name ?? null,
      pixCity: data?.pix_city ?? null,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { settings, loading, refetch };
}
