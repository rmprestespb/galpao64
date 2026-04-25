import { useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  Boxes,
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
import { generateZoomCrops } from "@/lib/removeBackground";
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

type View = "loose" | "blister" | "video";

const Rivet = ({ className }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={cn(
      "absolute h-2.5 w-2.5 rounded-full",
      "bg-[radial-gradient(circle_at_30%_30%,#e8e8e8_0%,#7a7a7a_45%,#1a1a1a_100%)]",
      "shadow-[inset_0_0_2px_rgba(0,0,0,0.8),0_1px_2px_rgba(0,0,0,0.6)]",
    )}
    style={undefined}
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

const GarageProShowcase = ({
  product,
  whatsappNumber = "5546999350070",
}: Props) => {
  const status = product.status ?? "disponivel";
  const isLocked = status === "reservado" || status === "vendido";
  const hasBlister = Boolean(product.blisterImage);
  const hasVideo = Boolean(product.videoUrl);

  const [view, setView] = useState<View>("loose");
  const [zooms, setZooms] = useState<string[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStart, setLightboxStart] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Thumbnails de zoom — sempre da Visão 1 (loose), sem IA
  useEffect(() => {
    let cancelled = false;
    if (!product.looseImage) return;
    generateZoomCrops(product.looseImage, 3, 220)
      .then((crops) => !cancelled && setZooms(crops))
      .catch(() => {
        if (!cancelled)
          setZooms([product.looseImage, product.looseImage, product.looseImage]);
      });
    return () => {
      cancelled = true;
    };
  }, [product.looseImage]);

  // Quando muda para vídeo, garante autoplay (loop+muted via attrs)
  useEffect(() => {
    if (view === "video" && videoRef.current) {
      videoRef.current.play().catch(() => undefined);
    }
  }, [view]);

  const goLoose = () => setView("loose");
  const goBlister = () => hasBlister && setView("blister");
  const goVideo = () => hasVideo && setView("video");

  // Mídias ordenadas para o lightbox (zoom em tela grande)
  const lightboxMedia = useMemo<LightboxMedia[]>(() => {
    const items: LightboxMedia[] = [];
    if (product.looseImage) items.push({ kind: "image", url: product.looseImage });
    if (product.blisterImage) items.push({ kind: "image", url: product.blisterImage });
    if (product.videoUrl) items.push({ kind: "video", url: product.videoUrl });
    return items;
  }, [product.looseImage, product.blisterImage, product.videoUrl]);

  const openLightboxAt = (url: string) => {
    const idx = lightboxMedia.findIndex((m) => m.url === url);
    setLightboxStart(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  };

  const openCurrentInLightbox = () => {
    if (view === "blister" && product.blisterImage) {
      openLightboxAt(product.blisterImage);
    } else if (view === "video" && product.videoUrl) {
      openLightboxAt(product.videoUrl);
    } else if (product.looseImage) {
      openLightboxAt(product.looseImage);
    }
  };

  const sendToWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse em saber a disponibilidade do modelo "${product.title}"` +
        (product.series ? ` (${product.series})` : "") +
        ` — ${formatBRL(product.price_cents)}.`,
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
        "garage-pro-showcase relative isolate flex flex-col rounded-[14px] overflow-hidden",
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
            GARAGE PRO
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
              {view === "blister"
                ? "Cartela / Blister"
                : view === "video"
                  ? "Giro 360º"
                  : "Modelo Loose"}
            </p>
            <p
              className="mt-0.5 text-[12px] font-extrabold uppercase tracking-[0.06em] text-white leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] truncate"
              style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
              title={product.title}
            >
              {product.title}
            </p>
          </div>

          {/* Etiqueta metálica de preço */}
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

          {/* Plataforma + iluminação dramática */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.05) 40%, transparent 70%)",
            }}
          />
          {/* Plataforma circular sob o carro */}
          {view === "loose" && (
            <div
              aria-hidden="true"
              className="absolute left-1/2 -translate-x-1/2 bottom-[10%] h-3 w-[70%] rounded-[50%]"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 40%, transparent 75%)",
              }}
            />
          )}
          {/* Sombra projetada da peça loose */}
          {view === "loose" && (
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

          {/* Conteúdo do palco */}
          <button
            type="button"
            onClick={openCurrentInLightbox}
            aria-label={`Ampliar foto de ${product.title}`}
            className="absolute inset-0 flex items-center justify-center p-4 cursor-zoom-in focus:outline-none"
          >
            {view === "video" && product.videoUrl ? (
              <video
                ref={videoRef}
                key={product.videoUrl}
                src={product.videoUrl}
                className="max-h-[92%] max-w-[94%] object-contain rounded-md"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : view === "blister" && product.blisterImage ? (
              <img
                key="blister"
                src={product.blisterImage}
                alt={`${product.title} na cartela original`}
                className="max-h-[94%] max-w-[96%] object-contain animate-fade-in"
                style={{
                  filter:
                    "brightness(1.04) contrast(1.06) drop-shadow(0 14px 18px rgba(0,0,0,0.8))",
                }}
              />
            ) : (
              <div
                key="loose"
                className="relative flex h-[88%] w-[92%] items-center justify-center animate-fade-in"
              >
                {/* Foto principal */}
                <img
                  src={product.looseImage}
                  alt={product.alt ?? `${product.title} loose`}
                  className="relative z-[2] max-h-[72%] max-w-full object-contain"
                  style={{
                    filter:
                      "brightness(1.08) contrast(1.14) saturate(1.18) drop-shadow(0 2px 0 rgba(255,255,255,0.08)) drop-shadow(0 18px 22px rgba(0,0,0,0.85))",
                  }}
                />
                {/* Reflexo espelhado (efeito vidro/piso polido) */}
                <img
                  aria-hidden="true"
                  src={product.looseImage}
                  alt=""
                  className="absolute left-1/2 -translate-x-1/2 max-w-full object-contain pointer-events-none select-none"
                  style={{
                    top: "calc(50% + 2px)",
                    maxHeight: "36%",
                    transform: "translate(-50%, 0) scaleY(-1)",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0) 80%)",
                    maskImage:
                      "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0) 80%)",
                    filter: "blur(0.5px) brightness(0.85) saturate(1.1)",
                    opacity: 0.55,
                  }}
                />
                {/* Linha de horizonte / piso espelhado */}
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{
                    top: "calc(50% + 1px)",
                    width: "78%",
                    height: "1px",
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(0,229,255,0.55) 50%, transparent 100%)",
                    boxShadow: "0 0 10px rgba(0,229,255,0.35)",
                  }}
                />
              </div>
            )}
          </button>
        </div>

        {/* Right zoom thumbs — sempre da Visão 1 (loose) */}
        <div className="flex flex-col justify-center gap-3">
          {[0, 1, 2].map((i) => {
            const src = zooms[i] ?? product.looseImage;
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  goLoose();
                  if (product.looseImage) openLightboxAt(product.looseImage);
                }}
                aria-label={`Zoom detalhe ${i + 1} (carro loose)`}
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

      {/* Galeria multimídia — seletor inferior do palco */}
      <div className="relative z-10 mt-3 px-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (view === "loose" && product.looseImage) {
                openLightboxAt(product.looseImage);
              } else {
                goLoose();
              }
            }}
            aria-pressed={view === "loose"}
            className={cn(
              "relative h-14 w-14 shrink-0 rounded-md overflow-hidden border-2 transition-all",
              view === "loose"
                ? "border-[#00FFFF] shadow-[0_0_14px_rgba(0,229,255,0.7)]"
                : "border-white/15 hover:border-white/40",
            )}
            title="Visão 1 — Carro loose"
          >
            <img
              src={product.looseImage}
              alt="Visão loose"
              className="h-full w-full object-cover bg-black"
            />
            <span className="absolute inset-x-0 bottom-0 bg-black/70 text-[8px] font-bold uppercase tracking-wider text-white text-center py-0.5">
              Loose
            </span>
          </button>

          {hasBlister && (
            <button
              type="button"
              onClick={() => {
                if (view === "blister" && product.blisterImage) {
                  openLightboxAt(product.blisterImage);
                } else {
                  goBlister();
                }
              }}
              aria-pressed={view === "blister"}
              className={cn(
                "relative h-14 w-14 shrink-0 rounded-md overflow-hidden border-2 transition-all",
                view === "blister"
                  ? "border-[#FFB347] shadow-[0_0_14px_rgba(255,179,71,0.7)]"
                  : "border-white/15 hover:border-white/40",
              )}
              title="Visão 2 — Foto na cartela"
            >
              <img
                src={product.blisterImage!}
                alt="Visão na cartela"
                className="h-full w-full object-cover bg-black"
              />
              <span className="absolute inset-x-0 bottom-0 bg-black/70 text-[8px] font-bold uppercase tracking-wider text-[#FFD27A] text-center py-0.5">
                Blister
              </span>
            </button>
          )}

          {hasVideo && (
            <button
              type="button"
              onClick={() => {
                if (view === "video" && product.videoUrl) {
                  openLightboxAt(product.videoUrl);
                } else {
                  goVideo();
                }
              }}
              aria-pressed={view === "video"}
              className={cn(
                "relative h-14 w-14 shrink-0 rounded-md overflow-hidden border-2 transition-all bg-black",
                view === "video"
                  ? "border-[#00FFFF] shadow-[0_0_14px_rgba(0,229,255,0.7)]"
                  : "border-white/15 hover:border-white/40",
              )}
              title="Visão 3 — Vídeo 360º"
            >
              {/* Poster: usa frame do vídeo via tag <video> */}
              <video
                src={product.videoUrl!}
                className="h-full w-full object-cover"
                muted
                playsInline
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/45">
                <Play className="h-5 w-5 text-[#00FFFF]" fill="currentColor" />
              </span>
              <span className="absolute inset-x-0 bottom-0 bg-black/70 text-[8px] font-bold uppercase tracking-wider text-[#00FFFF] text-center py-0.5">
                360º
              </span>
            </button>
          )}

          <p className="ml-2 text-[10px] uppercase tracking-[0.2em] text-white/55 leading-tight">
            {view === "video"
              ? "Giro 360º em loop"
              : view === "blister"
                ? "Foto real do blister"
                : "Foto de estúdio — loose"}
          </p>
        </div>
      </div>

      {/* Painel técnico inferior */}
      <div className="relative z-10 mx-3 mt-3 mb-3 rounded-md border border-white/10 bg-[linear-gradient(180deg,#161616,#0a0a0a)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
          <span className="inline-flex items-center gap-1.5">
            <Award className="h-3 w-3 text-[#00FFFF]" />
            <span
              className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-white/85"
              style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
            >
              Painel Técnico — Garage Pro
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
        {product.description && (
          <p className="border-t border-white/10 px-3 py-2 text-[11px] text-white/70 leading-snug whitespace-pre-line">
            {product.description}
          </p>
        )}
      </div>

      {/* WhatsApp CTA */}
      <div className="relative z-10 px-3 pb-3">
        <button
          type="button"
          onClick={sendToWhatsApp}
          disabled={isLocked}
          aria-label={`Solicitar disponibilidade de ${product.title} no WhatsApp`}
          className={cn(
            "w-full inline-flex items-center justify-center gap-2",
            "rounded-md px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.2em]",
            "border-2 transition-all duration-300",
            isLocked
              ? "bg-white/5 text-white/30 border-white/10 cursor-not-allowed"
              : "bg-black text-white border-[#00FFFF]/80 shadow-[0_0_18px_-2px_rgba(0,229,255,0.55),inset_0_0_10px_rgba(0,229,255,0.08)] hover:shadow-[0_0_28px_-2px_rgba(0,229,255,0.85),inset_0_0_14px_rgba(0,229,255,0.18)] hover:border-[#00FFFF] active:scale-[0.99]",
          )}
          style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
        >
          <MessageCircle className="h-4 w-4 text-[#25D366]" strokeWidth={2.5} />
          Solicitar disponibilidade
        </button>
      </div>

      <ProductLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        media={lightboxMedia}
        startIndex={lightboxStart}
        title={product.title}
      />
    </article>
  );
};

export default GarageProShowcase;