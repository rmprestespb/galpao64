import { useEffect, useMemo, useState } from "react";
import {
  Award,
  Boxes,
  Cog,
  Loader2,
  MapPin,
  MessageCircle,
  Package,
  Ruler,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateZoomCrops, removeBackgroundFromUrl } from "@/lib/removeBackground";
import galpaoLogo from "@/assets/galpao64-logo.png";

export type ShowroomProductData = {
  id: string;
  title: string;
  series?: string | null;
  price_cents: number;
  /** Foto 1 — Destaque (carro fora do blister, será limpa via IA) */
  highlightImage: string;
  /** Foto 1 já processada (sem fundo) — opcional, evita reprocessamento */
  highlightProcessed?: string | null;
  /** Foto 2 — Prova de colecionador (carro na cartela/blister) — opcional */
  blisterImage?: string | null;
  description?: string;
  alt?: string;
  status?: "disponivel" | "reservado" | "vendido";
  brand?: string;
  scale?: string;
  origin?: string;
  shipping?: string;
};

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Props = {
  product: ShowroomProductData;
  whatsappNumber?: string;
};

const Rivet = ({ className }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={cn(
      "absolute h-2.5 w-2.5 rounded-full",
      "bg-[radial-gradient(circle_at_30%_30%,#e8e8e8_0%,#7a7a7a_45%,#1a1a1a_100%)]",
      "shadow-[inset_0_0_2px_rgba(0,0,0,0.8),0_1px_2px_rgba(0,0,0,0.6)]",
      className,
    )}
  />
);

const CertItem = ({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: typeof Cog;
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div className="flex items-start gap-2">
    <div
      className={cn(
        "shrink-0 rounded-md border p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
        highlight
          ? "border-[#FFB347]/40 bg-[linear-gradient(180deg,#3a2a1a,#0e0e0e)]"
          : "border-white/15 bg-[linear-gradient(180deg,#2a2a2a,#0e0e0e)]",
      )}
    >
      <Icon
        className={cn("h-3.5 w-3.5", highlight ? "text-[#FFD27A]" : "text-[#9ad9ff]")}
        strokeWidth={2}
      />
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
        {label}
      </p>
      <p
        className={cn(
          "text-[11px] font-semibold truncate",
          highlight ? "text-[#FFD27A]" : "text-white/90",
        )}
        title={value}
      >
        {value}
      </p>
    </div>
  </div>
);

const ShowroomCard = ({ product, whatsappNumber = "5546999350070" }: Props) => {
  const status = product.status ?? "disponivel";
  const isLocked = status === "reservado" || status === "vendido";

  // ---- Foto 1 (destaque) — IA remove fundo ----
  const [highlightStage, setHighlightStage] = useState<string | null>(
    product.highlightProcessed ?? null,
  );
  const [zooms, setZooms] = useState<string[]>([]);
  const [processing, setProcessing] = useState(!product.highlightProcessed);

  useEffect(() => {
    let cancelled = false;
    if (!product.highlightImage) return;

    // Zoom thumbnails — sempre da Foto 1 (carro)
    generateZoomCrops(product.highlightImage, 3, 220)
      .then((crops) => !cancelled && setZooms(crops))
      .catch(
        () =>
          !cancelled &&
          setZooms([
            product.highlightImage,
            product.highlightImage,
            product.highlightImage,
          ]),
      );

    if (product.highlightProcessed) {
      setHighlightStage(product.highlightProcessed);
      setProcessing(false);
      return () => {
        cancelled = true;
      };
    }

    setProcessing(true);
    removeBackgroundFromUrl(product.highlightImage)
      .then((url) => {
        if (cancelled) return;
        setHighlightStage(url);
        setProcessing(false);
      })
      .catch((err) => {
        console.error("[Showroom] removeBackground failed:", err);
        if (cancelled) return;
        setHighlightStage(product.highlightImage);
        setProcessing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [product.highlightImage, product.highlightProcessed]);

  // ---- Seletor de visão (galeria) ----
  type View = "highlight" | "blister";
  const [view, setView] = useState<View>("highlight");
  const hasBlister = Boolean(product.blisterImage);

  // Quando o usuário clica no zoom também troca para "highlight"
  const goHighlight = () => setView("highlight");
  const goBlister = () => hasBlister && setView("blister");

  const stageImage =
    view === "blister" && product.blisterImage ? product.blisterImage : highlightStage;
  const isBlisterView = view === "blister" && hasBlister;

  const sendToWhatsApp = () => {
    const currentImage =
      isBlisterView && product.blisterImage ? product.blisterImage : product.highlightImage;
    const message = encodeURIComponent(
      `Olá! Tenho interesse no modelo "${product.title}"` +
        (product.series ? ` (${product.series})` : "") +
        ` — ${formatBRL(product.price_cents)}.\n` +
        `Visualizando: ${isBlisterView ? "Foto na cartela (blister)" : "Foto em destaque"}\n` +
        `Imagem: ${currentImage}\n\n` +
        `Gostaria de confirmar disponibilidade.`,
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  const certItems = useMemo(
    () => [
      { icon: Cog, label: "Modelo", value: product.title },
      { icon: Boxes, label: "Coleção", value: product.series ?? "—" },
      { icon: Ruler, label: "Escala", value: product.scale ?? "1:64" },
      {
        icon: hasBlister ? Package : ShieldCheck,
        label: "Condição",
        value: hasBlister ? "Mint in Blister" : "Loose / Avulso",
        highlight: hasBlister,
      },
      { icon: MapPin, label: "Origem", value: product.origin ?? "Importado" },
      { icon: Truck, label: "Frete", value: product.shipping ?? "A combinar" },
    ],
    [product, hasBlister],
  );

  return (
    <article
      className={cn(
        "showroom-card relative isolate flex flex-col rounded-[14px] overflow-hidden",
        "bg-[linear-gradient(135deg,#2a2a2a_0%,#1a1a1a_30%,#0d0d0d_60%,#1a1a1a_100%)]",
        "border border-white/10",
        "shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.08)]",
        "transition-all duration-500 hover:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95),0_0_40px_-10px_rgba(0,229,255,0.45),inset_0_1px_0_rgba(255,255,255,0.08)]",
      )}
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg,rgba(255,255,255,0.025) 0 1px,transparent 1px 3px),linear-gradient(135deg,#2a2a2a 0%,#1a1a1a 30%,#0d0d0d 60%,#1a1a1a 100%)",
      }}
    >
      <Rivet className="left-2 top-2" />
      <Rivet className="right-2 top-2" />
      <Rivet className="left-2 bottom-2" />
      <Rivet className="right-2 bottom-2" />

      {/* Logo plate */}
      <div className="relative z-10 flex justify-center pt-3 pb-2">
        <div className="flex items-center gap-2 rounded-md border border-white/15 bg-black/60 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <img src={galpaoLogo} alt="Galpão 64" className="h-5 w-auto" />
          <span
            className="text-[10px] font-extrabold tracking-[0.3em] text-white/85"
            style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
          >
            SHOWROOM 64
          </span>
        </div>
      </div>

      {/* Stage + side zoom thumbs */}
      <div className="relative z-10 px-3 grid grid-cols-[1fr_auto] gap-3 items-stretch">
        <div
          className="relative rounded-lg overflow-hidden border border-white/10 aspect-square"
          style={{
            backgroundColor: "#1a1a1a",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px),radial-gradient(ellipse at center,rgba(0,229,255,0.06),transparent 70%)",
            backgroundSize: "20px 20px,20px 20px,100% 100%",
          }}
        >
          {/* Title */}
          <div className="absolute left-2 top-2 z-10 max-w-[60%] select-none">
            <p
              className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#00FFFF]/80 leading-none drop-shadow-[0_0_6px_rgba(0,229,255,0.5)]"
              style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
            >
              {isBlisterView ? "Cartela / Blister" : "Modelo"}
            </p>
            <p
              className="mt-0.5 text-[12px] font-extrabold uppercase tracking-[0.06em] text-white leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] truncate"
              style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
              title={product.title}
            >
              {product.title}
            </p>
          </div>

          {/* Price */}
          <div
            className="absolute right-2 top-2 z-10 select-none rounded-sm border border-white/20 px-2.5 py-1 shadow-[0_4px_14px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.15)]"
            style={{
              background: "linear-gradient(180deg,#3a2a1a 0%,#1a120a 100%)",
              fontFamily: "Montserrat, system-ui, sans-serif",
            }}
          >
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#FFB347]/80 leading-none">
              Preço
            </p>
            <p className="text-[15px] font-extrabold text-[#FFD27A] leading-tight drop-shadow-[0_0_8px_rgba(255,179,71,0.5)]">
              {formatBRL(product.price_cents)}
            </p>
          </div>

          {/* Status */}
          {isLocked && (
            <div className="absolute right-2 bottom-10 z-10">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] backdrop-blur border",
                  status === "reservado"
                    ? "bg-amber-500/20 text-amber-200 border-amber-400/40"
                    : "bg-red-500/20 text-red-200 border-red-400/40",
                )}
              >
                {status === "reservado" ? "Reservado" : "Vendido"}
              </span>
            </div>
          )}

          {/* Studio key light */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 40%, transparent 70%)",
            }}
          />

          {/* Drop shadow only on highlight view */}
          {!isBlisterView && (
            <>
              <div
                aria-hidden="true"
                className="absolute left-1/2 -translate-x-1/2 bottom-[14%] h-4 w-[62%] rounded-[50%]"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0) 75%)",
                  filter: "blur(6px)",
                }}
              />
              <div
                aria-hidden="true"
                className="absolute left-1/2 -translate-x-1/2 bottom-[15%] h-1.5 w-2/5 rounded-[50%] bg-black/80 blur-sm"
              />
            </>
          )}

          {/* Stage image with smooth crossfade */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            {stageImage ? (
              <img
                key={view}
                src={stageImage}
                alt={product.alt ?? product.title}
                className={cn(
                  "transition-opacity duration-500 ease-out animate-fade-in",
                  isBlisterView
                    ? "max-h-[92%] max-w-[94%] object-contain"
                    : "max-h-[78%] max-w-[88%] object-contain",
                )}
                style={{
                  filter: isBlisterView
                    ? "brightness(1.04) contrast(1.06) drop-shadow(0 14px 18px rgba(0,0,0,0.8))"
                    : "brightness(1.08) contrast(1.12) saturate(1.18) drop-shadow(0 2px 0 rgba(255,255,255,0.08)) drop-shadow(0 14px 20px rgba(0,0,0,0.85))",
                }}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-white/60">
                <Loader2 className="h-6 w-6 animate-spin text-[#00FFFF]" />
                <span className="text-[10px] uppercase tracking-[0.25em]">
                  Processando…
                </span>
              </div>
            )}
          </div>

          {processing && stageImage && !isBlisterView && (
            <div className="absolute right-2 bottom-2 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-[#00FFFF]/90">
              <Loader2 className="h-3 w-3 animate-spin" />
              IA
            </div>
          )}
        </div>

        {/* Right zoom thumbs — sempre da Foto 1 */}
        <div className="flex flex-col justify-center gap-3">
          {[0, 1, 2].map((i) => {
            const src = zooms[i] ?? product.highlightImage;
            return (
              <button
                key={i}
                type="button"
                onClick={goHighlight}
                aria-label={`Zoom detalhe ${i + 1} (carro)`}
                className={cn(
                  "relative h-14 w-14 rounded-full overflow-hidden",
                  "border-2 border-[#00FFFF]/70",
                  "shadow-[0_0_12px_rgba(0,229,255,0.55),inset_0_0_8px_rgba(0,229,255,0.25)]",
                  "bg-black transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]",
                )}
              >
                <img src={src} alt={`Zoom ${i + 1}`} className="h-full w-full object-cover" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Galeria — seletor de visão */}
      <div className="relative z-10 mt-3 px-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goHighlight}
            aria-pressed={!isBlisterView}
            className={cn(
              "relative h-14 w-14 shrink-0 rounded-md overflow-hidden border-2 transition-all",
              !isBlisterView
                ? "border-[#00FFFF] shadow-[0_0_14px_rgba(0,229,255,0.7)]"
                : "border-white/15 hover:border-white/40",
            )}
            title="Foto em destaque (carro)"
          >
            <img
              src={highlightStage ?? product.highlightImage}
              alt="Foto em destaque"
              className="h-full w-full object-cover bg-black"
            />
            <span className="absolute inset-x-0 bottom-0 bg-black/70 text-[8px] font-bold uppercase tracking-wider text-white text-center py-0.5">
              Destaque
            </span>
          </button>

          {hasBlister && (
            <button
              type="button"
              onClick={goBlister}
              aria-pressed={isBlisterView}
              className={cn(
                "relative h-14 w-14 shrink-0 rounded-md overflow-hidden border-2 transition-all",
                isBlisterView
                  ? "border-[#FFB347] shadow-[0_0_14px_rgba(255,179,71,0.7)]"
                  : "border-white/15 hover:border-white/40",
              )}
              title="Foto na cartela (blister)"
            >
              <img
                src={product.blisterImage!}
                alt="Foto na cartela"
                className="h-full w-full object-cover bg-black"
              />
              <span className="absolute inset-x-0 bottom-0 bg-black/70 text-[8px] font-bold uppercase tracking-wider text-[#FFD27A] text-center py-0.5">
                Cartela
              </span>
            </button>
          )}

          <p className="ml-2 text-[10px] uppercase tracking-[0.2em] text-white/55 leading-tight">
            {isBlisterView
              ? "Examine o estado do blister"
              : "Toque na cartela para ver o blister"}
          </p>
        </div>
      </div>

      {/* Certificate panel */}
      <div className="relative z-10 mx-3 mt-3 mb-3 rounded-md border border-white/10 bg-[linear-gradient(180deg,#161616,#0a0a0a)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
          <span className="inline-flex items-center gap-1.5">
            <Award className="h-3 w-3 text-[#00FFFF]" />
            <span
              className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-white/85"
              style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
            >
              Certificado de Exposição — Showroom 64
            </span>
          </span>
          <span className="text-[8px] uppercase tracking-[0.2em] text-white/30">
            #{product.id.slice(0, 6).toUpperCase()}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 px-3 py-2.5">
          {certItems.map((c) => (
            <CertItem
              key={c.label}
              icon={c.icon}
              label={c.label}
              value={c.value}
              highlight={c.highlight}
            />
          ))}
        </div>
      </div>

      {/* WhatsApp CTA */}
      <div className="relative z-10 px-3 pb-3">
        <button
          type="button"
          onClick={sendToWhatsApp}
          disabled={isLocked}
          aria-label={`Reservar ${product.title} no WhatsApp`}
          className={cn(
            "group/btn w-full inline-flex items-center justify-center gap-2",
            "rounded-md px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.2em]",
            "border-2 transition-all duration-300",
            isLocked
              ? "bg-white/5 text-white/30 border-white/10 cursor-not-allowed"
              : "bg-black text-white border-[#00FFFF]/80 shadow-[0_0_18px_-2px_rgba(0,229,255,0.55),inset_0_0_10px_rgba(0,229,255,0.08)] hover:shadow-[0_0_28px_-2px_rgba(0,229,255,0.85),inset_0_0_14px_rgba(0,229,255,0.18)] hover:border-[#00FFFF] active:scale-[0.99]",
          )}
          style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
        >
          <MessageCircle className="h-4 w-4 text-[#25D366]" strokeWidth={2.5} />
          Reservar no WhatsApp
        </button>
      </div>
    </article>
  );
};

export default ShowroomCard;