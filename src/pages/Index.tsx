import { useEffect, useState } from "react";
import { ChevronRight, Disc3, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ferrariRedline from "@/assets/car-ferrari-redline.jpg";
import camaroPurple from "@/assets/car-camaro-purple.jpg";
import bumblebee from "@/assets/car-bumblebee.jpg";
import ferrariVintage from "@/assets/car-ferrari-vintage.jpg";
import galpaoLogo from "@/assets/galpao64-logo.png";
import garageBg from "@/assets/luxury-garage-bg.jpg";
import datsunBlue from "@/assets/car-datsun-blue.jpg";
import porscheGreen from "@/assets/car-porsche-green.jpg";
import skylineWhite from "@/assets/car-skyline-white.jpg";

type Product = {
  id: string;
  title: string;
  series: string | null;
  rarity: number | null;
  price_cents: number;
  images: string[];
  alt?: string;
};

const fallbackProducts: Product[] = [
  {
    id: "redline",
    title: "Red Line Club Exclusive",
    series: "Red Line Club",
    rarity: 98,
    price_cents: 260000,
    images: [ferrariRedline],
    alt: "Miniatura Ferrari vermelha Red Line Club Exclusive",
  },
  {
    id: "sth-purple",
    title: "Super Treasure Hunt Purple",
    series: "Super Treasure Hunt",
    rarity: 95,
    price_cents: 320000,
    images: [camaroPurple],
    alt: "Miniatura Camaro roxo Super Treasure Hunt",
  },
  {
    id: "bumblebee",
    title: "Bumblebee Transformers",
    series: "Transformers",
    rarity: 99,
    price_cents: 500000,
    images: [bumblebee],
    alt: "Miniatura Camaro Bumblebee amarelo Transformers",
  },
  {
    id: "vintage",
    title: "Vintage Treasure",
    series: "Vintage Collection",
    rarity: 92,
    price_cents: 180000,
    images: [ferrariVintage],
    alt: "Miniatura Ferrari vermelha vintage clássica",
  },
];

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const navLinks = [
  { label: "COLEÇÃO", href: "#colecao" },
  { label: "RARIDADES", href: "#raridades" },
  { label: "SOBRE", href: "#sobre" },
  { label: "ÁLBUM/RESERVAS", href: "#album" },
];

const Logo = () => (
  <a href="#top" className="flex items-center gap-2 group">
    <img
      src={galpaoLogo}
      alt="Galpão 64 — A Arte do Diecast"
      className="h-10 w-auto transition-transform group-hover:scale-105 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
    />
  </a>
);

const Header = () => {
  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <header className="sticky top-0 z-50 w-full bg-background/70 backdrop-blur-md border-b border-border/40">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNav(e, link.href)}
              className="text-xs font-semibold tracking-[0.2em] text-foreground/90 hover:text-accent transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};

const coveted = [
  { src: datsunBlue, alt: "Hot Wheels RLC Datsun 240Z azul candy com rodas douradas" },
  { src: porscheGreen, alt: "Hot Wheels Super Treasure Hunt Porsche 911 GT3 RS verde menta" },
  { src: skylineWhite, alt: "Hot Wheels RLC Nissan Skyline GT-R R34 branca pérola" },
];

const Hero = () => (
  <section id="top" className="relative pt-4 pb-4 sm:pt-6 sm:pb-6">
    <h1 className="sr-only">Galpão 64 — A Arte do Diecast</h1>
    <div className="container grid grid-cols-2 items-center gap-4 sm:gap-8">
      <div className="flex justify-start">
        <img
          src={galpaoLogo}
          alt="Logotipo Galpão 64 — A Arte do Diecast"
          width={1100}
          height={1100}
          className="w-[80%] max-w-[220px] sm:max-w-[280px] h-auto drop-shadow-[0_20px_60px_rgba(0,0,0,0.85)] animate-fade-in"
        />
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {coveted.map((c) => (
          <div
            key={c.src}
            className="group relative aspect-square overflow-hidden rounded-lg bg-black border border-border/60 shadow-[0_8px_24px_rgba(0,0,0,0.6)] transition-all duration-300 hover:border-accent/60 hover:shadow-glow-cyan hover:-translate-y-0.5"
          >
            <img
              src={c.src}
              alt={c.alt}
              width={768}
              height={768}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ProductCard = ({ product }: { product: Product }) => {
  const handleBuy = () => {
    toast.success("Item reservado", {
      description: `${product.title} foi adicionado à sua reserva.`,
    });
  };
  return (
    <article className="group flex flex-col rounded-lg bg-card/85 backdrop-blur-sm border border-border/60 overflow-hidden transition-all duration-300 hover:border-accent/60 hover:-translate-y-1 hover:shadow-glow-cyan">
      <div className="relative aspect-square overflow-hidden bg-black">
        <img
          src={product.images[0]}
          alt={product.alt ?? product.title}
          width={768}
          height={768}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col flex-1 p-5 gap-3">
        <h3 className="text-lg font-bold leading-tight text-foreground">
          {product.title}
        </h3>
        <div className="space-y-1.5 text-xs font-semibold tracking-wider">
          <p className="text-muted-foreground">
            SÉR: <span className="text-muted-foreground/90">{product.series ?? "—"}</span>
          </p>
          <p className="text-accent">
            RARIDADE: <span className="font-bold">{product.rarity ?? 0}%</span>
          </p>
          <p className="text-primary text-sm">
            PREÇO: <span className="font-extrabold">{formatBRL(product.price_cents)}</span>
          </p>
        </div>
        <button
          onClick={handleBuy}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold tracking-[0.2em] text-sm uppercase py-3 rounded-md transition-all hover:shadow-glow-orange hover:bg-primary/95 active:scale-[0.98]"
          aria-label={`Comprar ${product.title}`}
        >
          COMPRAR
          <ChevronRight className="h-4 w-4" strokeWidth={3} />
        </button>
      </div>
    </article>
  );
};

const Collection = () => {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("products")
      .select("id, title, series, rarity, price_cents, images")
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setProducts(
            data.map((d) => ({
              id: d.id,
              title: d.title,
              series: d.series,
              rarity: d.rarity,
              price_cents: d.price_cents,
              images: d.images?.length ? d.images : [ferrariRedline],
            })),
          );
        }
        setLoading(false);
      });
  }, []);

  return (
    <section id="colecao" className="pt-4 pb-12 sm:pt-6 sm:pb-20">
      <div className="container">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const Footer = () => (
  <footer id="sobre" className="border-t border-border/40 py-10 mt-10">
    <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
      <Logo />
      <p className="text-xs text-muted-foreground tracking-wider text-center">
        © {new Date().getFullYear()} GALPÃO 64 · Vitrine de Miniaturas
      </p>
      <a
        href="/admin/login"
        aria-label="Acesso administrativo"
        title="Acesso administrativo"
        className="group inline-flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-card transition-all hover:border-accent hover:shadow-glow-cyan"
      >
        <Disc3
          className="h-7 w-7 text-muted-foreground transition-all group-hover:text-accent group-hover:rotate-180 duration-500"
          strokeWidth={2}
        />
      </a>
    </div>
  </footer>
);

const Index = () => {
  return (
    <div
      className="relative min-h-screen text-foreground bg-background bg-fixed bg-center bg-cover before:content-[''] before:absolute before:inset-0 before:bg-background/75 before:pointer-events-none"
      style={{ backgroundImage: `url(${garageBg})` }}
    >
      <div className="relative z-10">
        <Header />
        <main>
          <Hero />
          <Collection />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Index;
