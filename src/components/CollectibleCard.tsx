import { useState } from "react";
import { Play, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
};

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Props = {
  product: CollectibleCardData;
  onAction?: (product: CollectibleCardData) => void;
  actionLabel?: string;
};

const CollectibleCard = ({ product, onAction, actionLabel = "Reservar" }: Props) => {
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [videoOpen, setVideoOpen] = useState(false);
  const hasGallery = product.images.length > 1;

  const description =
    product.description ??
    `${product.title}${product.series ? ` — Série ${product.series}` : ""}. Peça curada pelo Galpão 64 em escala 1:64, com acabamento premium e tampografia detalhada.`;

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
            )}
          />

          {/* Subtle vignette */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
          />

          {/* Discreet price (initial state) */}
          <div
            className={cn(
              "absolute right-3 top-3 rounded-full px-3 py-1",
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
              "absolute inset-x-0 bottom-0 p-4 sm:p-5",
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
                      setVideoOpen(true);
                    }}
                    aria-label="Assistir vídeo de demonstração"
                    className={cn(
                      "ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full",
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
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[hsl(0_0%_4%)]">
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
          </div>
          <button
            type="button"
            onClick={() => onAction?.(product)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em]",
              "bg-white/5 border border-white/15 text-white/90",
              "hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all",
            )}
          >
            {actionLabel}
          </button>
        </div>
      </article>

      {product.videoUrl && (
        <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
          <DialogContent className="max-w-3xl bg-black border-white/10 p-0 overflow-hidden">
            <DialogHeader className="sr-only">
              <DialogTitle>{product.title}</DialogTitle>
            </DialogHeader>
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
              aria-label="Fechar vídeo"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="aspect-video w-full bg-black">
              <video
                src={product.videoUrl}
                controls
                autoPlay
                className="h-full w-full"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CollectibleCard;