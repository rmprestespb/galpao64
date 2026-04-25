import { useState } from "react";
import { Play, X, ShoppingBag, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import CollectibleLightbox, { type LightboxMedia } from "./CollectibleLightbox";

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
  whatsappNumber?: string;
};

const CollectibleCard = ({
  product,
  onAction,
  actionLabel = "Comprar",
  whatsappNumber = "5546999350070",
}: Props) => {
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [videoOpen, setVideoOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const hasGallery = product.images.length > 1;

  const handleBuyClick = () => {
    onAction?.(product);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse em comprar:\n\n` +
        `• ${product.title}\n` +
        (product.series ? `• Série: ${product.series}\n` : "") +
        `• Valor: ${formatBRL(product.price_cents)}\n\n` +
        `Pode me passar as próximas etapas?`,
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
    toast.success("Pedido iniciado", {
      description: `Continue a conversa no WhatsApp para finalizar.`,
    });
    setConfirmOpen(false);
  };

  const description =
    product.description ??
    `${product.title}${product.series ? ` — Série ${product.series}` : ""}. Peça curada pelo Galpão 64 em escala 1:64, com acabamento premium e tampografia detalhada.`;

  const lightboxMedia: LightboxMedia[] = [
    ...product.images.map((src) => ({ type: "image" as const, src, alt: product.alt ?? product.title })),
    ...(product.videoUrl ? [{ type: "video" as const, src: product.videoUrl }] : []),
  ];

  const openLightbox = (mediaSrc?: string) => {
    const i = mediaSrc ? lightboxMedia.findIndex((m) => m.src === mediaSrc) : 0;
    setLightboxIndex(i >= 0 ? i : 0);
    setLightboxOpen(true);
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
            onClick={() => openLightbox(activeImage)}
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
              )}
            />
          </button>

          {/* Subtle vignette */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
          />

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
                      openLightbox(product.videoUrl);
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
          </div>
          <button
            type="button"
            onClick={handleBuyClick}
            aria-label={`Comprar ${product.title}`}
            className={cn(
              "w-full inline-flex items-center justify-center gap-2",
              "rounded-full px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.2em]",
              "bg-primary text-primary-foreground",
              "border border-primary/60",
              "shadow-[0_8px_24px_-8px_rgba(255,140,0,0.55)]",
              "hover:brightness-110 hover:shadow-[0_10px_30px_-6px_rgba(255,140,0,0.75)]",
              "active:scale-[0.98] transition-all",
            )}
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={2.5} />
            {actionLabel}
          </button>
        </div>
      </article>

      {/* Confirmação de compra */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-md border-border/60">
          <DialogHeader>
            <p className="text-[11px] font-bold tracking-[0.25em] text-accent uppercase">
              Confirmar Compra
            </p>
            <DialogTitle className="text-xl font-extrabold leading-tight">
              {product.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {product.series ? `${product.series} · ` : ""}
              Você será encaminhado ao WhatsApp do Galpão 64 para finalizar a reserva.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-4 rounded-lg border border-border/60 bg-black/40 p-3">
            <img
              src={activeImage}
              alt=""
              className="h-16 w-16 rounded-md object-cover border border-white/10"
            />
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Total
              </p>
              <p className="text-2xl font-extrabold text-[#FFD27A]">
                {formatBRL(product.price_cents)}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="rounded-md px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-green-500 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Confirmar no WhatsApp
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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