import { useEffect, useMemo, useState } from "react";
import {
  Award,
  Boxes,
  Cog,
  Loader2,
  MapPin,
  MessageCircle,
  Ruler,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateZoomCrops, removeBackgroundFromUrl } from "@/lib/removeBackground";
import galpaoLogo from "@/assets/galpao64-logo.png";

export type GarageProCardData = {
  id: string;
  title: string;
  series?: string | null;
  rarity?: number | null;
  price_cents: number;
  images: string[];
  sale_image_original_url?: string | null;
  sale_image_processed_url?: string | null;
  description?: string;
  alt?: string;
  status?: "disponivel" | "reservado" | "vendido";
  brand?: string;
  scale?: string;
  condition?: string;
  origin?: string;
  shipping?: string;
};

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Props = {
  product: GarageProCardData;
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
}: {
  icon: typeof Cog;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-2">
    <div className="shrink-0 rounded-md border border-white/15 bg-[linear-gradient(180deg,#2a2a2a,#0e0e0e)] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <Icon className="h-3.5 w-3.5 text-[#9ad9ff]" strokeWidth={2} />
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
        {label}
      </p>
      <p className="text-[11px] font-semibold text-white/90 truncate" title={value}>
        {value}
      </p>
    </div>
  </div>
);

const GarageProCard = ({ product, whatsappNumber = "5546999350070" }: Props) => {
  const baseImage = product.sale_image_processed_url || product.images[0];
  const zoomSource = product.sale_image_original_url || baseImage;
  const [stageImage, setStageImage] = useState<string | null>(null);
  const [zooms, setZooms] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const status = product.status ?? "disponivel";
  const isLocked = status === "reservado" || status === "vendido";

  // Process: remove background + generate 3 zoom thumbnails
  useEffect(() => {
    let cancelled = false;
    if (!baseImage) return;

    setProcessing(!product.sale_image_processed_url);
    setStageImage(null);
    setZooms([]);

    // Always generate zoom crops (cheap, no AI)
    generateZoomCrops(zoomSource, 3, 220)
      .then((crops) => {
        if (!cancelled) setZooms(crops);
      })
      .catch(() => {
        if (!cancelled) setZooms([baseImage, baseImage, baseImage]);
      });

    if (product.sale_image_processed_url) {
      setStageImage(product.sale_image_processed_url);
      return () => {
        cancelled = true;
      };
    }

    // Background removal (heavy)
    removeBackgroundFromUrl(baseImage)
      .then((url) => {
        if (!cancelled) {
          setStageImage(url);
          setProcessing(false);
        }
      })
      .catch((err) => {
        console.error("removeBackground failed:", err);
        if (!cancelled) {
          setStageImage(baseImage);
          setProcessing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [baseImage, product.sale_image_processed_url, zoomSource]);

  const sendToWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse na peça ${product.title}` +
        (product.series ? ` (${product.series})` : "") +
        ` — ${formatBRL(product.price_cents)}.` +
        (baseImage ? `\nFoto: ${baseImage}` : "") +
        `\n\nGostaria de confirmar disponibilidade.`,
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  const certItems = useMemo(
    () => [
      { icon: Cog, label: "Especificação", value: product.brand ?? "Hot Wheels" },
      { icon: Boxes, label: "Coleção", value: product.series ?? "—" },
      { icon: Ruler, label: "Escala", value: product.scale ?? "1:64" },
      { icon: ShieldCheck, label: "Condição", value: product.condition ?? "Na cartela" },
      { icon: MapPin, label: "Origem", value: product.origin ?? "Importado" },
      { icon: Truck, label: "Frete", value: product.shipping ?? "A combinar" },
    ],
    [product],
  );

  return (
    <article
      className={cn(
        "garage-pro relative isolate flex flex-col rounded-[14px] overflow-hidden",
        // Brushed metal frame
        "bg-[linear-gradient(135deg,#2a2a2a_0%,#1a1a1a_30%,#0d0d0d_60%,#1a1a1a_100%)]",
        "border border-white/10",
        "shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.08)]",
        // Outer cyan halo on hover
        "transition-all duration-500 hover:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95),0_0_40px_-10px_rgba(0,229,255,0.45),inset_0_1px_0_rgba(255,255,255,0.08)]",
      )}
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg,rgba(255,255,255,0.025) 0 1px,transparent 1px 3px),linear-gradient(135deg,#2a2a2a 0%,#1a1a1a 30%,#0d0d0d 60%,#1a1a1a 100%)",
      }}
    >
      {/* Rivets in 4 corners */}
      <Rivet className="left-2 top-2" />
      <Rivet className="right-2 top-2" />
      <Rivet className="left-2 bottom-2" />
      <Rivet className="right-2 bottom-2" />

      {/* Logo plate (top center) */}
      <div className="relative z-10 flex justify-center pt-3 pb-2">
        <div className="flex items-center gap-2 rounded-md border border-white/15 bg-black/60 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <img src={galpaoLogo} alt="Galpão 64" className="h-5 w-auto" />
          <span
            className="text-[10px] font-extrabold tracking-[0.3em] text-white/85"
            style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
          >
            GALPÃO 64
          </span>
        </div>
      </div>

      {/* Stage + thumbnails row */}
      <div className="relative z-10 px-3 pb-3 grid grid-cols-[1fr_auto] gap-3 items-stretch">
        {/* Stage */}
        <div
          className={cn(
            "relative rounded-lg overflow-hidden border border-white/10",
            "aspect-square",
          )}
          style={{
            backgroundColor: "#1a1a1a",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px),radial-gradient(ellipse at center,rgba(0,229,255,0.06),transparent 70%)",
            backgroundSize: "20px 20px,20px 20px,100% 100%",
          }}
        >
          {/* Model title — top-left in stage */}
          <div className="absolute left-2 top-2 z-10 max-w-[60%] select-none">
            <p
              className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#00FFFF]/80 leading-none drop-shadow-[0_0_6px_rgba(0,229,255,0.5)]"
              style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
            >
              Modelo
            </p>
            <p
              className="mt-0.5 text-[12px] font-extrabold uppercase tracking-[0.06em] text-white leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] truncate"
              style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
              title={product.title}
            >
              {product.title}
            </p>
          </div>

          {/* Floating price tag — top-right */}
          <div
            className="absolute right-2 top-2 z-10 select-none rounded-sm border border-white/20 px-2.5 py-1 shadow-[0_4px_14px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.15)]"
            style={{
              background:
                "linear-gradient(180deg,#3a2a1a 0%,#1a120a 100%)",
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

          {/* Status overlay */}
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

          {/* Studio key light from above */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 40%, transparent 70%)",
            }}
          />

          {/* Realistic projected ground shadow under car */}
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

          {/* Centered product with Studio Lighting filter */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            {stageImage ? (
              <img
                src={stageImage}
                alt={product.alt ?? product.title}
                className="max-h-[78%] max-w-[88%] object-contain"
                style={{
                  // Studio Lighting: brighter highlights, slightly punchier color, subtle rim glow
                  filter:
                    "brightness(1.08) contrast(1.12) saturate(1.18) drop-shadow(0 2px 0 rgba(255,255,255,0.08)) drop-shadow(0 14px 20px rgba(0,0,0,0.85))",
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

          {/* Processing dim */}
          {processing && stageImage && (
            <div className="absolute right-2 bottom-2 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-[#00FFFF]/90">
              <Loader2 className="h-3 w-3 animate-spin" />
              IA
            </div>
          )}
        </div>

        {/* Right thumbnail column */}
        <div className="flex flex-col justify-center gap-3">
          {[0, 1, 2].map((i) => {
            const src = zooms[i] ?? baseImage;
            return (
              <div
                key={i}
                className={cn(
                  "relative h-14 w-14 rounded-full overflow-hidden",
                  "border-2 border-[#00FFFF]/70",
                  "shadow-[0_0_12px_rgba(0,229,255,0.55),inset_0_0_8px_rgba(0,229,255,0.25)]",
                  "bg-black",
                )}
              >
                <img
                  src={src}
                  alt={`Zoom ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Certification panel */}
      <div className="relative z-10 mx-3 mb-3 rounded-md border border-white/10 bg-[linear-gradient(180deg,#161616,#0a0a0a)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
          <span className="inline-flex items-center gap-1.5">
            <Award className="h-3 w-3 text-[#00FFFF]" />
            <span
              className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-white/85"
              style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
            >
              Certificado de Exposição — Garage Pro
            </span>
          </span>
          <span className="text-[8px] uppercase tracking-[0.2em] text-white/30">
            #{product.id.slice(0, 6).toUpperCase()}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 px-3 py-2.5">
          {certItems.map((c) => (
            <CertItem key={c.label} icon={c.icon} label={c.label} value={c.value} />
          ))}
        </div>
      </div>

      {/* WhatsApp CTA */}
      <div className="relative z-10 px-3 pb-3">
        <button
          type="button"
          onClick={sendToWhatsApp}
          disabled={isLocked}
          aria-label={`Solicitar disponibilidade de ${product.title} no WhatsApp`}
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
          Solicitar disponibilidade no WhatsApp
        </button>
      </div>
    </article>
  );
};

export default GarageProCard;