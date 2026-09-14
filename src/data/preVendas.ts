import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";

import brandMiniGt from "@/assets/brand-mini-gt.webp";
import brandPopRace from "@/assets/brand-pop-race.webp";
import brandTarmacWorks from "@/assets/brand-tarmac-works.webp";
import brandKaidoHouse from "@/assets/brand-kaido-house.webp";

export const INSTAGRAM = "https://www.instagram.com/galpao64diecast/";
// Mesmo número usado nos outros pontos de contato do site (ProductGarageCard, botão flutuante do Index).
// Troque aqui caso queira usar um link de Grupo/Lista de transmissão do WhatsApp dedicado à Lista VIP.
export const WHATSAPP_NUMBER = "5546999350070";

export const BRANDS = ["Todas as Marcas", "Mini GT", "Pop Race", "Tarmac Works", "Kaido House"] as const;
export type Brand = (typeof BRANDS)[number];
export type SingleBrand = Exclude<Brand, "Todas as Marcas">;

// Slug de URL para cada marca (usado na rota /pre-vendas/:marca) e o mapa inverso.
export const BRAND_SLUGS: Record<SingleBrand, string> = {
  "Mini GT": "mini-gt",
  "Pop Race": "pop-race",
  "Tarmac Works": "tarmac-works",
  "Kaido House": "kaido-house",
};

export const SLUG_TO_BRAND: Record<string, SingleBrand> = Object.fromEntries(
  (Object.entries(BRAND_SLUGS) as [SingleBrand, string][]).map(([brand, slug]) => [slug, brand]),
) as Record<string, SingleBrand>;

// Arte de destaque de cada marca no showroom (/pre-vendas) — recorte real do miniatura,
// usado só como vitrine visual da marca; os preços e specs reais ficam no banco (presale_products).
export const BRAND_SHOWCASE: Record<SingleBrand, { image: string; caption: string }> = {
  "Mini GT": { image: brandMiniGt, caption: "Toyota Supra — Edição Fast & Furious" },
  "Pop Race": { image: brandPopRace, caption: "Honda Civic Type R — Edição EVA" },
  "Tarmac Works": { image: brandTarmacWorks, caption: "Porsche 911 GT3 R — Falken Motorsports" },
  "Kaido House": { image: brandKaidoHouse, caption: "Chevrolet C10 — HKS x Yokohama" },
};

// Miniatura de pré-venda pronta para exibição — mapeada a partir da linha real do
// banco (tabela presale_products, cadastrada em /admin/pre-vendas).
export type PreOrder = {
  id: string;
  brand: SingleBrand;
  ref: string;
  name: string;
  specs: string[];
  image: string;
  hoverImage: string;
  full: string;
  deposit: string;
  etaDate: string | null;
  lotCode: string | null;
  lotClosesAt: string | null;
};

export type PresaleProductRow = Tables<"presale_products">;

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const mapPresaleRow = (row: PresaleProductRow): PreOrder => ({
  id: row.id,
  brand: row.brand as SingleBrand,
  ref: row.ref,
  name: row.name,
  specs: row.specs ?? [],
  image: row.image_url,
  hoverImage: row.hover_image_url || row.image_url,
  full: formatBRL(row.full_price_cents),
  deposit: formatBRL(row.deposit_price_cents),
  etaDate: row.eta_date,
  lotCode: row.lot_code,
  lotClosesAt: row.lot_closes_at,
});

export const formatEta = (etaDate: string | null) => {
  if (!etaDate) return "Em breve";
  const label = format(parseISO(etaDate), "MMMM/yyyy", { locale: ptBR });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const buildReserveMessage = (p: PreOrder, mode: "full" | "deposit") => {
  const valor = mode === "full" ? p.full : p.deposit;
  const modoLabel = mode === "full" ? "Pagamento integral (com desconto)" : "Sinal de reserva (30%)";
  return (
    `Olá! Quero *garantir minha pré-venda* no Galpão 64 🚗\n\n` +
    `*Modelo:* ${p.name}\n` +
    `*Referência:* ${p.ref}\n` +
    `*Lote:* ${p.lotCode ?? "—"}\n` +
    `*Previsão de chegada:* ${formatEta(p.etaDate)}\n` +
    `*Forma escolhida:* ${modoLabel}\n` +
    `*Valor:* ${valor}\n\n` +
    `Pode confirmar minha vaga no lote e me passar os dados para o PIX?`
  );
};

export const openReserveWhatsApp = (p: PreOrder, mode: "full" | "deposit") => {
  const msg = buildReserveMessage(p, mode);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
};
