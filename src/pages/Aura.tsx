import { Link } from "react-router-dom";
import auraHero from "@/assets/aura-hero.jpg";

const Aura = () => {
  return (
    <main
      className="relative min-h-screen w-full overflow-hidden bg-black text-white"
      style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', serif" }}
    >
      {/* SEO H1 hidden visually */}
      <h1 className="sr-only">Aura Motors — A Excelência Automotiva Redefinida</h1>

      {/* Background image */}
      <img
        src={auraHero}
        alt="Farol LED de superesportivo preto sobre fibra de carbono"
        width={1920}
        height={1080}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.85)_85%)]" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-between px-6 py-14 md:py-20">
        {/* Top brand mark */}
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.5em] text-white/50">
          <span className="h-px w-8 bg-[#C9A96A]/60" />
          Atelier Privado
          <span className="h-px w-8 bg-[#C9A96A]/60" />
        </div>

        {/* Center logo + slogan */}
        <div className="flex flex-col items-center text-center animate-fade-in">
          <div
            className="text-5xl md:text-7xl lg:text-8xl font-light tracking-[0.25em]"
            style={{
              color: "#C9A96A",
              textShadow: "0 0 30px rgba(201,169,106,0.35), 0 2px 8px rgba(0,0,0,0.8)",
            }}
          >
            AURA
          </div>
          <div
            className="mt-1 text-xs md:text-sm tracking-[0.7em] text-white/80"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            M O T O R S
          </div>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <span className="h-px w-12 bg-[#C9A96A]/50" />
            <span className="h-1.5 w-1.5 rotate-45 bg-[#C9A96A]" />
            <span className="h-px w-12 bg-[#C9A96A]/50" />
          </div>

          <p
            className="max-w-md text-base md:text-lg italic text-white/85"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            A Excelência Automotiva Redefinida
          </p>
        </div>

        {/* CTA */}
        <Link
          to="/"
          className="group relative inline-flex items-center justify-center border border-[#C9A96A] bg-transparent px-12 py-4 text-xs tracking-[0.5em] text-[#C9A96A] transition-all duration-500 hover:bg-[#C9A96A] hover:text-black hover:shadow-[0_0_40px_rgba(201,169,106,0.45)]"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          ENTRAR NO ATELIER
        </Link>
      </div>
    </main>
  );
};

export default Aura;