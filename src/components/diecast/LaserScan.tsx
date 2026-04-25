import { CSSProperties } from "react";

interface LaserScanProps {
  src: string;
  alt: string;
  className?: string;
  /** Animation duration in seconds */
  duration?: number;
}

/**
 * Cyber Industrial laser-scan effect:
 * - top half (above the moving line) is grayscale
 * - bottom half (below the line) reveals full color
 * - a glowing yellow line sweeps the image
 */
const LaserScan = ({ src, alt, className, duration = 5.5 }: LaserScanProps) => {
  const style = { animationDuration: `${duration}s` } as CSSProperties;
  return (
    <div className={`di-laser ${className ?? ""}`} style={style}>
      <img src={src} alt={alt} className="di-laser-img di-laser-color" loading="lazy" />
      <img src={src} alt="" aria-hidden className="di-laser-img di-laser-bw" />
      <div className="di-laser-glow" />
      <div className="di-laser-line" />
    </div>
  );
};

export default LaserScan;