import { useEffect, useState } from "react";
import { Disc3, Instagram, Loader2, MessageCircle, PackageOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAlbumBadge } from "@/hooks/useAlbumBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import GarageProShowcase from "@/components/GarageProShowcase";
import ferrariRedline from "@/assets/car-ferrari-redline.jpg";
import camaroPurple from "@/assets/car-camaro-purple.jpg";
import bumblebee from "@/assets/car-bumblebee.jpg";
import ferrariVintage from "@/assets/car-ferrari-vintage.jpg";
import galpaoLogo from "@/assets/galpao64-logo.png";
import garageBg from "@/assets/luxury-garage-bg.jpg";
import aboutMiniature from "@/assets/about-miniature.jpg";
import datsunBlue from "@/assets/car-datsun-blue.jpg";
import porscheGreen from "@/assets/car-porsche-green.jpg";
import skylineWhite from "@/assets/car-skyline-white.jpg";
import lamboBlack from "@/assets/car-lambo-black.jpg";
import mustangOrange from "@/assets/car-mustang-orange.jpg";
import mclarenSilver from "@/assets/car-mclaren-silver.jpg";
import gtrGrey from "@/assets/car-gtr-grey.jpg";
import kombiRed from "@/assets/car-kombi-red.jpg";

type Product = {
  id: string;
  title: string;
  series: string | null;
  description?: string | null;
  rarity: number | null;
  price_cents: number;
  exibir_preco_publico?: boolean;
  images: string[];
  video_url?: string | null;
  alt?: string;
  status?: "disponivel" | "reservado" | "vendido";
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

const navLinks: Array<{ label: string; href: string; ariaLabel: string }> = [
  {
    label: "GARAGEM",
    href: "#colecao",
    ariaLabel: "Ir para a seção Garagem — coleção de diecast",
  },
  {
    label: "PRÉ-VENDA",
    href: "/pre-vendas",
    ariaLabel: "Abrir página de Pré-Vendas — reserve lançamentos globais",
  },
  {
    label: "DIECAST",
    href: "/diecast",
    ariaLabel: "Abrir página Diecast — raridades em destaque",
  },
  {
    label: "SHOWROOM",
    href: "/showroom",
    ariaLabel: "Abrir Showroom Interativo — galeria do colecionador",
  },
  {
    label: "SOBRE",
    href: "#sobre",
    ariaLabel: "Ir para a seção Sobre o Galpão 64",
  },
  {
    label: "ÁLBUM/RESERVAS",
    href: "/album",
    ariaLabel: "Abrir Álbum e Reservas",
  },
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
  const { newCount, markSeen } = useAlbumBadge();
  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/")) return; // let browser navigate to route
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <header className="sticky top-0 z-50 w-full bg-background/70 backdrop-blur-md border-b border-border/40">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav
          className="hidden md:flex items-center gap-8"
          aria-label="Navegação principal"
        >
          {navLinks.map((link) => {
            const isAlbum = link.href === "/album";
            const ariaLabel =
              isAlbum && newCount > 0
                ? `${link.ariaLabel} (${newCount} ${newCount === 1 ? "nova reserva" : "novas reservas"})`
                : link.ariaLabel;
            return (
              <a
                key={link.href}
                href={link.href}
                aria-label={ariaLabel}
                onClick={(e) => {
                  if (isAlbum) markSeen();
                  handleNav(e, link.href);
                }}
                className="neon-link relative text-xs font-semibold tracking-[0.2em] text-foreground/90 rounded-sm focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--neon-color))] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {link.label}
                {isAlbum && newCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-2 -right-3 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold leading-[18px] text-center shadow-[0_0_10px_rgba(239,68,68,0.85)] animate-pulse ring-2 ring-background"
                  >
                    {newCount > 9 ? "9+" : newCount}
                  </span>
                )}
              </a>
            );
          })}
          <a
            href="/mystery-box"
            aria-label="Abrir Mystery Box — caixa misteriosa de miniaturas"
            className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.7)]"
          >
            <PackageOpen className="w-4 h-4" />
            Mystery Box
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </a>
        </nav>
      </div>
    </header>
  );
};

type Coveted = {
  src: string;
  alt: string;
  name: string;
  brand: "Hot Wheels" | "Mini GT" | "Matchbox" | "Miniaturas";
  story: string;
};

const coveted: Coveted[] = [
  {
    src: datsunBlue,
    alt: "Hot Wheels RLC Datsun 240Z azul candy com rodas douradas",
    name: "Datsun 240Z — RLC",
    brand: "Hot Wheels",
    story:
      "A Hot Wheels nasceu em 1968 nos Estados Unidos, criada por Elliot Handler na Mattel para revolucionar o mundo dos diecast com rodas Redline ultrarrápidas. O Red Line Club (RLC) é o programa de membros mais cobiçado da marca: tiragens limitadas, numeração individual e acabamentos Spectraflame que tornam cada peça uma relíquia para colecionadores no mundo todo.",
  },
  {
    src: porscheGreen,
    alt: "Hot Wheels Super Treasure Hunt Porsche 911 GT3 RS verde menta",
    name: "Porsche 911 GT3 RS — STH",
    brand: "Hot Wheels",
    story:
      "Os Super Treasure Hunt são o santo graal do segmento mainline da Hot Wheels: pintura Spectraflame, Real Riders com pneus de borracha e o icônico símbolo da chama em círculo. Encontrar um STH em loja é raríssimo — em média, 1 a cada milhares de blisters — o que faz colecionadores caçarem cada peg pelo Brasil em busca dessa raridade.",
  },
  {
    src: skylineWhite,
    alt: "Hot Wheels RLC Nissan Skyline GT-R R34 branca pérola",
    name: "Nissan Skyline GT-R R34",
    brand: "Hot Wheels",
    story:
      "Eternizado pelo cinema e pela cultura JDM, o Skyline GT-R R34 é uma das licenças mais disputadas da Hot Wheels. As versões RLC trazem detalhes de tampografia, faróis pintados e rodas em escala fiel — peças que valorizam ano após ano e formam o núcleo de qualquer coleção JDM séria.",
  },
  {
    src: lamboBlack,
    alt: "Mini GT Lamborghini Aventador SVJ preto fosco",
    name: "Lamborghini Aventador SVJ",
    brand: "Mini GT",
    story:
      "A Mini GT, da TSM Models, levou o 1:64 a outro patamar a partir de 2018: rodas com freios pintados, faróis transparentes, vidros de verdade e proporções de modelo de resina em escala de bolso. É a escolha de quem busca realismo de prateleira sem abrir mão da escala clássica do diecast.",
  },
  {
    src: mustangOrange,
    alt: "Matchbox Ford Mustang Boss 429 laranja com listras pretas",
    name: "Ford Mustang Boss 429",
    brand: "Matchbox",
    story:
      "A Matchbox nasceu em Londres em 1953, anterior à própria Hot Wheels, e ficou famosa pelas caixinhas de fósforo que cabiam no bolso de qualquer criança. Hoje a linha Moving Parts e os Matchbox Collectors resgatam clássicos americanos e europeus com fidelidade impressionante e foco em modelos reais.",
  },
  {
    src: mclarenSilver,
    alt: "Hot Wheels Super Treasure Hunt McLaren F1 GTR prata",
    name: "McLaren F1 GTR",
    brand: "Hot Wheels",
    story:
      "O McLaren F1 GTR é uma lenda das 24 Horas de Le Mans de 1995 e, no universo diecast, virou peça de desejo absoluto. Em versão Super Treasure Hunt, ganha pintura premium e Real Riders, transformando uma miniatura de R$ 15 numa peça que pode valer centenas no mercado de colecionadores.",
  },
  {
    src: gtrGrey,
    alt: "Mini GT Liberty Walk Nissan GT-R R35 grafite com kit widebody",
    name: "LB★Works Nissan GT-R R35",
    brand: "Mini GT",
    story:
      "As parcerias da Mini GT com a Liberty Walk trouxeram para o 1:64 os widebodies mais emblemáticos do tuning japonês. Cada lançamento esgota em minutos nas pré-vendas e se tornou referência de qualidade entre colecionadores que valorizam estilo agressivo e acabamento de catálogo.",
  },
  {
    src: kombiRed,
    alt: "Matchbox Volkswagen Kombi T1 vermelha e branca clássica",
    name: "VW Kombi T1 Classic",
    brand: "Miniaturas",
    story:
      "O universo das miniaturas vai além das marcas: ele guarda a memória afetiva do automobilismo. Da Kombi de família aos hipercarros modernos, cada peça em escala 1:64 conta uma história — e o Galpão 64 nasce justamente para reunir essas histórias num só lugar, com curadoria e raridade.",
  },
];

const Hero = () => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Coveted | null>(null);

  const handleSelect = (item: Coveted) => {
    setActive(item);
    setOpen(true);
  };

  return (
    <section id="top" className="relative pt-4 pb-4 sm:pt-6 sm:pb-6">
      <h1 className="sr-only">Galpão 64 — A Arte do Diecast</h1>
      <div className="container grid grid-cols-1 md:grid-cols-[auto_1fr] items-center gap-6 md:gap-10">
        <div className="flex justify-center md:justify-start">
          <img
            src={galpaoLogo}
            alt="Logotipo Galpão 64 — A Arte do Diecast"
            width={1100}
            height={1100}
            className="w-[55%] max-w-[200px] md:w-auto md:max-w-[240px] h-auto drop-shadow-[0_20px_60px_rgba(0,0,0,0.85)] animate-fade-in"
          />
        </div>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {coveted.map((c) => (
            <button
              key={c.src}
              onClick={() => handleSelect(c)}
              aria-label={`Ver história de ${c.name}`}
              className="group relative aspect-square overflow-hidden rounded-lg bg-black border border-border/60 shadow-[0_8px_24px_rgba(0,0,0,0.6)] transition-all duration-300 hover:border-accent/60 hover:shadow-glow-cyan hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <img
                src={c.src}
                alt={c.alt}
                width={768}
                height={768}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                {c.brand}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-md border-border/60">
          {active && (
            <>
              <div className="aspect-video w-full overflow-hidden rounded-md bg-black">
                <img
                  src={active.src}
                  alt={active.alt}
                  className="h-full w-full object-cover"
                />
              </div>
              <DialogHeader>
                <p className="text-xs font-bold tracking-[0.25em] text-accent uppercase">
                  {active.brand}
                </p>
                <DialogTitle className="text-2xl font-extrabold">
                  {active.name}
                </DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                  {active.story}
                </DialogDescription>
              </DialogHeader>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  const handleBuy = () => {
    window.open(
      "https://www.instagram.com/galpao64diecast/",
      "_blank",
      "noopener,noreferrer",
    );
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
          aria-label={`Comprar ${product.title} via Instagram`}
        >
          <Instagram className="h-4 w-4" strokeWidth={2.5} />
          Comprar via Instagram
        </button>
      </div>
    </article>
  );
};

type CarHotspot = {
  id: string;
  name: string;
  brand: string;
  story: string;
  // normalized 0-1 coords (relative to image)
  x: number;
  y: number;
  w: number;
  h: number;
};

const carHotspots: CarHotspot[] = [
  // Front row (4 cars)
  {
    id: "skyline-blue",
    name: "Nissan Skyline GT-R R34",
    brand: "Hot Wheels RLC",
    story:
      "Eternizado pelo cinema e pela cultura JDM, o R34 em azul Bayside é um dos modelos mais cobiçados do mundo diecast. A versão RLC traz pintura Spectraflame, faróis pintados e Real Riders — uma peça que valoriza a cada lançamento.",
    x: 0.0, y: 0.55, w: 0.30, h: 0.22,
  },
  {
    id: "ferrari-f40",
    name: "Ferrari F40",
    brand: "Hot Wheels Premium",
    story:
      "A última Ferrari aprovada pessoalmente por Enzo Ferrari. Em escala 1:64, o F40 vermelho Rosso Corsa é um símbolo absoluto do colecionismo: linhas agressivas, asa traseira icônica e o V8 biturbo que marcou os anos 80.",
    x: 0.22, y: 0.55, w: 0.28, h: 0.20,
  },
  {
    id: "lambo-purple",
    name: "Lamborghini Aventador",
    brand: "Mini GT",
    story:
      "O Aventador em viola metálico é um dos lançamentos mais celebrados da Mini GT. Rodas com freios pintados, vidros transparentes e proporções fiéis fazem dele referência absoluta de realismo no segmento 1:64.",
    x: 0.46, y: 0.55, w: 0.26, h: 0.20,
  },
  {
    id: "mclaren-white",
    name: "McLaren GT",
    brand: "Mini GT",
    story:
      "O McLaren branco pérola representa o auge do GT moderno britânico. Cada detalhe — das entradas de ar laterais às portas dihedral — foi reproduzido com precisão de joalheria, transformando a peça num objeto de desejo de prateleira.",
    x: 0.70, y: 0.55, w: 0.28, h: 0.22,
  },
  // Back row (5 cars)
  {
    id: "lambo-black",
    name: "Lamborghini Diablo",
    brand: "Hot Wheels",
    story:
      "O Diablo preto fosco evoca a brutalidade dos supercarros dos anos 90. Versão raríssima de mainline com tampografia premium, é um clássico que sempre desaparece dos pegs em segundos.",
    x: 0.04, y: 0.45, w: 0.18, h: 0.13,
  },
  {
    id: "porsche-silver",
    name: "Porsche 911 GT3",
    brand: "Mini GT",
    story:
      "O 911 prata Liquid Chrome traz a essência do esporte alemão para o 1:64. Pintura espelhada, asa traseira fixa e rodas centrais — uma peça que combina engenharia e arte em escala reduzida.",
    x: 0.20, y: 0.43, w: 0.16, h: 0.13,
  },
  {
    id: "lambo-orange",
    name: "Lamborghini Countach",
    brand: "Hot Wheels Premium",
    story:
      "O Countach laranja Arancio é puro DNA dos anos 80: portas tesoura, cunha agressiva e escapamentos quádruplos. Lançamento da linha Premium com Real Riders, é o sonho de qualquer colecionador retrô.",
    x: 0.34, y: 0.42, w: 0.18, h: 0.14,
  },
  {
    id: "lambo-yellow",
    name: "Lamborghini Huracán",
    brand: "Hot Wheels STH",
    story:
      "Um Super Treasure Hunt em amarelo Giallo Orion. Encontrar essa peça em loja é praticamente impossível — pintura Spectraflame, símbolo da chama em círculo e Real Riders fazem dela uma das mais valiosas da linha.",
    x: 0.50, y: 0.45, w: 0.18, h: 0.13,
  },
  {
    id: "lambo-violet",
    name: "Lamborghini Aventador SVJ",
    brand: "Mini GT Liberty Walk",
    story:
      "Edição Liberty Walk em violeta cromático. As parcerias da Mini GT com a LB★Works esgotam em minutos nas pré-vendas e definem o padrão de tuning japonês aplicado aos hipercarros italianos.",
    x: 0.72, y: 0.42, w: 0.20, h: 0.14,
  },
];

const AboutSection = () => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<CarHotspot | null>(null);

  const handleSelect = (car: CarHotspot) => {
    setActive(car);
    setOpen(true);
  };

  return (
    <>
      <section
    id="sobre"
    className="relative py-16 sm:py-24 bg-gradient-to-b from-black via-[hsl(0_0%_6%)] to-black border-y border-border/40"
  >
    <div className="container grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
      <div className="text-left order-2 md:order-1">
        <p className="text-xs font-bold tracking-[0.3em] text-accent uppercase mb-4">
          Nossa Essência
        </p>
        <h2 className="neon-title text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase leading-[0.95] tracking-tight text-foreground mb-8">
          A Arte do <span className="text-primary">Diecast</span>
          <br />
          em Escala 1:64
        </h2>
        <div className="space-y-4 text-base sm:text-lg leading-relaxed text-muted-foreground max-w-xl">
          <p>
            Bem-vindo ao <span className="text-foreground font-semibold">Galpão 64</span>, o
            destino definitivo para colecionadores de diecast de alto nível. Especializados na
            escala 1:64, oferecemos uma seleção rigorosa de modelos raros, importados e
            clássicos que definem gerações.
          </p>
          <p>
            Nossa missão é facilitar o acesso a peças exclusivas e garantir que cada miniatura
            entregue em suas mãos carregue a história e a qualidade que você procura. Se você
            busca raridade, integridade e paixão por carros, você encontrou o seu lugar.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
          <div>
            <p className="text-3xl font-extrabold text-accent">+500</p>
            <p className="text-muted-foreground text-[11px] uppercase tracking-[0.2em] font-bold mt-1">
              Peças catalogadas
            </p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-accent">100%</p>
            <p className="text-muted-foreground text-[11px] uppercase tracking-[0.2em] font-bold mt-1">
              Curadoria própria
            </p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-accent">1:64</p>
            <p className="text-muted-foreground text-[11px] uppercase tracking-[0.2em] font-bold mt-1">
              Escala oficial
            </p>
          </div>
        </div>
      </div>
      <div className="order-1 md:order-2 flex justify-center md:justify-end">
        <div className="relative w-full max-w-md aspect-square">
          <div
            aria-hidden="true"
            className="absolute -inset-6 rounded-full bg-primary/10 blur-3xl"
          />
          <img
            src={aboutMiniature}
            alt="Coleção de miniaturas em escala 1:64 expostas em galpão industrial com reflexo no piso, estilo evento de colecionadores"
            width={1024}
            height={1024}
            loading="lazy"
            className="relative w-full h-full object-cover rounded-2xl border border-border/60 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)]"
          />
          {carHotspots.map((car) => (
            <button
              key={car.id}
              onClick={() => handleSelect(car)}
              aria-label={`Ver história do ${car.name}`}
              className="group absolute rounded-md border border-transparent transition-all duration-300 hover:border-accent hover:bg-accent/10 hover:shadow-glow-cyan focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
              style={{
                left: `${car.x * 100}%`,
                top: `${car.y * 100}%`,
                width: `${car.w * 100}%`,
                height: `${car.h * 100}%`,
              }}
            >
              <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-7 whitespace-nowrap rounded-full bg-black/90 border border-accent/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                {car.name}
              </span>
            </button>
          ))}
          <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.25em] font-bold text-foreground/70 bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-border/60">
            Clique em um carro
          </p>
        </div>
      </div>
    </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg bg-card/95 backdrop-blur-md border-border/60">
          {active && (
            <DialogHeader>
              <p className="text-xs font-bold tracking-[0.25em] text-accent uppercase">
                {active.brand}
              </p>
              <DialogTitle className="text-2xl font-extrabold">
                {active.name}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground pt-2">
                {active.story}
              </DialogDescription>
            </DialogHeader>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

const Collection = () => {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("products")
      .select("id, title, series, description, rarity, price_cents, exibir_preco_publico, images, video_url, status")
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
              description: (d as any).description ?? null,
              rarity: d.rarity,
              price_cents: d.price_cents,
              exibir_preco_publico: (d as any).exibir_preco_publico ?? true,
              images: d.images?.length ? d.images : [ferrariRedline],
              video_url: (d as any).video_url ?? null,
              status: (d as any).status ?? "disponivel",
            })),
          );
        }
        setLoading(false);
      });
  }, []);

  return (
    <section id="colecao" className="pt-16 pb-12 sm:pt-24 sm:pb-20">
      <div className="container">
        <header className="mb-8 sm:mb-10 text-center">
          <h2 className="font-serifDisplay text-4xl sm:text-5xl lg:text-6xl font-bold text-gold tracking-wide">
            Garagem Galpão 64
          </h2>
          <div className="mx-auto mt-3 h-px w-32 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
          <p className="mt-3 text-[11px] sm:text-xs uppercase tracking-[0.4em] text-white/50 max-w-xl mx-auto">
            Curadoria técnica e exemplares exclusivos para o colecionador de alto nível.
          </p>
        </header>
        <a
          href="https://www.instagram.com/galpao64diecast/"
          target="_blank"
          rel="noopener noreferrer"
          className="group mx-auto mb-10 sm:mb-12 flex max-w-3xl items-center justify-center gap-3 rounded-full border border-gold/30 bg-white/[0.03] backdrop-blur-xl px-5 py-3 text-center transition-all hover:border-gold/60 hover:bg-white/[0.06]"
          aria-label="Abrir perfil do Galpão 64 no Instagram"
        >
          <Instagram className="h-4 w-4 shrink-0 text-gold" strokeWidth={2} />
          <p className="text-[11px] sm:text-xs leading-relaxed tracking-[0.12em] text-white/75">
            Este site é uma <span className="text-gold-soft font-semibold">vitrine de catálogo</span>. Todas as reservas e vendas são realizadas
            diretamente via Direct no Instagram
            <span className="text-white/95 font-semibold"> @galpao64diecast</span>.
          </p>
        </a>
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="flex flex-col gap-10 lg:gap-14">
            {products.map((p) => (
              <GarageProShowcase
                key={p.id}
                product={{
                  id: p.id,
                  title: p.title,
                  series: p.series,
                  description: p.description,
                  price_cents: p.price_cents,
                  exibir_preco_publico: p.exibir_preco_publico,
                  looseImage: p.images[0] ?? "",
                  blisterImage: p.images[1] ?? null,
                  extraImages: p.images.slice(2),
                  videoUrl: p.video_url,
                  alt: p.alt,
                  status: p.status,
                  rarity: p.rarity,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="border-t border-border/40 py-10 mt-10">
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
    <div className="container mt-6 flex justify-center">
      <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground/80">
        Criado por{" "}
        <a
          href="https://www.kaeth.com.br/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground/90 hover:text-accent transition-colors underline-offset-4 hover:underline"
        >
          Agência Kaeth
        </a>
      </p>
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
          <AboutSection />
          <Collection />
        </main>
        <Footer />
        <a
          href="https://wa.me/5546999350070"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-[0_0_0_0_rgba(34,197,94,0.6)] hover:bg-green-600 transition-all hover:scale-110 flex items-center justify-center animate-pulse"
          aria-label="Contato WhatsApp"
        >
          <MessageCircle size={28} />
        </a>
      </div>
    </div>
  );
};

export default Index;
