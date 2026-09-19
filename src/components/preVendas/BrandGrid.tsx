import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { BrandWithCount } from "@/hooks/useBrands";

import heroMiniGt from "@/assets/prevendas-hero-mini-gt.jpg";
import heroPopRace from "@/assets/prevendas-hero-pop-race.jpg";
import heroTarmacWorks from "@/assets/prevendas-hero-tarmac-works.jpg";
import heroKaidoHouse from "@/assets/prevendas-hero-kaido-house.jpg";

/**
 * Fallback local pras fotos de pedestal de cada marca (as mesmas usadas
 * antes no hero por pills), usado só enquanto a marca não tem
 * `card_image_url` cadastrado no banco — assim que o painel admin de
 * marcas existir e alguém subir uma foto própria, ela passa a valer no
 * lugar desta.
 */
const FALLBACK_CARD_IMAGE: Record<string, string> = {
  "mini-gt": heroMiniGt,
  "pop-race": heroPopRace,
  "tarmac-works": heroTarmacWorks,
  "kaido-house": heroKaidoHouse,
};

/**
 * Portal de marcas da pré-venda: um card grande e clicável por marca
 * cadastrada no painel (/admin/marcas — ainda não existe, chega numa
 * próxima etapa; por ora as marcas vêm da migração inicial). Nenhuma
 * miniatura aparece aqui — só a contagem de quantas estão publicadas em
 * cada marca. Clicar em qualquer card leva pra /pre-vendas/:slug.
 *
 * As fotos de pedestal (fallback) são painéis bem panorâmicos — 1736×576,
 * ~3:1 — com as 3 miniaturas da marca lado a lado. Por isso o card usa essa
 * MESMA proporção (aspect-[1736/576]) em vez de uma altura fixa: encaixando
 * a foto exatamente na proporção em que ela foi composta, nada é cortado
 * nas bordas e as 3 miniaturas aparecem inteiras, como no hero original.
 */
const BrandGrid = ({ brands }: { brands: BrandWithCount[] }) => (
  <div className="grid gap-5 sm:grid-cols-2">
    {brands.map((brand) => {
      const imageSrc = brand.card_image_url ?? FALLBACK_CARD_IMAGE[brand.slug] ?? null;
      return (
        <Link
          key={brand.id}
          to={`/pre-vendas/${brand.slug}`}
          className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1c1c1f] to-black shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/60 hover:shadow-[0_30px_70px_-25px_hsl(var(--primary)/0.35)]"
        >
          <div className="relative flex aspect-[1736/576] items-center justify-center overflow-hidden bg-black">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 opacity-60 transition-opacity duration-300 group-hover:opacity-80"
              style={{
                background: `linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%), radial-gradient(65% 60% at 50% 30%, ${brand.accent_color ?? "hsl(var(--primary)/0.18)"}, transparent 72%)`,
              }}
            />
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={brand.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
              />
            ) : (
              <span className="relative px-6 text-center text-2xl font-black uppercase leading-tight tracking-tight text-white/25 transition-colors duration-300 group-hover:text-white/40 md:text-3xl">
                {brand.name}
              </span>
            )}
            {brand.logo_url && (
              <img
                src={brand.logo_url}
                alt=""
                aria-hidden
                loading="lazy"
                className="absolute left-3 top-3 z-20 h-8 w-auto drop-shadow-[0_4px_10px_rgba(0,0,0,0.7)]"
              />
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2 border-t border-white/[0.06] p-5">
            <span className="text-lg font-black uppercase leading-tight tracking-tight text-white md:text-xl">
              {brand.name}
            </span>
            {brand.description && (
              <span className="line-clamp-2 text-[12px] leading-relaxed text-white/45">
                {brand.description}
              </span>
            )}
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">
              {brand.productCount} miniatura{brand.productCount === 1 ? "" : "s"} em pré-venda
            </span>
            <span className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-white/60 transition-colors group-hover:text-primary">
              Ver pré-vendas
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      );
    })}
  </div>
);

export default BrandGrid;
