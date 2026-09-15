import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_SLUGS, PreOrder, SingleBrand } from "@/data/preVendas";
import garageScene from "@/assets/prevendas-garage-pedestals.jpg";

const BRAND_ORDER: SingleBrand[] = ["Mini GT", "Pop Race", "Tarmac Works", "Kaido House"];

// Posição de cada um dos 3 pedestais dentro da cena (% da largura/altura da imagem).
// A imagem tem proporção fixa (aspect-ratio abaixo), então a posição não desloca ao redimensionar.
const PEDESTAL_SLOTS = [
  { left: "24%", bottom: "44%", width: "23%" },
  { left: "51%", bottom: "42%", width: "25%" },
  { left: "78%", bottom: "44%", width: "23%" },
];

/**
 * Hero "garagem com pedestais": pills de marca clicáveis trocam quais 3 miniaturas
 * aparecem em cena (uma por pedestal). O botão abaixo leva pra página de pré-venda
 * da marca selecionada — a troca de marca não navega, só troca o que está em cena.
 */
const BrandPedestalHero = ({ products }: { products: PreOrder[] }) => {
  const availableBrands = BRAND_ORDER.filter((brand) => products.some((p) => p.brand === brand));
  const [activeBrand, setActiveBrand] = useState<SingleBrand>(availableBrands[0] ?? "Mini GT");

  const items = products.filter((p) => p.brand === activeBrand).slice(0, 3);
  const brandHref = `/pre-vendas/${BRAND_SLUGS[activeBrand]}`;

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

      {/* Cena da garagem com os pedestais */}
      <div
        className="relative mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black"
        style={{ aspectRatio: "1737 / 576" }}
      >
        <img src={garageScene} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />

        {items.map((item, i) => {
          const slot = PEDESTAL_SLOTS[i];
          if (!slot) return null;
          return (
            <Link
              key={item.id}
              to={brandHref}
              title={item.name}
              className="group absolute bottom-0 -translate-x-1/2 animate-premium-fade-in"
              style={{ left: slot.left, bottom: slot.bottom, width: slot.width }}
            >
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                className="w-full drop-shadow-[0_18px_22px_rgba(0,0,0,0.65)] transition-transform duration-500 group-hover:-translate-y-1.5 group-hover:scale-[1.06]"
              />
            </Link>
          );
        })}
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
