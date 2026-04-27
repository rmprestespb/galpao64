import { useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Cog,
  MapPin,
  MessageCircle,
  Package,
  Play,
  Ruler,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import galpaoLogo from "@/assets/galpao64-logo.png";
import ProductLightbox, { LightboxMedia } from "@/components/ProductLightbox";

export type GarageProShowcaseData = {
  id: string;
  title: string;
  series?: string | null;
  description?: string | null;
  price_cents: number;
  /** Visão 1 — Loose: foto fotorealística do carro fora do blister (sem IA) */
  looseImage: string;
  /** Visão 2 — Foto real do blister, mantendo o fundo original */
  blisterImage?: string | null;
  /** Visão 3 — vídeo MP4 em loop (giro 360º) */
  videoUrl?: string | null;
  status?: "disponivel" | "reservado" | "vendido";
  alt?: string;
  brand?: string;
  scale?: string;
  origin?: string;
  shipping?: string;
};

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Props = {
  product: GarageProShowcaseData;
  whatsappNumber?: string;
};

type MediaSlide =
  | { kind: "image"; url: string; label: string }
  | { kind: "video"; url: string; label: string };

const SpecRow = ({
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
  <div
    className={cn(
      "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
      "bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]",
      highlight
        ? "border-[#FFB347]/35 hover:border-[#FFB347]/55"
        : "border-white/10 hover:border-[#00FFFF]/40",
    )}
  >
    <div
      className={cn(
        "shrink-0 grid place-items-center h-9 w-9 rounded-md border",
        highlight
          ? "border-[#FFB347]/40 bg-[linear-gradient(180deg,#3a2a1a,#0e0e0e)]"
          : "border-white/15 bg-[linear-gradient(180deg,#1f1f1f,#0a0a0a)]",
      )}
    >
      <Icon
        className={cn("h-4 w-4", highlight ? "text-[#FFD27A]" : "text-[#9ad9ff]")}
        strokeWidth={2}
      />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45 leading-none">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-[13px] font-semibold truncate",
          highlight ? "text-[#FFD27A]" : "text-white/95",
        )}
        title={value}
      >
        {value}
      </p>
    </div>
  </div>
);

const GarageProShowcase = ({
  product,
  whatsappNumber = "5546999350070",
}: Props) => {
  const status = product.status ?? "disponivel";
  const isLocked = status === "reservado" || status === "vendido";
  const hasBlister = Boolean(product.blisterImage);
  const hasVideo = Boolean(product.videoUrl);

  const slides = useMemo<MediaSlide[]>(() => {
    const arr: MediaSlide[] = [];
    if (product.looseImage)
      arr.push({ kind: "image", url: product.looseImage, label: "Loose" });
    if (product.blisterImage)
      arr.push({ kind: "image", url: product.blisterImage, label: "Blister" });
    if (product.videoUrl)
      arr.push({ kind: "video", url: product.videoUrl, label: "360º" });
    return arr;
  }, [product.looseImage, product.blisterImage, product.videoUrl]);

  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (slides[index]?.kind === "video" && videoRef.current) {
      videoRef.current.play().catch(() => undefined);
    }
  }, [index, slides]);

  const current = slides[index];

  const lightboxMedia = useMemo<LightboxMedia[]>(
    () =>
      slides.map((s) =>
        s.kind === "video"
          ? { kind: "video", url: s.url }
          : { kind: "image", url: s.url },
      ),
    [slides],
  );

  const goPrev = () =>
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  const goNext = () => setIndex((i) => (i + 1) % slides.length);

  const sendToWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse em saber a disponibilidade do modelo "${product.title}"` +
        (product.series ? ` (${product.series})` : "") +
        ` — ${formatBRL(product.price_cents)}.`,
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  const specs = useMemo(
    () => [
      { icon: Ruler, label: "Escala", value: product.scale ?? "1:64" },
      { icon: MapPin, label: "Origem", value: product.origin ?? "Importado" },
      {
        icon: hasBlister ? Package : ShieldCheck,
        label: "Condição",
        value: hasBlister ? "Mint in Blister" : "Loose / Avulso",
        highlight: hasBlister,
      },
      { icon: Truck, label: "Frete", value: product.shipping ?? "A combinar" },
    ],
    [product, hasBlister],
  );

  const statusBadge = isLocked ? (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] backdrop-blur border",
        status === "reservado"
          ? "bg-amber-500/20 text-amber-200 border-amber-400/40"
          : "bg-red-500/20 text-red-200 border-red-400/40",
      )}
    >
      {status === "reservado" ? "Reservado" : "Vendido"}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] backdrop-blur border bg-emerald-500/15 text-emerald-200 border-emerald-400/40">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
      Disponível
    </span>
  );

  return (
    <article
      className={cn(
        "garage-pro-pdp relative isolate overflow-hidden rounded-2xl",
        "bg-[linear-gradient(135deg,#1d1d1d_0%,#141414_40%,#0b0b0b_100%)]",
        "border border-white/10",
        "shadow-[0_40px_100px_-30px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.06)]",
      )}
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg,rgba(255,255,255,0.018) 0 1px,transparent 1px 4px),linear-gradient(135deg,#1d1d1d 0%,#141414 40%,#0b0b0b 100%)",
      }}
    >
      {/* Header bar */}
      <header className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 px-4 sm:px-6 py-3">
        <div className="flex items-center gap-2.5 rounded-md border border-white/15 bg-black/60 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <img src={galpaoLogo} alt="Galpão 64" className="h-5 w-auto" />
          <span
            className="text-[10px] font-extrabold tracking-[0.3em] text-white/85"
            style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
          >
            GARAGE PRO
          </span>
        </div>
        <div className="flex items-center gap-2">
          {statusBadge}
          <span className="hidden sm:inline text-[9px] uppercase tracking-[0.22em] text-white/35">
            #{product.id.slice(0, 6).toUpperCase()}
          </span>
        </div>
      </header>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-6 lg:gap-10 p-4 sm:p-6 lg:p-8">
        {/* ============ LEFT — MEDIA GALLERY ============ */}
        <div className="flex flex-col gap-4">
          <div
            className="relative w-full overflow-hidden rounded-xl border border-white/10 aspect-[4/3] lg:aspect-[16/11]"
            style={{
              backgroundColor: "#101010",
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px),radial-gradient(ellipse at center,rgba(0,229,255,0.08),transparent 65%)",
              backgroundSize: "26px 26px,26px 26px,100% 100%",
            }}
          >
            {/* Top key light */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 45%, transparent 70%)",
              }}
            />

            {/* Slide */}
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              aria-label={`Ampliar mídia de ${product.title}`}
              className="absolute inset-0 flex items-center justify-center p-6 cursor-zoom-in focus:outline-none"
            >
              {current?.kind === "video" ? (
                <video
                  ref={videoRef}
                  key={current.url}
                  src={current.url}
                  className="max-h-full max-w-full object-contain rounded-md"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                />
              ) : current ? (
                <img
                  key={current.url}
                  src={current.url}
                  alt={product.alt ?? product.title}
                  className="max-h-full max-w-full object-contain animate-fade-in"
                  style={{
                    filter:
                      "brightness(1.06) contrast(1.1) saturate(1.12) drop-shadow(0 24px 30px rgba(0,0,0,0.85))",
                  }}
                />
              ) : null}
            </button>

            {/* Prev / Next */}
            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/60 border border-white/20 text-white hover:bg-black/80 hover:border-[#00FFFF]/60 transition-colors flex items-center justify-center"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Próxima"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/60 border border-white/20 text-white hover:bg-black/80 hover:border-[#00FFFF]/60 transition-colors flex items-center justify-center"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Counter */}
            {slides.length > 1 && (
              <div className="absolute right-3 top-3 z-10 rounded-md bg-black/65 border border-white/15 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/85">
                {index + 1} / {slides.length}
              </div>
            )}

            {/* Label */}
            {current && (
              <div className="absolute left-3 bottom-3 z-10 rounded-md bg-black/65 border border-white/15 px-2.5 py-1">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#00FFFF]">
                  {current.label}
                </p>
              </div>
            )}
          </div>

          {/* Thumbs */}
          {slides.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {slides.map((s, i) => (
                <button
                  key={`${s.kind}-${s.url}-${i}`}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-pressed={i === index}
                  className={cn(
                    "relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-md overflow-hidden border-2 transition-all",
                    i === index
                      ? "border-[#00FFFF] shadow-[0_0_14px_rgba(0,229,255,0.7)]"
                      : "border-white/15 hover:border-white/40",
                  )}
                  title={s.label}
                >
                  {s.kind === "video" ? (
                    <>
                      <video src={s.url} className="h-full w-full object-cover" muted playsInline />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/45">
                        <Play className="h-5 w-5 text-[#00FFFF]" fill="currentColor" />
                      </span>
                    </>
                  ) : (
                    <img src={s.url} alt={s.label} className="h-full w-full object-cover bg-black" />
                  )}
                  <span className="absolute inset-x-0 bottom-0 bg-black/70 text-[8px] font-bold uppercase tracking-wider text-white text-center py-0.5">
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ============ RIGHT — PRODUCT INFO ============ */}
        <div className="flex flex-col">
          {product.series && (
            <span className="self-start inline-flex items-center gap-1.5 rounded-full border border-[#00FFFF]/40 bg-[#00FFFF]/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#9ff5ff]">
              <Boxes className="h-3 w-3" />
              {product.series}
            </span>
          )}

          <h2
            className="mt-3 text-2xl sm:text-3xl lg:text-[34px] font-extrabold leading-tight text-white"
            style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
          >
            {product.title}
          </h2>

          {/* Specs grid */}
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            {specs.map((s) => (
              <SpecRow
                key={s.label}
                icon={s.icon}
                label={s.label}
                value={s.value}
                highlight={s.highlight}
              />
            ))}
          </div>

          {/* Price */}
          <div className="mt-6 rounded-xl border border-white/10 bg-[linear-gradient(180deg,#161616,#0a0a0a)] p-4 sm:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/45">
              Valor
            </p>
            <p
              className="mt-1 text-3xl sm:text-4xl font-extrabold text-[#FFD27A] leading-tight drop-shadow-[0_0_12px_rgba(255,179,71,0.35)]"
              style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
            >
              {formatBRL(product.price_cents)}
            </p>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/45">
                Descrição
              </p>
              <p className="mt-2 text-[13px] sm:text-sm leading-relaxed text-white/80 whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-6 sm:sticky sm:bottom-4">
            <button
              type="button"
              onClick={sendToWhatsApp}
              disabled={isLocked}
              aria-label={`Solicitar disponibilidade de ${product.title} no WhatsApp`}
              className={cn(
                "w-full inline-flex items-center justify-center gap-2.5",
                "rounded-xl px-5 py-4 text-[12px] sm:text-[13px] font-extrabold uppercase tracking-[0.22em]",
                "border-2 transition-all duration-300",
                isLocked
                  ? "bg-white/5 text-white/30 border-white/10 cursor-not-allowed"
                  : "bg-[linear-gradient(180deg,#0a0a0a,#000)] text-white border-[#00FFFF]/80 shadow-[0_0_24px_-2px_rgba(0,229,255,0.55),inset_0_0_14px_rgba(0,229,255,0.10)] hover:shadow-[0_0_36px_-2px_rgba(0,229,255,0.85),inset_0_0_18px_rgba(0,229,255,0.20)] hover:border-[#00FFFF] active:scale-[0.99]",
              )}
              style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
            >
              <MessageCircle className="h-5 w-5 text-[#25D366]" strokeWidth={2.5} />
              Solicitar disponibilidade
            </button>
            <p className="mt-2 text-center text-[10px] uppercase tracking-[0.22em] text-white/35">
              <Award className="inline h-3 w-3 text-[#00FFFF] mr-1" />
              Atendimento direto via WhatsApp
            </p>
          </div>
        </div>
      </div>

      <ProductLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        media={lightboxMedia}
        startIndex={index}
        title={product.title}
      />
    </article>
  );
};

export default GarageProShowcase;
