import { useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  Calendar,
  Layers,
  MessageCircle,
  Play,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
  /** Imagens adicionais (3ª foto, detalhes, etc.) */
  extraImages?: string[];
  /** Visão 3 — vídeo MP4 em loop (giro 360º) */
  videoUrl?: string | null;
  status?: "disponivel" | "reservado" | "vendido";
  alt?: string;
  brand?: string;
  scale?: string;
  origin?: string;
  shipping?: string;
  year?: string | number | null;
  rarity?: number | null;
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

const SpecCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Award;
  label: string;
  value: string;
}) => (
  <div className="glass-card glass-card-hover rounded-xl px-4 py-4 flex items-center gap-3 group">
    <div className="shrink-0 grid place-items-center h-11 w-11 rounded-lg border border-gold/30 bg-[linear-gradient(180deg,rgba(212,175,122,0.12),rgba(0,0,0,0.4))]">
      <Icon className="h-5 w-5 text-gold group-hover:text-gold-soft transition-colors" strokeWidth={1.75} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45 leading-none">
        {label}
      </p>
      <p className="mt-1.5 text-sm font-bold text-white truncate" title={value}>
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

  const slides = useMemo<MediaSlide[]>(() => {
    const arr: MediaSlide[] = [];
    if (product.looseImage)
      arr.push({ kind: "image", url: product.looseImage, label: "Frente" });
    if (product.blisterImage)
      arr.push({ kind: "image", url: product.blisterImage, label: "Detalhe" });
    (product.extraImages ?? []).forEach((url, i) => {
      if (url) arr.push({ kind: "image", url, label: `Ângulo ${i + 1}` });
    });
    if (product.videoUrl)
      arr.push({ kind: "video", url: product.videoUrl, label: "Cinemático" });
    return arr;
  }, [product.looseImage, product.blisterImage, product.extraImages, product.videoUrl]);

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
      { icon: Award, label: "Marca", value: product.brand ?? "Hot Wheels" },
      { icon: Layers, label: "Série", value: product.series ?? "Coleção" },
      { icon: Calendar, label: "Ano", value: product.year ? String(product.year) : "—" },
      {
        icon: Sparkles,
        label: "Raridade",
        value: product.rarity != null ? `${product.rarity}%` : "Premium",
      },
    ],
    [product],
  );

  const statusBadge = isLocked ? (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] backdrop-blur border",
        status === "reservado"
          ? "bg-amber-500/20 text-amber-200 border-amber-400/40"
          : "bg-red-500/20 text-red-200 border-red-400/40",
      )}
    >
      {status === "reservado" ? "Reservado" : "Vendido"}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] backdrop-blur border border-gold/40 bg-gold/10 text-gold-soft">
      <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
      Disponível
    </span>
  );

  const isVideo = current?.kind === "video";

  return (
    <article className="relative isolate overflow-hidden rounded-3xl bg-black border border-white/5 shadow-[0_60px_140px_-40px_rgba(0,0,0,1)]">
      {/* Subtle gold ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full opacity-25"
        style={{ background: "radial-gradient(circle, hsl(38 55% 65% / 0.35), transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, hsl(38 55% 65% / 0.3), transparent 70%)" }}
      />

      <div className="relative z-10 p-5 sm:p-8 lg:p-10">
        {/* =============== TOP: GALLERY =============== */}
        <div className="grid grid-cols-[80px_minmax(0,1fr)] sm:grid-cols-[100px_minmax(0,1fr)] gap-4 sm:gap-5">
          {/* Vertical thumbs */}
          <div className="flex flex-col gap-3">
            {slides.map((s, i) => (
              <button
                key={`${s.kind}-${s.url}-${i}`}
                type="button"
                onClick={() => setIndex(i)}
                aria-pressed={i === index}
                className={cn(
                  "relative aspect-square w-full overflow-hidden rounded-xl border-2 transition-all duration-300",
                  i === index
                    ? "border-gold shadow-[0_0_18px_-2px_hsl(38_55%_65%/0.6)]"
                    : "border-white/10 hover:border-gold/50 opacity-70 hover:opacity-100",
                )}
                title={s.label}
              >
                {s.kind === "video" ? (
                  <>
                    <video src={s.url} className="h-full w-full object-cover" muted playsInline />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="grid place-items-center h-9 w-9 rounded-full bg-black/70 border border-gold/60">
                        <Play className="h-4 w-4 text-gold" fill="currentColor" />
                      </span>
                    </span>
                  </>
                ) : (
                  <img
                    src={s.url}
                    alt={s.label}
                    className="h-full w-full object-cover bg-black"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Main stage */}
          <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black aspect-[16/10]">
            {/* dramatic radial light */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 35%, rgba(212,175,122,0.18) 0%, rgba(0,0,0,0) 55%), radial-gradient(ellipse at center, #1a1a1a 0%, #000 75%)",
              }}
            />

            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              aria-label={`Ampliar mídia de ${product.title}`}
              className="absolute inset-0 flex items-center justify-center cursor-zoom-in focus:outline-none"
            >
              {isVideo && current ? (
                <video
                  ref={videoRef}
                  key={current.url}
                  src={current.url}
                  className="h-full w-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : current ? (
                <img
                  key={current.url}
                  src={current.url}
                  alt={product.alt ?? product.title}
                  className="max-h-full max-w-full object-contain animate-fade-in"
                  style={{
                    filter:
                      "brightness(1.05) contrast(1.08) saturate(1.1) drop-shadow(0 30px 40px rgba(0,0,0,0.95))",
                  }}
                />
              ) : null}
            </button>

            {/* Status (top-left) + counter (top-right) */}
            <div className="absolute left-4 top-4 z-10">{statusBadge}</div>
            {slides.length > 1 && (
              <div className="absolute right-4 top-4 z-10 rounded-full bg-black/70 border border-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-white/85">
                {index + 1} / {slides.length}
              </div>
            )}

            {/* Bottom overlay caption */}
            <div
              className="absolute inset-x-0 bottom-0 z-10 px-5 py-3 text-center"
              style={{
                background:
                  "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 100%)",
              }}
            >
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.4em] text-white/70">
                {isVideo ? "Vídeo em loop (cinematográfico)" : current?.label ?? "Foto de Estúdio"}
              </p>
            </div>
          </div>
        </div>

        {/* =============== TITLE / DESCRIPTION CARD =============== */}
        <div className="mt-5 glass-card glass-card-hover rounded-2xl p-5 sm:p-7">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div className="min-w-0 flex-1">
              {product.series && (
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.4em] text-gold mb-2.5">
                  {product.series}
                </p>
              )}
              <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-black leading-tight text-white tracking-tight">
                {product.title}
              </h2>
              {product.description && (
                <p className="mt-3 text-[13px] sm:text-sm leading-relaxed text-white/65 max-w-xl">
                  {product.description}
                </p>
              )}
            </div>

            {/* Mini badges */}
            <div className="flex gap-2.5 shrink-0">
              {product.rarity != null && (
                <div className="glass-card rounded-lg px-3.5 py-2.5 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/50">Raridade</p>
                  <p className="mt-0.5 text-base font-extrabold text-white">{product.rarity}%</p>
                </div>
              )}
              <div className="glass-card rounded-lg px-3.5 py-2.5 text-center">
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/50">Acabamento</p>
                <p className="mt-0.5 text-base font-extrabold text-gold-soft">PREMIUM</p>
              </div>
            </div>
          </div>
        </div>

        {/* =============== TECHNICAL SPECS =============== */}
        <div className="mt-5">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.4em] text-white/40 mb-3 ml-1">
            Especificações Técnicas
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {specs.map((s) => (
              <SpecCard key={s.label} icon={s.icon} label={s.label} value={s.value} />
            ))}
          </div>
        </div>

        {/* =============== PRICE + CTA =============== */}
        <div className="mt-5 glass-card glass-card-hover rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/45">Valor</p>
            <p className="mt-1 text-3xl sm:text-4xl font-black text-gold-soft leading-none drop-shadow-[0_0_24px_hsl(38_55%_65%/0.45)]">
              {formatBRL(product.price_cents)}
            </p>
          </div>

          <button
            type="button"
            onClick={sendToWhatsApp}
            disabled={isLocked}
            aria-label={`Solicitar disponibilidade de ${product.title} no WhatsApp`}
            className={cn(
              "group relative inline-flex items-center justify-center gap-2.5 rounded-xl px-7 py-4 text-[12px] sm:text-[13px] font-extrabold uppercase tracking-[0.3em] transition-all duration-300",
              isLocked
                ? "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed"
                : "bg-gradient-gold text-black shadow-[0_10px_40px_-10px_hsl(38_55%_65%/0.6)] hover:shadow-[0_18px_60px_-10px_hsl(38_55%_65%/0.85)] hover:scale-[1.02] active:scale-[0.99]",
            )}
          >
            <MessageCircle className="h-5 w-5" strokeWidth={2.5} />
            Solicitar disponibilidade
          </button>
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
