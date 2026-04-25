import { useRef, useState, MouseEvent } from "react";

interface XRayMagnifierProps {
  src: string;
  alt: string;
  className?: string;
  /** Magnifier diameter in px */
  size?: number;
  /** Zoom factor */
  zoom?: number;
}

/**
 * X-Ray view: replaces cursor with a precision crosshair magnifier.
 * On hover, shows a circular zoomed area with neon-yellow border and
 * a technical telemetry overlay.
 */
const XRayMagnifier = ({
  src,
  alt,
  className,
  size = 180,
  zoom = 2.4,
}: XRayMagnifierProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0, bx: 0, by: 0, w: 1, h: 1 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPos({
      x,
      y,
      bx: -(x * zoom - size / 2),
      by: -(y * zoom - size / 2),
      w: rect.width * zoom,
      h: rect.height * zoom,
    });
  };

  return (
    <div
      ref={ref}
      className={`di-xray relative overflow-hidden ${className ?? ""}`}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onMouseMove={onMove}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />

      {/* Telemetry overlay (always visible, subtle) */}
      <div className="pointer-events-none absolute top-2 left-2 right-2 flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-widest text-[color:var(--di-neon)]/80">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--di-neon)] di-blink" />
          SISTEMA: G64_SCAN_PRO
        </span>
        <span>STATUS: AUTHENTIC_ITEM</span>
      </div>

      {/* Magnifier */}
      {active && (
        <>
          <div
            className="pointer-events-none absolute rounded-full"
            style={{
              left: pos.x - size / 2,
              top: pos.y - size / 2,
              width: size,
              height: size,
              backgroundImage: `url(${src})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: `${pos.w}px ${pos.h}px`,
              backgroundPosition: `${pos.bx}px ${pos.by}px`,
              border: "2px solid var(--di-neon)",
              boxShadow:
                "0 0 0 2px rgba(0,0,0,0.85), 0 0 20px rgba(255,215,0,0.55), inset 0 0 18px rgba(255,215,0,0.25)",
            }}
          >
            {/* Crosshair */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[color:var(--di-neon)]/70" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-[color:var(--di-neon)]/70" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full border border-[color:var(--di-neon)]" />
          </div>
          <div
            className="pointer-events-none absolute font-mono-tech text-[10px] uppercase tracking-widest text-[color:var(--di-neon)]"
            style={{
              left: Math.min(pos.x + size / 2 + 8, 9999),
              top: pos.y - size / 2,
            }}
          >
            <div className="bg-black/85 border border-[color:var(--di-neon)]/60 px-2 py-1">
              X:{Math.round(pos.x)} Y:{Math.round(pos.y)}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default XRayMagnifier;