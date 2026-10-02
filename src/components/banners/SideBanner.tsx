import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBanners, type BannerPage, type BannerPosition, type BannerRow } from "@/hooks/useBanners";

const AUTO_ROTATE_MS = 7000;

/** Card de um único banner — imagem (quando cadastrada) ou um fundo texturizado
 * escuro com o próprio nome do Galpão 64 como marca d'água, pra nunca ficar
 * em branco enquanto não tem foto de campanha cadastrada. */
const BannerSlide = ({ banner }: { banner: BannerRow }) => {
  const content = (
    <div className="relative flex h-full flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1c1c1f] to-black">
      {/* Fundo: imagem cadastrada ou textura/gradiente de garagem como fallback. */}
      {banner.imagem_url ? (
        <img
          src={banner.imagem_url}
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-[1.04]"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 14px)",
          }}
        />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.92) 100%), radial-gradient(70% 50% at 50% 0%, hsl(var(--primary)/0.16), transparent 70%)",
        }}
      />

      {/* Selo (NOVIDADE / PRÉ-VENDA / OFERTA...) */}
      {banner.selo && (
        <span className="absolute left-3 top-3 z-10 inline-flex items-center rounded-full border border-primary/50 bg-black/70 px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-[0.14em] text-primary shadow-[0_0_14px_-4px_hsl(var(--primary)/0.9)] backdrop-blur-sm">
          {banner.selo}
        </span>
      )}

      {/* Texto + CTA */}
      <div className="relative z-10 flex flex-col gap-2 p-4">
        <h3 className="text-base font-black uppercase leading-[1.1] tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          {banner.titulo}
        </h3>
        {banner.descricao && (
          <p className="line-clamp-3 text-[12px] leading-relaxed text-white/65">{banner.descricao}</p>
        )}
        {banner.cta_label && (
          <span className="mt-1 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            {banner.cta_label}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </div>
  );

  if (!banner.link) {
    return <div className="group h-full">{content}</div>;
  }

  const isExternal = /^https?:\/\//.test(banner.link);
  return (
    <a
      href={banner.link}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group block h-full transition-transform duration-300 hover:-translate-y-0.5"
    >
      {content}
    </a>
  );
};

/**
 * Coluna de banner lateral (esquerda ou direita) — reutilizável em qualquer
 * página. Busca os banners ativos dessa página+posição; some por completo
 * (não renderiza nada) se não houver nenhum cadastrado, pra nunca aparecer
 * uma caixa vazia no site. Com mais de um banner, troca sozinho com fade e
 * mostra pontinhos de navegação manual.
 */
const SideBanner = ({ page, position, className }: { page: BannerPage; position: BannerPosition; className?: string }) => {
  const { banners } = useBanners(page, position);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % banners.length), AUTO_ROTATE_MS);
    return () => clearInterval(id);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className={cn("relative h-full w-full", className)}>
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            i === index ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <BannerSlide banner={banner} />
        </div>
      ))}

      {banners.length > 1 && (
        <div className="absolute inset-x-0 bottom-2.5 z-20 flex justify-center gap-1.5">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              type="button"
              aria-label={`Banner ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-4 bg-primary" : "w-1.5 bg-white/30 hover:bg-white/50",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SideBanner;
