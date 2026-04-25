import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Play,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type LightboxMedia = {
  type: "image" | "video";
  src: string;
  alt?: string;
};

export type SpecSheet = {
  brand?: string | null;
  series?: string | null;
  scale?: string | null;
  color?: string | null;
  condition?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  series?: string | null;
  rarity?: number | null;
  priceLabel: string;
  description: string;
  media: LightboxMedia[];
  initialIndex?: number;
  onBuy?: () => void;
  status?: "disponivel" | "reservado" | "vendido";
  specs?: SpecSheet;
};

const CollectibleLightbox = ({
  open,
  onClose,
  title,
  series,
  rarity,
  priceLabel,
  description,
  media,
  initialIndex = 0,
  onBuy,
  status = "disponivel",
  specs,
}: Props) => {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % media.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + media.length) % media.length);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, media.length, onClose]);

  if (!open) return null;

  const current = media[index];
  const hasMultiple = media.length > 1;

  const specRows: Array<{ label: string; value: string }> = [
    { label: "Marca", value: specs?.brand ?? "Hot Wheels" },
    { label: "Série", value: specs?.series ?? series ?? "—" },
    { label: "Escala", value: specs?.scale ?? "1:64" },
    { label: "Cor", value: specs?.color ?? "—" },
    { label: "Condição", value: specs?.condition ?? "Na cartela" },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 animate-fade-in"
    >
      {/* Overlay (click outside to close) */}
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
      />

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="fixed right-4 top-4 z-[110] inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Content shell */}
      <div
        className={cn(
          "relative z-[105] w-full max-w-6xl max-h-[92vh]",
          "grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]",
          "rounded-2xl overflow-hidden",
          "bg-[hsl(0_0%_5%)]/80 backdrop-blur-2xl border border-white/15",
          "ring-1 ring-white/5",
          "shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]",
          "animate-scale-in",
        )}
      >
        {/* Media side */}
        <div className="relative bg-black flex items-center justify-center min-h-[55vh] lg:min-h-[80vh]">
          {current.type === "image" ? (
            <img
              key={current.src}
              src={current.src}
              alt={current.alt ?? title}
              className="max-h-full max-w-full object-contain animate-fade-in"
            />
          ) : (
            <video
              key={current.src}
              src={current.src}
              controls
              autoPlay
              className="max-h-full max-w-full"
            />
          )}

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={() => setIndex((i) => (i - 1 + media.length) % media.length)}
                aria-label="Anterior"
                className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/55 backdrop-blur-md border border-white/15 text-white hover:bg-black/80 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setIndex((i) => (i + 1) % media.length)}
                aria-label="Próximo"
                className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/55 backdrop-blur-md border border-white/15 text-white hover:bg-black/80 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Thumbnails */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1.5">
                {media.map((m, i) => (
                  <button
                    key={`${m.src}-${i}`}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Ver mídia ${i + 1}`}
                    className={cn(
                      "relative h-10 w-10 rounded-md overflow-hidden border transition-all",
                      i === index
                        ? "border-accent shadow-[0_0_0_2px_rgba(0,229,255,0.3)]"
                        : "border-white/15 hover:border-white/40",
                    )}
                  >
                    {m.type === "image" ? (
                      <img src={m.src} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-black text-white">
                        <Play className="h-4 w-4" fill="currentColor" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info side */}
        <aside className="relative bg-black/60 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-white/10 p-6 sm:p-8 flex flex-col gap-5 overflow-y-auto">
          {series && (
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-accent">
              {series}
            </p>
          )}
          <h2
            className="text-2xl sm:text-3xl font-extrabold leading-tight text-white"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            {title}
          </h2>

          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-md p-4 shadow-inner">
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">
              Valor
            </p>
            <p
              className="text-4xl sm:text-5xl font-extrabold text-[#FFD27A] mt-1 drop-shadow-[0_2px_12px_rgba(255,210,122,0.35)]"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              {priceLabel}
            </p>
            <p className="mt-2 text-[11px] text-white/60 inline-flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5" />
              Frete: A combinar
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-accent/20 bg-accent/5 p-3 text-[12px] text-white/85">
            <ShieldCheck className="h-4 w-4 text-accent mt-0.5 shrink-0" />
            <p>
              <span className="font-semibold text-accent">Pagamento via PIX.</span>{" "}
              Após clicar em garantir, você será atendido pessoalmente para
              combinar PIX, frete e envio.
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/50 mb-2">
              Descrição
            </p>
            <p className="text-sm leading-relaxed text-white/85">{description}</p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/50 mb-2">
              Ficha técnica
            </p>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              {specRows.map((row) => (
                <div
                  key={row.label}
                  className="rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-sm p-3"
                >
                  <dt className="text-[10px] uppercase tracking-wider text-white/50">
                    {row.label}
                  </dt>
                  <dd className="text-white font-semibold mt-0.5 truncate">
                    {row.value}
                  </dd>
                </div>
              ))}
              {typeof rarity === "number" && (
                <div className="rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-sm p-3">
                  <dt className="text-[10px] uppercase tracking-wider text-white/50">
                    Raridade
                  </dt>
                  <dd className="text-accent font-semibold mt-0.5">{rarity}%</dd>
                </div>
              )}
            </dl>
          </div>

          {status !== "disponivel" ? (
            <div
              className={cn(
                "mt-auto w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] border",
                status === "reservado"
                  ? "bg-amber-500/15 text-amber-200 border-amber-400/40"
                  : "bg-red-500/15 text-red-200 border-red-400/40",
              )}
            >
              {status === "reservado" ? "Já está reservada" : "Já foi vendida"}
            </div>
          ) : onBuy ? (
            <button
              type="button"
              onClick={onBuy}
              className={cn(
                "mt-auto w-full inline-flex items-center justify-center gap-2.5",
                "rounded-full px-5 py-3.5 text-[13px] font-extrabold uppercase tracking-[0.2em]",
                "bg-[#25D366] text-black",
                "shadow-[0_14px_40px_-10px_rgba(37,211,102,0.75)]",
                "hover:brightness-110 active:scale-[0.98] transition-all",
              )}
            >
              <MessageCircle className="h-4 w-4" strokeWidth={2.75} />
              Garantir esta peça
            </button>
          ) : null}
        </aside>
      </div>
    </div>
  );
};

export default CollectibleLightbox;