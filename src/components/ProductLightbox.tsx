import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type LightboxMedia =
  | { kind: "video"; url: string }
  | { kind: "image"; url: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media: LightboxMedia[];
  startIndex?: number;
  title?: string;
};

const ProductLightbox = ({
  open,
  onOpenChange,
  media,
  startIndex = 0,
  title,
}: Props) => {
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    if (open) setIndex(startIndex);
  }, [open, startIndex]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % media.length);
      else if (e.key === "ArrowLeft")
        setIndex((i) => (i - 1 + media.length) % media.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, media.length]);

  if (!media.length) return null;
  const current = media[index];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[96vw] sm:max-w-5xl bg-black/95 border-white/10 p-0 overflow-hidden">
        {title && (
          <div className="absolute left-4 top-4 z-20 rounded-md bg-black/70 backdrop-blur px-3 py-1.5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#00FFFF]">
              {title}
            </p>
          </div>
        )}

        <div className="relative w-full h-[80vh] flex items-center justify-center bg-black">
          {current.kind === "video" ? (
            <video
              key={current.url}
              src={current.url}
              className="max-h-full max-w-full object-contain"
              controls
              autoPlay
              loop
              playsInline
            />
          ) : (
            <img
              key={current.url}
              src={current.url}
              alt={title ?? "Mídia em alta definição"}
              className="max-h-full max-w-full object-contain"
            />
          )}

          {media.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setIndex((i) => (i - 1 + media.length) % media.length)
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-black/60 border border-white/20 text-white hover:bg-black/80 hover:border-[#00FFFF]/60 transition-colors flex items-center justify-center"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={() => setIndex((i) => (i + 1) % media.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-black/60 border border-white/20 text-white hover:bg-black/80 hover:border-[#00FFFF]/60 transition-colors flex items-center justify-center"
                aria-label="Próxima"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {media.length > 1 && (
          <div className="flex gap-2 overflow-x-auto p-3 bg-black border-t border-white/10">
            {media.map((m, i) => (
              <button
                key={`${m.kind}-${m.url}-${i}`}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "relative h-16 w-16 shrink-0 rounded-md overflow-hidden border-2 transition-all",
                  i === index
                    ? "border-[#00FFFF] shadow-[0_0_12px_rgba(0,229,255,0.7)]"
                    : "border-white/15 hover:border-white/40",
                )}
                aria-label={`Ir para mídia ${i + 1}`}
              >
                {m.kind === "video" ? (
                  <>
                    <video src={m.url} className="h-full w-full object-cover" muted />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Play className="h-5 w-5 text-[#00FFFF]" fill="currentColor" />
                    </span>
                  </>
                ) : (
                  <img src={m.url} alt="" className="h-full w-full object-cover bg-black" />
                )}
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductLightbox;