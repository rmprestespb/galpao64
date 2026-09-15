import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_SLUGS, PreOrder, SingleBrand } from "@/data/preVendas";
import emptyPedestals from "@/assets/prevendas-garage-pedestals.jpg";
import heroKaidoHouse from "@/assets/prevendas-hero-kaido-house.jpg";

const BRAND_ORDER: SingleBrand[] = ["Mini GT", "Pop Race", "Tarmac Works", "Kaido House"];

// Uma imagem pronta por marca — cada uma já mostra as 3 miniaturas daquela marca
// coladas nos pedestais (arte gerada/tratada fora do site, com sombra e luz batendo
// com a cena). Sem imagem pronta pra marca, cai no piso vazio como placeholder.
const BRAND_HERO_IMAGES: Partial<Record<SingleBrand, string>> = {
  "Kaido House": heroKaidoHouse,
};

/**
 * Hero "garagem com pedestais": pills de marca clicáveis trocam qual imagem pronta
 * aparece em cena (uma por marca, com as 3 miniaturas já compostas na arte). O botão
 * abaixo leva pra página de pré-venda da marca selecionada.
 */
const BrandPedestalHero = ({ products }: { products: PreOrder[] }) => {
  const availableBrands = BRAND_ORDER.filter((brand) => products.some((p) => p.brand === brand));
  const [activeBrand, setActiveBrand] = useState<SingleBrand>(availableBrands[0] ?? "Mini GT");

  const brandHref = `/pre-vendas/${BRAND_SLUGS[activeBrand]}`;
  const heroImage = BRAND_HERO_IMAGES[activeBrand] ?? emptyPedestals;

  if (availableBrands.length === 0) return null;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Pills de marca */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
        {availableBrands.map((brand) => {
          const active = brand === activeBrand;
          return (
            <button
              key={brand}
              type="button"
              onClick={() => setActiveBrand(brand)}
              aria-pressed={active}
              className={cn(
                "rounded-lg border px-4 py-2 text-xs font-black uppercase tracking-wide transition-all sm:px-5 sm:text-sm",
                active
                  ? "border-primary bg-black text-primary shadow-[0_0_18px_hsl(var(--primary)/0.55)]"
                  : "border-white/15 bg-black/60 text-white/70 hover:border-white/30 hover:text-white",
              )}
            >
              {brand}
            </button>
          );
        })}
      </div>

      {/* Cena da garagem com os pedestais — imagem pronta, uma por marca */}
      <div
        className="relative mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black"
        style={{ aspectRatio: "1737 / 576" }}
      >
        <img
          key={activeBrand}
          src={heroImage}
          alt={`Miniaturas ${activeBrand} em pré-venda`}
          className="absolute inset-0 h-full w-full animate-premium-fade-in object-cover"
        />
      </div>

      {/* CTA único — vai pra página de pré-venda da marca selecionada */}
      <div className="mt-7 flex justify-center">
        <Link
          to={brandHref}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-9 py-3.5 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[0_16px_40px_-14px_hsl(var(--primary)/0.8)] transition-transform hover:scale-[1.03]"
        >
          Faça sua reserva
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default BrandPedestalHero;
