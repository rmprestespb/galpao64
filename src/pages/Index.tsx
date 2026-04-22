import { Flame, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import ferrariRedline from "@/assets/car-ferrari-redline.jpg";
import camaroPurple from "@/assets/car-camaro-purple.jpg";
import bumblebee from "@/assets/car-bumblebee.jpg";
import ferrariVintage from "@/assets/car-ferrari-vintage.jpg";

type Product = {
  id: string;
  title: string;
  series: string;
  rarity: number;
  price: string;
  image: string;
  alt: string;
};

const products: Product[] = [
  {
    id: "redline",
    title: "Red Line Club Exclusive",
    series: "Red Line Club",
    rarity: 98,
    price: "R$ 2.600",
    image: ferrariRedline,
    alt: "Miniatura Ferrari vermelha Red Line Club Exclusive",
  },
  {
    id: "sth-purple",
    title: "Super Treasure Hunt Purple",
    series: "Super Treasure Hunt",
    rarity: 95,
    price: "R$ 3.200",
    image: camaroPurple,
    alt: "Miniatura Camaro roxo Super Treasure Hunt",
  },
  {
    id: "bumblebee",
    title: "Bumblebee Transformers",
    series: "Transformers",
    rarity: 99,
    price: "R$ 5.000",
    image: bumblebee,
    alt: "Miniatura Camaro Bumblebee amarelo Transformers",
  },
  {
    id: "vintage",
    title: "Vintage Treasure",
    series: "Vintage Collection",
    rarity: 92,
    price: "R$ 1.800",
    image: ferrariVintage,
    alt: "Miniatura Ferrari vermelha vintage clássica",
  },
];

const navLinks = [
  { label: "COLEÇÃO", href: "#colecao" },
  { label: "RARIDADES", href: "#raridades" },
  { label: "SOBRE", href: "#sobre" },
  { label: "ÁLBUM/RESERVAS", href: "#album" },
];

const Logo = () => (
  <a href="#top" className="flex items-center gap-2 group">
    <Flame
      className="h-6 w-6 text-primary transition-transform group-hover:scale-110"
      strokeWidth={2.5}
      fill="hsl(var(--primary))"
    />
    <span className="text-primary font-extrabold tracking-[0.18em] text-sm sm:text-base">
      HOT WHEELS <span className="font-black">LUXURY</span>
    </span>
  </a>
);

const Header = () => {
  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur border-b border-border/40">
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

const Hero = () => (
  <section id="top" className="relative pt-20 pb-16 sm:pt-28 sm:pb-20 text-center bg-stage">
    <div className="container">
      <p className="text-xs sm:text-sm font-semibold tracking-[0.4em] text-muted-foreground mb-6">
        EXCLUSIVIDADE · RARIDADE · COLECIONÁVEL
      </p>
      <h1 className="font-display font-black uppercase leading-[0.95] tracking-tight text-4xl sm:text-6xl md:text-7xl lg:text-8xl">
        <span className="block text-foreground">VITRINE DE</span>
        <span className="block text-accent text-glow-cyan">MINIATURAS</span>
      </h1>
      <p className="mt-8 max-w-xl mx-auto text-base sm:text-lg text-muted-foreground">
        Peças raras Hot Wheels para colecionadores exigentes. Curadoria de edições
        limitadas, treasure hunts e exclusivos do Red Line Club.
      </p>
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
    <article className="group flex flex-col rounded-lg bg-card border border-border/60 overflow-hidden transition-all duration-300 hover:border-accent/60 hover:-translate-y-1 hover:shadow-glow-cyan">
      <div className="relative aspect-square overflow-hidden bg-black">
        <img
          src={product.image}
          alt={product.alt}
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
            SÉR: <span className="text-muted-foreground/90">{product.series}</span>
          </p>
          <p className="text-accent">
            RARIDADE: <span className="font-bold">{product.rarity}%</span>
          </p>
          <p className="text-primary text-sm">
            PREÇO: <span className="font-extrabold">{product.price}</span>
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

const Collection = () => (
  <section id="colecao" className="py-12 sm:py-20">
    <div className="container">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer id="sobre" className="border-t border-border/40 py-10 mt-10">
    <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
      <Logo />
      <p className="text-xs text-muted-foreground tracking-wider">
        © {new Date().getFullYear()} HOT WHEELS LUXURY · Vitrine de Miniaturas
      </p>
    </div>
  </footer>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Collection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
