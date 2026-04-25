import { useState } from "react";
import { Play, MessageCircle, ShieldCheck, Truck, Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import CollectibleLightbox, { type LightboxMedia, type SpecSheet } from "./CollectibleLightbox";

export type CollectibleCardData = {
  id: string;
  title: string;
  series?: string | null;
  rarity?: number | null;
  price_cents: number;
  images: string[];
  description?: string;
  videoUrl?: string;
  alt?: string;
  status?: "disponivel" | "reservado" | "vendido";
  brand?: string;
  scale?: string;
  color?: string;
  condition?: string;
};

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Props = {
  product: CollectibleCardData;
  onAction?: (product: CollectibleCardData) => void;
  actionLabel?: string;
  whatsappNumber?: string;
};

const CollectibleCard = ({
  product,
  onAction,
  actionLabel = "Garantir esta peça",
  whatsappNumber = "5546999350070",
}: Props) => {
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const hasGallery = product.images.length > 1;
  const status = product.status ?? "disponivel";
  const isLocked = status === "reservado" || status === "vendido";

  const description =
    product.description ??
    `${product.title}${product.series ? ` — Série ${product.series}` : ""}. Peça curada pelo Galpão 64 em escala 1:64, com acabamento premium e tampografia detalhada.`;

  const lightboxMedia: LightboxMedia[] = [
    ...product.images.map((src) => ({ type: "image" as const, src, alt: product.alt ?? product.title })),
    ...(product.videoUrl ? [{ type: "video" as const, src: product.videoUrl }] : []),
  ];

  const specs: SpecSheet = {
    brand: product.brand ?? "Hot Wheels",
    series: product.series ?? null,
    scale: product.scale ?? "1:64",
    color: product.color ?? null,
    condition: product.condition ?? "Na cartela",
  };

  const openDetail = (mediaSrc?: string) => {
    const i = mediaSrc ? lightboxMedia.findIndex((m) => m.src === mediaSrc) : 0;
    setLightboxIndex(i >= 0 ? i : 0);
    setLightboxOpen(true);
  };

  const handleCardCtaClick = () => {
    if (isLocked) return;
    onAction?.(product);
    openDetail(activeImage);
  };

  const sendToWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Vi a miniatura ${product.title}` +
        (product.series ? ` (${product.series})` : "") +
        ` no site e quero garantir ela.` +
        ` Valor: ${formatBRL(product.price_cents)}.\n\n` +
        `Como prosseguimos com o PIX?`,
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
    toast.success("Peça garantida", {
      description: `Continue a conversa no WhatsApp para combinar o PIX e o frete.`,
    });
    setLightboxOpen(false);
  };

  return (
    <>
      <article
        className={cn(
          "group relative isolate flex flex-col rounded-2xl overflow-hidden",
          "bg-[hsl(0_0%_6%)] text-foreground",
          "border border-white/[0.06]",
          "shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]",
          // metallic shine on edges
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:p-px",
          "before:[background:linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0)_30%,rgba(255,255,255,0)_70%,rgba(255,255,255,0.12))]",
          "before:[mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] before:[mask-composite:exclude] before:[-webkit-mask-composite:xor]",
          "transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_60px_-10px_rgba(0,229,255,0.25)]",
        )}
      >
        {/* Image stage */}
        <div className="relative aspect-square overflow-hidden bg-black">
          <button
            type="button"
            onClick={() => openDetail(activeImage)}
            aria-label={`Ampliar foto de ${product.title}`}
            className="absolute inset-0 z-0 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <img
              src={activeImage}
              alt={product.alt ?? product.title}
              width={768}
              height={768}
              loading="lazy"
              className={cn(
                "h-full w-full object-cover transition-all duration-[400ms] ease-out",
                "group-hover:scale-110 group-focus-within:scale-110",
                "group-hover:blur-[2px] group-focus-within:blur-[2px]",
                isLocked && "grayscale-[60%] opacity-80",
              )}
            />
          </button>

          {/* Subtle vignette */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
          />

          {/* Status badge */}
          {isLocked && (
            <div className="absolute left-3 top-3 z-10">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-md border",
                  status === "reservado"
                    ? "bg-amber-500/20 text-amber-200 border-amber-400/40"
                    : "bg-red-500/20 text-red-200 border-red-400/40",
                )}
              >
                <Lock className="h-3 w-3" />
                {status === "reservado" ? "Reservado" : "Vendido"}
              </span>
            </div>
          )}

          {/* Discreet price (initial state) */}
          <div
            className={cn(
              "pointer-events-none absolute right-3 top-3 rounded-full px-3 py-1",
              "bg-black/55 backdrop-blur-md border border-white/10",
              "text-[13px] font-extrabold tracking-tight",
              "text-[#FFD27A]",
              "transition-opacity duration-300 group-hover:opacity-0 group-focus-within:opacity-0",
            )}
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            {formatBRL(product.price_cents)}
          </div>

          {/* Glassmorphism reveal layer */}
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto",
              "translate-y-4 opacity-0",
              "group-hover:translate-y-0 group-hover:opacity-100",
              "group-focus-within:translate-y-0 group-focus-within:opacity-100",
              "transition-all duration-300 ease-out",
            )}
          >
            <div
              className={cn(
                "rounded-xl border border-white/15",
                "bg-white/[0.06] backdrop-blur-xl",
                "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)]",
                "p-3 sm:p-4 space-y-3",
              )}
            >
              <p
                className="text-[12px] leading-snug text-white/85 line-clamp-3"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                {description}
              </p>

              <div className="flex items-center gap-2 text-[10px] text-white/70">
                <ShieldCheck className="h-3 w-3 text-accent" />
                <span>Pagamento via PIX · atendimento pessoal pelo WhatsApp</span>
              </div>

              <div className="flex items-center gap-2">
                {hasGallery && (
                  <div className="flex items-center gap-1.5 flex-1 overflow-x-auto">
                    {product.images.slice(0, 4).map((src) => (
                      <button
                        key={src}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImage(src);
                        }}
                        aria-label="Ver outra foto"
                        className={cn(
                          "h-10 w-10 shrink-0 rounded-md overflow-hidden border transition-all",
                          src === activeImage
                            ? "border-accent shadow-[0_0_0_2px_rgba(0,229,255,0.25)]"
                            : "border-white/15 hover:border-white/40",
                        )}
                      >
                        <img src={src} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {product.videoUrl && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetail(product.videoUrl);
                    }}
                    aria-label="Assistir vídeo de demonstração"
                    className={cn(
                      "relative z-10 ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full",
                      "bg-accent/90 text-accent-foreground hover:bg-accent transition-colors",
                      "shadow-[0_6px_20px_-4px_rgba(0,229,255,0.6)]",
                    )}
                  >
                    <Play className="h-4 w-4" fill="currentColor" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 px-4 py-3 bg-[hsl(0_0%_4%)]">
          <div className="min-w-0">
            <h3
              className="truncate text-sm font-semibold tracking-tight text-white"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              title={product.title}
            >
              {product.title}
            </h3>
            {product.series && (
              <p className="truncate text-[11px] text-white/45 tracking-wide mt-0.5">
                {product.series}
              </p>
            )}
            <p className="mt-1 text-[10px] text-white/50 inline-flex items-center gap-1">
              <Truck className="h-3 w-3" />
              Frete: A combinar
            </p>
          </div>
          <button
            type="button"
            onClick={handleCardCtaClick}
            aria-label={isLocked ? `${product.title} indisponível` : `Ver detalhes e garantir ${product.title}`}
            disabled={isLocked}
            className={cn(
              "w-full inline-flex items-center justify-center gap-2",
              "rounded-full px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.2em]",
              isLocked
                ? "bg-white/5 text-white/40 border border-white/10 cursor-not-allowed"
                : "bg-[#25D366] text-black border border-[#25D366]/60 shadow-[0_8px_24px_-8px_rgba(37,211,102,0.6)] hover:brightness-110 hover:shadow-[0_10px_30px_-6px_rgba(37,211,102,0.8)] active:scale-[0.98] transition-all",
            )}
          >
            {isLocked ? (
              <>
                <Lock className="h-4 w-4" strokeWidth={2.5} />
                {status === "reservado" ? "Reservado" : "Vendido"}
              </>
            ) : (
              <>
                <MessageCircle className="h-4 w-4" strokeWidth={2.5} />
                {actionLabel}
              </>
            )}
          </button>
        </div>
      </article>

      <CollectibleLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={product.title}
        series={product.series}
        rarity={product.rarity}
        priceLabel={formatBRL(product.price_cents)}
        description={description}
        media={lightboxMedia}
        initialIndex={lightboxIndex}
        status={status}
        specs={specs}
        onBuy={isLocked ? undefined : sendToWhatsApp}
      />
    </>
  );
};

export default CollectibleCard;