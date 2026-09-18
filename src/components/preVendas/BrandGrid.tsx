import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { BrandWithCount } from "@/hooks/useBrands";

/**
 * Portal de marcas da pré-venda: um card grande e clicável por marca
 * cadastrada no painel (/admin/marcas — ainda não existe, chega numa
 * próxima etapa; por ora as marcas vêm da migração inicial). Nenhuma
 * miniatura aparece aqui — só a contagem de quantas estão publicadas em
 * cada marca. Clicar em qualquer card leva pra /pre-vendas/:slug.
 */
const BrandGrid = ({ brands }: { brands: BrandWithCount[] }) => (
  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
    {brands.map((brand) => {
      const hasImage = Boolean(brand.card_image_url);
      return (
        <Link
          key={brand.id}
          to={`/pre-vendas/${brand.slug}`}
          className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1c1c1f] to-black shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/60 hover:shadow-[0_30px_70px_-25px_hsl(var(--primary)/0.35)]"
        >
          <div className="relative flex h-48 items-center justify-center overflow-hidden bg-black md:h-56">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background: `radial-gradient(65% 60% at 50% 48%, ${brand.accent_color ?? "hsl(var(--primary)/0.22)"}, transparent 72%)`,
              }}
            />
            {hasImage ? (
              <>
                <div
                  aria-hidden
                  className="absolute bottom-9 left-[14%] right-[14%] h-3.5 rounded-full bg-black/70 blur-[3px]"
                />
                <img
                  src={brand.card_image_url!}
                  alt={brand.name}
                  loading="lazy"
                  className="relative h-[80%] w-[86%] object-contain drop-shadow-[0_16px_16px_rgba(0,0,0,0.65)] transition-transform duration-500 group-hover:scale-[1.05]"
                />
              </>
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
                className="absolute left-3 top-3 h-8 w-auto drop-shadow-[0_4px_10px_rgba(0,0,0,0.7)]"
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
