import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { BRAND_SHOWCASE, BRAND_SLUGS, PRODUCTS, SingleBrand } from "@/data/preVendas";

// Ordem fixa de exibição do showroom — uma marca por card, sempre os mesmos 4.
const BRAND_ORDER: SingleBrand[] = ["Mini GT", "Pop Race", "Tarmac Works", "Kaido House"];

/**
 * Showroom de marcas: 4 cards clicáveis (um por marca), cada um com a arte de
 * destaque real da marca (recorte de fundo transparente) e a contagem real de
 * referências em pré-venda. Clicar em qualquer card leva direto para /pre-vendas/:marca.
 */
const BrandGrid = () => (
  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
    {BRAND_ORDER.map((brand) => {
      const items = PRODUCTS.filter((p) => p.brand === brand);
      const showcase = BRAND_SHOWCASE[brand];
      if (items.length === 0) return null;

      return (
        <Link
          key={brand}
          to={`/pre-vendas/${BRAND_SLUGS[brand]}`}
          className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1c1c1f] to-black shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/60 hover:shadow-[0_30px_70px_-25px_hsl(var(--primary)/0.35)]"
        >
          <div className="relative flex h-48 items-center justify-center overflow-hidden bg-black md:h-56">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: "radial-gradient(65% 60% at 50% 48%, hsl(var(--primary)/0.22), transparent 72%)" }}
            />
            <div
              aria-hidden
              className="absolute bottom-9 left-[14%] right-[14%] h-3.5 rounded-full bg-black/70 blur-[3px]"
            />
            <img
              src={showcase.image}
              alt={brand}
              loading="lazy"
              className="relative h-[80%] w-[86%] object-contain drop-shadow-[0_16px_16px_rgba(0,0,0,0.65)] transition-transform duration-500 group-hover:scale-[1.05]"
            />
          </div>

          <div className="flex flex-1 flex-col gap-2 border-t border-white/[0.06] p-5">
            <span className="text-lg font-black uppercase leading-tight tracking-tight text-white md:text-xl">
              {brand}
            </span>
            <span className="text-[12px] text-white/45">
              Escala 1:64 · {items.length} referência{items.length === 1 ? "" : "s"}
            </span>
            <span className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-white/60 transition-colors group-hover:text-primary">
              Ver coleção
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      );
    })}
  </div>
);

export default BrandGrid;
