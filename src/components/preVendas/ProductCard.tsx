import { useState } from "react";
import { ChevronDown, MessageCircle, PackageCheck, PackageX, Timer, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  INTEGRAL_DISCOUNT_PCT,
  PreOrder,
  descriptionLines,
  formatDeadline,
  formatEta,
  getAvailabilityStatus,
  openReserveWhatsApp,
} from "@/data/preVendas";
import LotCountdown from "./LotCountdown";
import OrderDialog from "./OrderDialog";

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
    <span className={cn("block text-xs font-extrabold tracking-tight", active ? "text-primary" : "text-white")}>
      {label}
    </span>
    <span className="mt-0.5 block text-[10px] uppercase tracking-widest text-white/45">{hint}</span>
  </button>
);

const ProductCard = ({ product }: { product: PreOrder }) => {
  const [mode, setMode] = useState<"full" | "deposit">("deposit");
  const [detailsOpen, setDetailsOpen] = useState(false);

  const status = getAvailabilityStatus(product.lotClosesAt, product.unitsReserved, product.lotSize);
  const closed = status === "encerrada";
  const remaining = Math.max(product.lotSize - product.unitsReserved, 0);
  const deadlineLabel = formatDeadline(product.lotClosesAt);

  const gallery = Array.from(
    new Set([product.image, product.hoverImage, product.extraImage].filter((u): u is string => Boolean(u))),
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const activeImage = gallery[activeIdx] ?? product.image;
  const showHoverPreview = activeIdx === 0 && gallery.length > 1;
  const [zoomOpen, setZoomOpen] = useState(false);

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
      {/* 1a. Etiquetas de status */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/[0.06] bg-[#111113] px-3 py-2">
        <span className="inline-flex items-center rounded-full border border-primary/50 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-primary">
          [ PRÉ-VENDA ]
        </span>
        {product.lotCode && (
          <span className="inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-gold">
            [ {product.lotCode} - RESERVA ]
          </span>
        )}
        {status === "encerrada" ? (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
            <PackageX className="h-3 w-3" />
            Reserva encerrada
          </span>
        ) : status === "fechando" ? (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-gold/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
            <Timer className="h-3 w-3" />
            Fechando em breve
          </span>
        ) : (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Reserva aberta
          </span>
        )}
      </div>

      {/* 1b. Foto grande + contador atual — clicar na foto abre ela ampliada */}
      <div
        className="relative aspect-[4/3] cursor-zoom-in overflow-hidden bg-gradient-to-b from-[#17171a] to-black"
        onClick={() => setZoomOpen(true)}
        role="button"
        tabIndex={0}
        aria-label="Ampliar foto"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setZoomOpen(true);
          }
        }}
      >
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
        <div
          aria-hidden
          className="pointer-events-none absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/50 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100"
        >
          <ZoomIn className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
        </div>
        {product.lotClosesAt && (
          <div className="absolute bottom-2 left-2 z-10">
            <LotCountdown closesAt={product.lotClosesAt} />
          </div>
        )}
        {gallery.length > 1 && (
          <div className="absolute bottom-2 right-2 z-10 flex gap-1" onClick={(e) => e.stopPropagation()}>
            {gallery.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIdx(i);
                }}
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
      <div className="flex flex-1 flex-col gap-3.5 p-4 md:p-5">
        {/* 2. Código e nome */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/80">{product.ref}</p>
          <h3 className="mt-1 text-lg font-extrabold leading-tight tracking-tight text-white">{product.name}</h3>
        </div>

        {/* 3. Bloco de preço em destaque */}
        <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/[0.09] to-transparent p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">Reserve por</p>
          <p className="mt-0.5 text-[28px] font-black leading-none tracking-tight text-primary md:text-3xl">
            {product.deposit}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 border-t border-white/10 pt-2.5 text-xs text-white/60">
            <span>
              Preço total: <strong className="font-bold text-white">{product.full}</strong>
            </span>
            <span>
              Saldo na chegada: <strong className="font-bold text-white">{product.balance}</strong>
            </span>
          </div>
        </div>

        {/* 4. Previsão de chegada e encerramento */}
        <div className="space-y-1 text-xs leading-relaxed text-white/70">
          <p>
            📅 Previsão de chegada: <strong className="font-semibold text-white">{formatEta(product.etaDate)}</strong>
          </p>
          <p>
            ⏳{" "}
            {closed ? (
              <strong className="font-semibold text-white/80">Reserva já encerrada</strong>
            ) : deadlineLabel ? (
              <>
                Reserva encerra em <strong className="font-semibold text-white">{deadlineLabel}</strong>
              </>
            ) : (
              <strong className="font-semibold text-white">Sem prazo definido</strong>
            )}
          </p>
        </div>

        {/* 5. Botões principais: pedido direto (PIX + formulário) ou WhatsApp */}
        {closed ? (
          <button
            type="button"
            disabled
            className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-white/[0.06] px-4 py-3.5 font-mono text-xs font-black uppercase tracking-[0.16em] text-white/40"
          >
            <PackageX className="h-4 w-4" strokeWidth={2.5} />
            Reserva encerrada
          </button>
        ) : (
          <div className="flex gap-2">
            <OrderDialog product={product} initialMode={mode} />
            <button
              type="button"
              onClick={() => openReserveWhatsApp(product, mode)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/15 px-3 py-3.5",
                "font-mono text-[10px] font-black uppercase tracking-[0.12em] text-white/70 transition-colors",
                "hover:border-primary/40 hover:text-white",
              )}
            >
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={2.5} />
              WhatsApp
            </button>
          </div>
        )}

        {/* 6. Ver detalhes da pré-venda */}
        <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen} className="mt-auto">
          <CollapsibleTrigger
            className={cn(
              "flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] py-2.5",
              "text-[11px] font-bold uppercase tracking-[0.14em] text-white/60 transition-colors hover:border-white/25 hover:text-white",
            )}
          >
            Ver detalhes da pré-venda
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300", detailsOpen && "rotate-180")} />
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-3 pt-3">
            {product.specs.length > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {product.specs.map((s) => (
                  <li
                    key={s}
                    className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/60"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}

            {/* Descrição livre cadastrada pelo admin — uma informação por linha */}
            {descLines.length > 0 && (
              <div className="space-y-1.5 rounded-lg border border-white/[0.07] bg-white/[0.02] p-3 text-xs leading-relaxed text-white/70">
                {descLines.map((line, i) => (
                  <p key={i} className="flex gap-1.5">
                    <span className="text-primary">•</span>
                    <span>{line}</span>
                  </p>
                ))}
              </div>
            )}

            {/* Caixa informativa da pré-venda */}
            <div className="space-y-1.5 rounded-lg border border-white/[0.07] bg-white/[0.02] p-3 text-xs leading-relaxed text-white/70">
              <p>📦 <span className="font-semibold text-white/90">Envio do lote:</span> despachado assim que o lote físico der entrada no Galpão 64.</p>
              <p>🛡️ <span className="font-semibold text-white/90">Garantia de reserva:</span> item 100% garantido com fornecedores oficiais.</p>
              <p>
                🔢 <span className="font-semibold text-white/90">Unidades do lote:</span>{" "}
                {closed ? (
                  <span className="text-white/60">{product.unitsReserved} de {product.lotSize} reservadas — encerrado</span>
                ) : (
                  <span>
                    {product.unitsReserved} de {product.lotSize} reservadas{" "}
                    <span className="font-semibold text-primary">({remaining} {remaining === 1 ? "restante" : "restantes"})</span>
                  </span>
                )}
              </p>
            </div>

            {/* Forma de pagamento — muda o valor/mensagem do botão de reserva acima */}
            {!closed && (
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                  Forma de pagamento da reserva
                </p>
                <div className="flex gap-2">
                  <PaymentOption
                    active={mode === "deposit"}
                    onClick={() => setMode("deposit")}
                    label={`Sinal: ${product.deposit}`}
                    hint="restante na chegada ao Brasil"
                  />
                  <PaymentOption
                    active={mode === "full"}
                    onClick={() => setMode("full")}
                    label={`Integral: ${product.fullDiscounted}`}
                    hint={`${INTEGRAL_DISCOUNT_PCT}% off, pagamento único`}
                  />
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Foto ampliada — abre ao clicar na imagem do card */}
      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-3xl border-white/10 bg-black/95 p-2 sm:p-3">
          <DialogTitle className="sr-only">
            {product.brand} {product.name} — foto ampliada
          </DialogTitle>
          <img
            src={activeImage}
            alt={`${product.brand} ${product.name} em escala 1:64 — foto ampliada`}
            className="max-h-[80vh] w-full rounded-lg object-contain"
          />
        </DialogContent>
      </Dialog>
    </article>
  );
};

export default ProductCard;
