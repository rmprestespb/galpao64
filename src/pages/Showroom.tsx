import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import galpaoLogo from "@/assets/galpao64-logo.png";
import garageBg from "@/assets/luxury-garage-bg.jpg";

const Showroom = () => {
  return (
    <div
      className="relative min-h-screen text-foreground bg-background bg-fixed bg-center bg-cover before:content-[''] before:absolute before:inset-0 before:bg-background/80 before:pointer-events-none"
      style={{ backgroundImage: `url(${garageBg})` }}
    >
      <div className="relative z-10">
        <header className="sticky top-0 z-50 w-full bg-background/70 backdrop-blur-md border-b border-border/40">
          <div className="container flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src={galpaoLogo}
                alt="Galpão 64"
                className="h-10 w-auto transition-transform group-hover:scale-105"
              />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-foreground/80 hover:text-accent transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </div>
        </header>

        <main className="container flex min-h-[calc(100vh-4rem)] items-center justify-center" />
      </div>
    </div>
  );
};

export default Showroom;
