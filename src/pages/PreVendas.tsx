import { useMemo, useState } from "react";
import {
  ShieldCheck,
  Warehouse,
  Radar,
  CircleDot,
  Cog,
  Truck,
  PackageCheck,
  Play,
  Instagram,
} from "lucide-react";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";

import carPorsche from "@/assets/car-porsche-green.jpg";
import carSkyline from "@/assets/car-skyline-white.jpg";
import carGtr from "@/assets/car-gtr-grey.jpg";
import carDatsun from "@/assets/car-datsun-blue.jpg";
import carMustang from "@/assets/car-mustang-orange.jpg";
import carLambo from "@/assets/car-lambo-black.jpg";
import carMclaren from "@/assets/car-mclaren-silver.jpg";
import carFerrari from "@/assets/car-ferrari-redline.jpg";
import carCamaro from "@/assets/car-camaro-purple.jpg";
import carKombi from "@/assets/car-kombi-red.jpg";
import carBumblebee from "@/assets/car-bumblebee.jpg";
import carFerrariVintage from "@/assets/car-ferrari-vintage.jpg";
import garageBg from "@/assets/luxury-garage-bg.jpg";
import cineFrame from "@/assets/diecast-destaque.jpg";

const INSTAGRAM = "https://www.instagram.com/galpao64diecast/";

const BRANDS = ["Todas as Marcas", "Mini GT", "Pop Race", "Tarmac Works", "Kaido House"] as const;
type Brand = (typeof BRANDS)[number];

type PreOrder = {
  id: string;
  brand: Exclude<Brand, "Todas as Marcas">;
  ref: string;
  name: string;
  lot: string;
  eta: string;
  full: string;
  deposit: string;
  image: string;
  hoverImage: string;
  specs: string[];
};

const PRODUCTS: PreOrder[] = [
  {
    id: "mgt-01", brand: "Mini GT", ref: "Mini GT #642", name: "Porsche 911 GT3 RS Weissach",
    lot: "LOTE Q4 2026", eta: "NOV-2026", full: "R$ 189,90", deposit: "R$ 55,00",
    image: carPorsche, hoverImage: carGtr,
    specs: ["Chassi de Metal", "Pneus de Borracha", "Licença Oficial"],
  },
  {
    id: "mgt-02", brand: "Mini GT", ref: "Mini GT #655", name: "Nissan Skyline GT-R R34 V-Spec",
    lot: "LOTE Q4 2026", eta: "DEZ-2026", full: "R$ 179,90", deposit: "R$ 52,00",
    image: carSkyline, hoverImage: carDatsun,
    specs: ["Chassi de Metal", "Pneus de Borracha", "Licença Oficial"],
  },
  {
    id: "mgt-03", brand: "Mini GT", ref: "Mini GT #661", name: "Lamborghini Countach LPI 800-4",
    lot: "LOTE Q1 2027", eta: "FEV-2027", full: "R$ 199,90", deposit: "R$ 60,00",
    image: carLambo, hoverImage: carMclaren,
    specs: ["Chassi de Metal", "Rodas Aro Real", "Licença Oficial"],
  },
  {
    id: "pop-01", brand: "Pop Race", ref: "Pop Race #001", name: "Toyota GR Yaris Pandem",
    lot: "LOTE Q4 2026", eta: "OUT-2026", full: "R$ 209,90", deposit: "R$ 63,00",
    image: carMustang, hoverImage: carBumblebee,
    specs: ["Chassi de Metal", "Pneus de Borracha", "Widebody Oficial"],
  },
  {
    id: "pop-02", brand: "Pop Race", ref: "Pop Race #014", name: "Nissan Silvia S15 Rocket Bunny",
    lot: "LOTE Q4 2026", eta: "NOV-2026", full: "R$ 214,90", deposit: "R$ 65,00",
    image: carDatsun, hoverImage: carSkyline,
    specs: ["Chassi de Metal", "Pneus de Borracha", "Licença Oficial"],
  },
  {
    id: "pop-03", brand: "Pop Race", ref: "Pop Race #022", name: "Ferrari F40 Liberty Walk",
    lot: "LOTE Q1 2027", eta: "JAN-2027", full: "R$ 229,90", deposit: "R$ 69,00",
    image: carFerrari, hoverImage: carFerrariVintage,
    specs: ["Chassi de Metal", "Interior Detalhado", "Licença Oficial"],
  },
  {
    id: "tw-01", brand: "Tarmac Works", ref: "Tarmac Works T64", name: "McLaren Senna GTR Test Car",
    lot: "LOTE Q4 2026", eta: "DEZ-2026", full: "R$ 239,90", deposit: "R$ 72,00",
    image: carMclaren, hoverImage: carLambo,
    specs: ["Chassi de Metal", "Pneus de Borracha", "Livery Oficial"],
  },
  {
    id: "tw-02", brand: "Tarmac Works", ref: "Tarmac Works T64R", name: "Nissan GT-R R35 Nismo Nürburgring",
    lot: "LOTE Q1 2027", eta: "MAR-2027", full: "R$ 249,90", deposit: "R$ 75,00",
    image: carGtr, hoverImage: carPorsche,
    specs: ["Chassi de Metal", "Rodas Aro Real", "Licença Oficial"],
  },
  {
    id: "kh-01", brand: "Kaido House", ref: "Kaido House x MINI GT", name: "Datsun 510 Wagon Kaido GT",
    lot: "LOTE Q4 2026", eta: "NOV-2026", full: "R$ 259,90", deposit: "R$ 78,00",
    image: carKombi, hoverImage: carCamaro,
    specs: ["Chassi de Metal", "Peças Fotogravadas", "Edição Limitada"],
  },
  {
    id: "kh-02", brand: "Kaido House", ref: "Kaido House V3", name: "Datsun 240Z Kaido Works",
    lot: "LOTE Q1 2027", eta: "FEV-2027", full: "R$ 269,90", deposit: "R$ 81,00",
    image: carCamaro, hoverImage: carKombi,
    specs: ["Chassi de Metal", "Pneus de Borracha", "Edição Limitada"],
  },
  {
    id: "kh-03", brand: "Kaido House", ref: "Kaido House V4", name: "Toyota Hilux Kaido Overland",
    lot: "LOTE Q2 2027", eta: "ABR-2027", full: "R$ 279,90", deposit: "R$ 84,00",
    image: carBumblebee, hoverImage: carMustang,
    specs: ["Chassi de Metal", "Suspensão Detalhada", "Edição Limitada"],
  },
];

const PERKS = [
  { icon: ShieldCheck, title: "Preço Trava-Câmbio", desc: "Valor fixo garantido, sem surpresa cambial na chegada." },
  { icon: Warehouse, title: "Garagem Virtual", desc: "Consolide seus envios e pague um único frete." },
  { icon: Radar, title: "Status em Tempo Real", desc: "Acompanhe cada etapa do lote de importação." },
];

const STEPS = [
  { icon: CircleDot, title: "Reserve o Modelo", desc: "Garanta sua vaga com preço protegido contra variação cambial." },
  { icon: Cog, title: "Acompanhe a Produção", desc: "Siga a produção e a importação com nosso rastreador em tempo real." },
  { icon: Warehouse, title: "Estacione na Garagem", desc: "O produto chega e fica guardado na sua Garagem Virtual sem custo." },
  { icon: Truck, title: "Envio Consolidado", desc: "Junte múltiplos lotes e pague apenas um frete quando quiser." },
];

const PaymentOption = ({
  active, onClick, label, hint,
}: { active: boolean; onClick: () => void; label: string; hint: string }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      "flex-1 rounded-lg border px-3 py-2 text-left transition-all duration-300",
      active
        ? "border-primary/70 bg-primary/10 shadow-[0_0_18px_-4px_hsl(var(--primary)/0.6)]"
        : "border-white/10 bg-white/[0.03] hover:border-white/25",
    )}
  >
    <span className={cn("block text-[12px] font-extrabold tracking-tight", active ? "text-primary" : "text-white")}>
      {label}
    </span>
    <span className="mt-0.5 block text-[10px] uppercase tracking-widest text-white/45">{hint}</span>
  </button>
);

const ProductCard = ({ product }: { product: PreOrder }) => {
  const [mode, setMode] = useState<"full" | "deposit">("full");

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07]",
        "bg-[#0d0d0f] shadow-[0_20px_60px_-30px_rgba(0,0,0,1)]",
        "transition-all duration-500 hover:-translate-y-1 hover:border-primary/40",
        "hover:shadow-[0_30px_70px_-25px_hsl(var(--primary)/0.35)]",
      )}
    >
      {/* Badge */}
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] bg-[#111113] px-3 py-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
          {product.lot} | PREVISÃO: {product.eta}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-primary">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          Reserva aberta
        </span>
      </div>

      {/* Stage */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-[#17171a] to-black">
        <img
          src={product.image}
          alt={`${product.brand} ${product.name} em escala 1:64`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-0"
        />
        <img
          src={product.hoverImage}
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-all duration-700 group-hover:opacity-100"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_0%,rgba(255,255,255,0.14),transparent_60%)] opacity-60 transition-opacity duration-500 group-hover:opacity-100"
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary/80">{product.ref}</p>
          <h3 className="mt-1 text-base font-extrabold leading-tight tracking-tight text-white">{product.name}</h3>
        </div>

        <ul className="flex flex-wrap gap-1.5">
          {product.specs.map((s) => (
            <li
              key={s}
              className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/60"
            >
              {s}
            </li>
          ))}
        </ul>

        <div className="mt-auto space-y-3">
          <div className="flex gap-2">
            <PaymentOption
              active={mode === "full"}
              onClick={() => setMode("full")}
              label={`Integral: ${product.full}`}
              hint="-5% off"
            />
            <PaymentOption
              active={mode === "deposit"}
              onClick={() => setMode("deposit")}
              label={`Sinal: ${product.deposit}`}
              hint="30% agora + saldo"
            />
          </div>

          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-full px-4 py-3",
              "bg-gradient-to-r from-primary to-[#ff8a3d] text-[11px] font-black uppercase tracking-[0.2em] text-black",
              "shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.8)] transition-all duration-300",
              "hover:brightness-110 hover:shadow-[0_14px_40px_-8px_hsl(var(--primary)/1)] active:scale-[0.98]",
            )}
          >
            <PackageCheck className="h-4 w-4" strokeWidth={2.5} />
            Reservar para minha garagem
          </a>
        </div>
      </div>
    </article>
  );
};

const PreVendas = () => {
  const [brand, setBrand] = useState<Brand>("Todas as Marcas");

  const filtered = useMemo(
    () => (brand === "Todas as Marcas" ? PRODUCTS : PRODUCTS.filter((p) => p.brand === brand)),
    [brand],
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <img
          src={garageBg}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/70 via-[#09090b]/85 to-[#09090b]" />
        <div className="container relative py-14 md:py-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">Galpão 64 — A arte do diecast</p>
          <h1 className="mt-4 max-w-4xl text-3xl font-black uppercase leading-[1.05] tracking-tight md:text-5xl">
            Lote de reservas globais —{" "}
            <span className="bg-gradient-to-r from-primary via-[#ff8a3d] to-gold bg-clip-text text-transparent">
              garanta o inatingível
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
            Reserve os próximos lançamentos mundiais das melhores marcas antes de esgotarem no mercado.
          </p>

          {/* Brand plates */}
          <div className="mt-8 -mx-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
            <div className="flex min-w-max items-center gap-2.5">
              {BRANDS.map((b) => {
                const active = b === brand;
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBrand(b)}
                    aria-pressed={active}
                    className={cn(
                      "relative rounded-md border px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.16em] transition-all duration-300",
                      "bg-gradient-to-b from-[#27272a] to-[#151517]",
                      active
                        ? "border-primary/70 text-primary shadow-[0_0_24px_-4px_hsl(var(--primary)/0.85),inset_0_1px_0_rgba(255,255,255,0.15)]"
                        : "border-white/10 text-white/55 hover:border-gold/40 hover:text-white",
                    )}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Perks */}
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 backdrop-blur-sm transition-colors hover:border-gold/30"
              >
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-white">{title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-white/50">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="container py-12 md:py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-xl font-black uppercase tracking-[0.14em] text-white md:text-2xl">
            Vitrine de pré-vendas
          </h2>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
            {filtered.length} modelo{filtered.length === 1 ? "" : "s"} · {brand}
          </span>
        </div>

        <div key={brand} className="grid animate-premium-fade-in gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* TIMELINE */}
      <section className="border-y border-white/[0.06] bg-[#0b0b0d] py-14 md:py-20">
        <div className="container">
          <h2 className="text-center text-xl font-black uppercase tracking-[0.14em] md:text-2xl">
            Como funciona a sua <span className="text-gold">Garagem Virtual</span>
          </h2>

          <div className="relative mt-12 grid gap-8 md:grid-cols-4">
            <div
              aria-hidden
              className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent md:block"
            />
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="relative text-center md:text-left">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-[#09090b] shadow-[0_0_24px_-6px_hsl(var(--primary)/0.8)] md:mx-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">
                  Passo {i + 1}
                </p>
                <h3 className="mt-1 text-sm font-extrabold uppercase tracking-[0.1em] text-white">{title}</h3>
                <p className="mt-2 text-[12px] leading-relaxed text-white/50">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CINE GALPÃO */}
      <section className="container py-14 md:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">Cine Galpão</p>
              <h2 className="mt-2 text-xl font-black uppercase tracking-[0.12em] md:text-2xl">
                A história real por trás do lançamento
              </h2>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-b from-[#1c1c20] to-[#0b0b0d] p-3 shadow-[0_30px_80px_-40px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between px-2 pb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Telemetria · G64_CINE_01
              </span>
              <span>30s · 4K</span>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-xl border border-white/[0.08]">
              <img src={cineFrame} alt="Curta cinematográfico do lançamento da semana" className="h-full w-full object-cover" />
              <div aria-hidden className="absolute inset-0 bg-black/45" />
              <button
                type="button"
                className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-black shadow-[0_0_40px_-6px_hsl(var(--primary)/0.9)] transition-transform hover:scale-110"
                aria-label="Assistir ao curta"
              >
                <Play className="h-6 w-6" fill="currentColor" />
              </button>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-gold/20 bg-gold/[0.04] p-4 text-center">
            <p className="text-[12px] leading-relaxed text-white/60">
              O site funciona como vitrine e catálogo. Todas as reservas são confirmadas diretamente no Direct do
              Instagram.
            </p>
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-gold transition-colors hover:bg-gold/10"
            >
              <Instagram className="h-4 w-4" />
              Falar com a curadoria
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PreVendas;
