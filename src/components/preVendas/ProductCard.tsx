import { useState } from "react";
import { PackageCheck, PackageX } from "lucide-react";
import { cn } from "@/lib/utils";
import { PreOrder, descriptionLines, formatEta, openReserveWhatsApp } from "@/data/preVendas";
import LotCountdown from "./LotCountdown";

const PaymentOption = ({
  active, onClick, label, hint,
}: { active: boolean; onClick: () => void; label: string; hint: string }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      "flex-1 rounded-lg border px-3 py-2 text-left transition-all duration-300",
      active
        ? "border-primary/70 bg-primary/10 shadow-[0_0_18px_-4px_hsl(var(--primary)/0.6)]"
        : "border-white/10 bg-white/[0.03] hover:border-white/25",
    )}
  >
    <span className={cn("block text-[12px] font-extrabold tracking-tight", active ? "text-primary" : "text-white")}>
      {label}
    </span>
    <span className="mt-0.5 block text-[10px] uppercase tracking-widest text-white/45">{hint}</span>
  </button>
);

const ProductCard = ({ product }: { product: PreOrder }) => {
  const [mode, setMode] = useState<"full" | "deposit">("full");

  const remaining = Math.max(product.lotSize - product.unitsReserved, 0);
  const soldOut = product.lotSize > 0 && remaining <= 0;

  const gallery = Array.from(
    new Set([product.image, product.hoverImage, product.extraImage].filter((u): u is string => Boolean(u))),
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const activeImage = gallery[activeIdx] ?? product.image;
  const showHoverPreview = activeIdx === 0 && gallery.length > 1;

  const descLines = descriptionLines(product.description);

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07]",
        "bg-[#0d0d0f] shadow-[0_20px_60px_-30px_rgba(0,0,0,1)]",
        "transition-all duration-500 hover:-translate-y-1 hover:border-primary/40",
        "hover:shadow-[0_30px_70px_-25px_hsl(var(--primary)/0.35)]",
      )}
    >
      {/* Badges */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/[0.06] bg-[#111113] px-3 py-2">
        <span className="inline-flex items-center rounded-full border border-primary/50 bg-primary/10 px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-[0.14em] text-primary">
          [ PRÉ-VENDA ]
        </span>
        {product.lotCode && (
          <span className="inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-[0.14em] text-gold">
            [ {product.lotCode} - RESERVA ]
          </span>
        )}
        {soldOut ? (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/60">
            <PackageX className="h-2.5 w-2.5" />
            Lote esgotado
          </span>
        ) : (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Reserva aberta
          </span>
        )}
      </div>

      {/* Stage */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-[#17171a] to-black">
        <img
          src={activeImage}
          alt={`${product.brand} ${product.name} em escala 1:64`}
          loading="lazy"
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-all duration-700",
            showHoverPreview && "group-hover:scale-105 group-hover:opacity-0",
          )}
        />
        {showHoverPreview && (
          <img
            src={gallery[1]}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-all duration-700 group-hover:opacity-100"
          />
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_0%,rgba(255,255,255,0.14),transparent_60%)] opacity-60 transition-opacity duration-500 group-hover:opacity-100"
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
        {product.lotClosesAt && (
          <div className="absolute bottom-2 left-2 z-10">
            <LotCountdown closesAt={product.lotClosesAt} />
          </div>
        )}
        {gallery.length > 1 && (
          <div className="absolute bottom-2 right-2 z-10 flex gap-1">
            {gallery.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActiveIdx(i)}
                aria-label={`Ver foto ${i + 1} de ${gallery.length}`}
                aria-pressed={i === activeIdx}
                className={cn(
                  "h-2 rounded-full border border-white/50 transition-all duration-300",
                  i === activeIdx ? "w-4 border-primary bg-primary" : "w-2 bg-black/50 hover:bg-white/70",
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary/80">{product.ref}</p>
          <h3 className="mt-1 text-base font-extrabold leading-tight tracking-tight text-white">{product.name}</h3>
        </div>

        <ul className="flex flex-wrap gap-1.5">
          {product.specs.map((s) => (
            <li
              key={s}
              className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/60"
            >
              {s}
            </li>
          ))}
        </ul>

        {/* Descrição livre cadastrada pelo admin — uma informação por linha */}
        {descLines.length > 0 && (
          <div className="space-y-1.5 rounded-lg border border-white/[0.07] bg-white/[0.02] p-3 text-[11px] leading-relaxed text-white/70">
            {descLines.map((line, i) => (
              <p key={i} className="flex gap-1.5">
                <span className="text-primary">•</span>
                <span>{line}</span>
              </p>
            ))}
          </div>
        )}

        {/* Caixa informativa da pré-venda */}
        <div className="space-y-1.5 rounded-lg border border-white/[0.07] bg-white/[0.02] p-3 text-[11px] leading-relaxed text-white/70">
          <p>📅 <span className="text-white/90 font-semibold">Data estimada de chegada:</span> {formatEta(product.etaDate)}</p>
          <p>📦 <span className="text-white/90 font-semibold">Envio do lote:</span> despachado assim que o lote físico der entrada no Galpão 64.</p>
          <p>🛡️ <span className="text-white/90 font-semibold">Garantia de reserva:</span> item 100% garantido com fornecedores oficiais.</p>
          <p>
            🔢 <span className="text-white/90 font-semibold">Unidades do lote:</span>{" "}
            {soldOut ? (
              <span className="text-white/60">{product.lotSize} de {product.lotSize} reservadas — esgotado</span>
            ) : (
              <span>
                {product.unitsReserved} de {product.lotSize} reservadas{" "}
                <span className="text-primary font-semibold">({remaining} {remaining === 1 ? "restante" : "restantes"})</span>
              </span>
            )}
          </p>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex gap-2">
            <PaymentOption
              active={mode === "full"}
              onClick={() => setMode("full")}
              label={`Integral: ${product.full}`}
              hint="-5% off"
            />
            <PaymentOption
              active={mode === "deposit"}
              onClick={() => setMode("deposit")}
              label={`Sinal: ${product.deposit}`}
              hint="restante na chegada ao Brasil"
            />
          </div>

          <button
            type="button"
            onClick={() => openReserveWhatsApp(product, mode)}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-full px-4 py-3",
              "bg-gradient-to-r from-primary to-[#ff8a3d] font-mono text-[11px] font-black uppercase tracking-[0.18em] text-black",
              "shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.8)] transition-all duration-300",
              "hover:brightness-110 hover:shadow-[0_14px_40px_-8px_hsl(var(--primary)/1)] active:scale-[0.98]",
            )}
          >
            <PackageCheck className="h-4 w-4" strokeWidth={2.5} />
            [ GARANTIR NA PRÉ-VENDA ]
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
