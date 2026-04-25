import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, MessageCircle, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import ProductLightbox from "@/components/ProductLightbox";

export type ProductGarageData = {
  id: string;
  title: string;
  series?: string | null;
  description?: string | null;
  price_cents: number;
  images: string[];
  video_url?: string | null;
  status?: "disponivel" | "reservado" | "vendido";
  alt?: string;
};

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Props = {
  product: ProductGarageData;
  whatsappNumber?: string;
};

type MediaItem =
  | { kind: "video"; url: string }
  | { kind: "image"; url: string };

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

const ProductGarageCard = ({
  product,
  whatsappNumber = "5546999350070",
}: Props) => {
  const media: MediaItem[] = [
    ...(product.video_url ? [{ kind: "video" as const, url: product.video_url }] : []),
    ...product.images.map((url) => ({ kind: "image" as const, url })),
  ];

  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const status = product.status ?? "disponivel";
  const isLocked = status === "reservado" || status === "vendido";
  const current = media[index];

  useEffect(() => {
    if (current?.kind === "video" && videoRef.current) {
      videoRef.current.play().catch(() => undefined);
    }
  }, [current?.kind, current?.url]);

  const next = () => media.length > 1 && setIndex((i) => (i + 1) % media.length);
  const prev = () =>
    media.length > 1 && setIndex((i) => (i - 1 + media.length) % media.length);

  const sendToWhatsApp = () => {
    const link = current?.url ?? "";
    const message = encodeURIComponent(
      `Olá! Tenho interesse no ${product.title}` +
        (product.series ? `, da série ${product.series}` : "") +
        `, no valor de ${formatBRL(product.price_cents)}.` +
        (link ? ` ${link}` : ""),
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <>
      <article
        className={cn(
          "relative isolate flex flex-col rounded-[14px] overflow-hidden",
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

        {/* Header — Nome + Preço em destaque */}
        <header className="relative z-10 px-4 pt-4 pb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#00FFFF]/80 leading-none drop-shadow-[0_0_6px_rgba(0,229,255,0.5)]"
              style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
            >
              Galpão 64
            </p>
            <h3
              className="mt-1 text-base sm:text-lg font-extrabold uppercase tracking-tight text-white leading-tight truncate"
              style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
              title={product.title}
            >
              {product.title}
            </h3>
          </div>
          <div
            className="shrink-0 rounded-md border border-white/20 px-2.5 py-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.15)]"
            style={{ background: "linear-gradient(180deg,#3a2a1a 0%,#1a120a 100%)" }}
          >
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#FFB347]/80 leading-none">
              Valor
            </p>
            <p className="text-[15px] sm:text-base font-extrabold text-[#FFD27A] leading-tight drop-shadow-[0_0_8px_rgba(255,179,71,0.5)]">
              {formatBRL(product.price_cents)}
            </p>
          </div>
        </header>

        {/* Carrossel principal */}
        <div className="relative z-10 px-3">
          <div
            className="relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-[#1a1a1a] group"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)",
              backgroundSize: "20px 20px,20px 20px",
            }}
          >
            {isLocked && (
              <div className="absolute right-2 top-2 z-20">
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

            {!current ? (
              <div className="absolute inset-0 flex items-center justify-center text-white/40 text-xs uppercase tracking-[0.25em]">
                Sem mídia
              </div>
            ) : current.kind === "video" ? (
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="absolute inset-0 w-full h-full"
                aria-label="Abrir vídeo em tela cheia"
              >
                <video
                  ref={videoRef}
                  src={current.url}
                  className="h-full w-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#00FFFF]">
                  <Play className="h-3 w-3" /> Vídeo
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="absolute inset-0 w-full h-full"
                aria-label="Abrir foto em tela cheia"
              >
                <img
                  src={current.url}
                  alt={product.alt ?? product.title}
                  className="h-full w-full object-cover"
                />
              </button>
            )}

            {/* Maximize hint */}
            <span className="pointer-events-none absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="h-3 w-3" /> HD
            </span>

            {media.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/60 border border-white/20 text-white hover:bg-black/80 hover:border-[#00FFFF]/60 transition-colors flex items-center justify-center"
                  aria-label="Mídia anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/60 border border-white/20 text-white hover:bg-black/80 hover:border-[#00FFFF]/60 transition-colors flex items-center justify-center"
                  aria-label="Próxima mídia"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <div className="absolute left-1/2 -translate-x-1/2 bottom-2 z-10 flex items-center gap-1.5">
                  {media.map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        i === index ? "w-5 bg-[#00FFFF]" : "w-1.5 bg-white/40",
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {media.length > 1 && (
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {media.map((m, i) => (
                <button
                  key={`${m.kind}-${m.url}-${i}`}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={cn(
                    "relative h-12 w-12 shrink-0 rounded-md overflow-hidden border-2 transition-all",
                    i === index
                      ? "border-[#00FFFF] shadow-[0_0_10px_rgba(0,229,255,0.6)]"
                      : "border-white/15 hover:border-white/40",
                  )}
                  aria-label={`Selecionar mídia ${i + 1}`}
                >
                  {m.kind === "video" ? (
                    <>
                      <video src={m.url} className="h-full w-full object-cover" muted />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Play className="h-4 w-4 text-[#00FFFF]" fill="currentColor" />
                      </span>
                    </>
                  ) : (
                    <img src={m.url} alt="" className="h-full w-full object-cover bg-black" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Especificações */}
        <section className="relative z-10 mx-3 mt-3 rounded-md border border-white/10 bg-[linear-gradient(180deg,#161616,#0a0a0a)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <h4
            className="border-b border-white/10 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.22em] text-white/85"
            style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
          >
            Especificações
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2 px-3 py-3">
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
                Série / Coleção
              </p>
              <p className="text-[12px] font-semibold text-white/90 leading-snug">
                {product.series || "—"}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
                Descrição
              </p>
              <p className="text-[12px] text-white/80 leading-snug whitespace-pre-line">
                {product.description?.trim() || "—"}
              </p>
            </div>
          </div>
        </section>

        {/* WhatsApp CTA */}
        <div className="relative z-10 px-3 pt-3 pb-3">
          <button
            type="button"
            onClick={sendToWhatsApp}
            disabled={isLocked}
            aria-label={`Reservar ${product.title} via WhatsApp`}
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
            Reservar via WhatsApp
          </button>
        </div>
      </article>

      <ProductLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        media={media}
        startIndex={index}
        title={product.title}
      />
    </>
  );
};

export default ProductGarageCard;