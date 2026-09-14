import { useEffect, useMemo, useState } from "react";
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
  MessageCircle,
  Timer,
  CalendarClock,
  PackageSearch,
  ShieldQuestion,
} from "lucide-react";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
import galpaoLogo from "@/assets/galpao64-logo.png";

const INSTAGRAM = "https://www.instagram.com/galpao64diecast/";
// Mesmo número usado nos outros pontos de contato do site (ProductGarageCard, botão flutuante do Index).
// Troque aqui caso queira usar um link de Grupo/Lista de transmissão do WhatsApp dedicado à Lista VIP.
const WHATSAPP_NUMBER = "5546999350070";

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

// Metadados de cada lote de pré-venda: código de exibição e data/hora de encerramento das reservas.
// Ajuste "closesAt" sempre que abrir ou prorrogar um lote.
const LOT_INFO: Record<string, { code: string; closesAt: string }> = {
  "LOTE Q4 2026": { code: "LOTE 01", closesAt: "2026-10-31T23:59:59-03:00" },
  "LOTE Q1 2027": { code: "LOTE 02", closesAt: "2027-01-31T23:59:59-03:00" },
  "LOTE Q2 2027": { code: "LOTE 03", closesAt: "2027-04-30T23:59:59-03:00" },
};

const MONTHS: Record<string, string> = {
  JAN: "Janeiro", FEV: "Fevereiro", MAR: "Março", ABR: "Abril", MAI: "Maio", JUN: "Junho",
  JUL: "Julho", AGO: "Agosto", SET: "Setembro", OUT: "Outubro", NOV: "Novembro", DEZ: "Dezembro",
};

const formatEta = (code: string) => {
  const [m, y] = code.split("-");
  return `${MONTHS[m] ?? m}/${y}`;
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
    id: "mgt-04", brand: "Mini GT", ref: "Mini GT #672", name: "Toyota GR Supra A90 Jarama Racing",
    lot: "LOTE Q2 2027", eta: "MAI-2027", full: "R$ 194,90", deposit: "R$ 58,00",
    image: carGtr, hoverImage: carSkyline,
    specs: ["Chassi de Metal", "Pneus de Borracha", "Licença Oficial"],
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
    id: "pop-04", brand: "Pop Race", ref: "Pop Race #031", name: "Mazda RX-7 FD3S RE Amemiya",
    lot: "LOTE Q2 2027", eta: "ABR-2027", full: "R$ 219,90", deposit: "R$ 66,00",
    image: carDatsun, hoverImage: carMustang,
    specs: ["Chassi de Metal", "Widebody Oficial", "Edição Limitada"],
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
    id: "tw-03", brand: "Tarmac Works", ref: "Tarmac Works T64G", name: "Porsche 911 GT3 Cup Manthey Racing",
    lot: "LOTE Q4 2026", eta: "JAN-2027", full: "R$ 244,90", deposit: "R$ 73,00",
    image: carPorsche, hoverImage: carFerrari,
    specs: ["Chassi de Metal", "Livery Oficial", "Edição Limitada"],
  },
  {
    id: "tw-04", brand: "Tarmac Works", ref: "Tarmac Works T64-GT3", name: "BMW M4 GT3 Team WRT",
    lot: "LOTE Q2 2027", eta: "MAI-2027", full: "R$ 254,90", deposit: "R$ 76,00",
    image: carLambo, hoverImage: carGtr,
    specs: ["Chassi de Metal", "Pneus de Borracha", "Livery Oficial"],
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
  {
    id: "kh-04", brand: "Kaido House", ref: "Kaido House V5", name: "Toyota Supra Kaido Works V1",
    lot: "LOTE Q1 2027", eta: "MAR-2027", full: "R$ 274,90", deposit: "R$ 82,00",
    image: carFerrariVintage, hoverImage: carDatsun,
    specs: ["Chassi de Metal", "Peças Fotogravadas", "Edição Limitada"],
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

const FAQ_ITEMS = [
  {
    q: "Como funciona o pagamento do sinal?",
    a: "Você garante sua vaga no lote pagando um sinal de reserva (normalmente 30% do valor) via PIX. O saldo restante só é cobrado quando o lote físico chega ao Galpão 64, antes do envio da sua miniatura. Se preferir resolver tudo de uma vez, também dá para pagar o valor integral e ainda garantir um desconto exclusivo.",
  },
  {
    q: "O que acontece quando o lote de miniaturas chegar ao Brasil?",
    a: "Assim que o lote físico dá entrada no Galpão 64, conferimos cada peça reservada, avisamos você pelo WhatsApp e organizamos o pagamento do saldo (quando houver) e o envio ou combinamos a retirada.",
  },
  {
    q: "Como acompanhar o status e o envio do meu pedido?",
    a: "Todo o acompanhamento da sua reserva é feito diretamente pelo WhatsApp com a equipe do Galpão 64 — você pode chamar a qualquer momento para saber a fase do lote (produção, trânsito, chegada). Assim que o envio for despachado, te passamos o código de rastreio.",
  },
];

const PADDED = (n: number, len = 2) => String(n).padStart(len, "0");

const useCountdownTo = (iso: string) => {
  const target = useMemo(() => new Date(iso).getTime(), [iso]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  return { days, hours, minutes, ended: diff <= 0 };
};

const LotCountdown = ({ closesAt }: { closesAt: string }) => {
  const { days, hours, minutes, ended } = useCountdownTo(closesAt);
  if (ended) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/40 bg-red-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-red-200">
        <Timer className="h-3 w-3" />
        Lote encerrado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-primary/90">
      <Timer className="h-3 w-3" />
      Encerra em {days}d {PADDED(hours)}h {PADDED(minutes)}m
    </span>
  );
};

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

const buildReserveMessage = (p: PreOrder, mode: "full" | "deposit") => {
  const valor = mode === "full" ? p.full : p.deposit;
  const modoLabel = mode === "full" ? "Pagamento integral (com desconto)" : "Sinal de reserva (30%)";
  return (
    `Olá! Quero *garantir minha pré-venda* no Galpão 64 🚗\n\n` +
    `*Modelo:* ${p.name}\n` +
    `*Referência:* ${p.ref}\n` +
    `*Lote:* ${LOT_INFO[p.lot]?.code ?? p.lot}\n` +
    `*Previsão de chegada:* ${formatEta(p.eta)}\n` +
    `*Forma escolhida:* ${modoLabel}\n` +
    `*Valor:* ${valor}\n\n` +
    `Pode confirmar minha vaga no lote e me passar os dados para o PIX?`
  );
};

const ProductCard = ({ product }: { product: PreOrder }) => {
  const [mode, setMode] = useState<"full" | "deposit">("full");
  const lotInfo = LOT_INFO[product.lot];

  const handleReserve = () => {
    const msg = buildReserveMessage(product, mode);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07]",
        "bg-[#0d0d0f] shadow-[0_20px_60px_-30px_rgba(0,0,0,1)]",
        "transition-all duration-500 hover:-translate-y-1 hover:border-primary/40",
        "hover:shadow-[0_30px_70px_-25px_hsl(var(--primary)/0.35)]",
      )}
    >
      {/* Badges */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/[0.06] bg-[#111113] px-3 py-2">
        <span className="inline-flex items-center rounded-full border border-primary/50 bg-primary/10 px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-[0.14em] text-primary">
          [ PRÉ-VENDA ]
        </span>
        {lotInfo && (
          <span className="inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-[0.14em] text-gold">
            [ {lotInfo.code} - RESERVA ]
          </span>
        )}
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-primary">
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
        {lotInfo && (
          <div className="absolute bottom-2 left-2 z-10">
            <LotCountdown closesAt={lotInfo.closesAt} />
          </div>
        )}
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

        {/* Caixa informativa da pré-venda */}
        <div className="space-y-1.5 rounded-lg border border-white/[0.07] bg-white/[0.02] p-3 text-[11px] leading-relaxed text-white/70">
          <p>📅 <span className="text-white/90 font-semibold">Data estimada de chegada:</span> {formatEta(product.eta)}</p>
          <p>📦 <span className="text-white/90 font-semibold">Envio do lote:</span> despachado assim que o lote físico der entrada no Galpão 64.</p>
          <p>🛡️ <span className="text-white/90 font-semibold">Garantia de reserva:</span> item 100% garantido com fornecedores oficiais.</p>
        </div>

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

          <button
            type="button"
            onClick={handleReserve}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-full px-4 py-3",
              "bg-gradient-to-r from-primary to-[#ff8a3d] font-mono text-[11px] font-black uppercase tracking-[0.18em] text-black",
              "shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.8)] transition-all duration-300",
              "hover:brightness-110 hover:shadow-[0_14px_40px_-8px_hsl(var(--primary)/1)] active:scale-[0.98]",
            )}
          >
            <PackageCheck className="h-4 w-4" strokeWidth={2.5} />
            [ GARANTIR NA PRÉ-VENDA ]
          </button>
        </div>
      </div>
    </article>
  );
};

const VipWhatsAppBanner = () => {
  const msg = "Olá! Quero entrar na Lista VIP de Lançamentos do Galpão 64 para saber primeiro quando abrirem novos lotes de pré-venda 🚗";
  return (
    <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-white/[0.03] to-[#ff8a3d]/10 p-6 text-center sm:flex-row sm:justify-between sm:text-left md:p-8">
      <div className="flex items-center gap-4">
        <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 sm:flex">
          <MessageCircle className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.14em] text-white">
            Entre no Grupo VIP de Lançamentos
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/60">
            Saiba primeiro quando abrirem novos lotes de pré-venda — vagas costumam esgotar em minutos.
          </p>
        </div>
      </div>
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-black shadow-[0_10px_30px_-10px_rgba(37,211,102,0.7)] transition-all hover:brightness-110 active:scale-[0.98]"
      >
        <MessageCircle className="h-4 w-4" strokeWidth={2.5} />
        Quero entrar na Lista VIP
      </a>
    </div>
  );
};

const CarPedestal = ({
  item, active, onClick,
}: { item: PreOrder; active: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      "group flex flex-col items-center gap-2 rounded-xl p-2 text-left transition-all duration-300",
      active ? "bg-primary/10 ring-1 ring-primary/50" : "hover:bg-white/[0.04]",
    )}
  >
    <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-[#1c1c1f] to-black">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.14) 0%, transparent 60%)" }}
      />
      <img
        src={item.image}
        alt={`${item.brand} ${item.name}`}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
    {/* reflexo (espelhado + esmaecido, sem precisar de recorte/fundo transparente) */}
    <div
      aria-hidden
      className="relative -mt-1 h-5 w-[82%] overflow-hidden opacity-35"
      style={{
        maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)",
        WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)",
      }}
    >
      <img src={item.image} alt="" className="h-full w-full scale-y-[-1] object-cover" />
    </div>
    <p className="text-center text-[9px] font-bold uppercase leading-tight tracking-wide text-white/75">
      {item.ref} <span className="text-white/45">—</span> {item.name}
    </p>
  </button>
);

const BrandShowcasePanel = ({ items }: { items: PreOrder[] }) => {
  const [focusIndex, setFocusIndex] = useState(0);

  useEffect(() => {
    setFocusIndex(0);
  }, [items]);

  if (items.length === 0) return null;
  const focused = items[Math.min(focusIndex, items.length - 1)];

  const handleReserve = () => {
    const msg = buildReserveMessage(focused, "full");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative mt-10 overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)]">
      <img src={garageBg} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-25" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/75 to-black" />

      <div className="relative p-5 sm:p-8 md:p-10">
        {/* Selo flutuante de previsão */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-black/70 px-4 py-2 backdrop-blur-md">
          <CalendarClock className="h-4 w-4 text-primary" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary sm:text-[11px]">
            Previsão: {formatEta(focused.eta)}
          </span>
        </div>

        {/* Pedestais — os 4 modelos da marca selecionada */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-6">
          {items.map((item, i) => (
            <CarPedestal key={item.id} item={item} active={i === focusIndex} onClick={() => setFocusIndex(i)} />
          ))}
        </div>

        {/* Modelo em foco: preço + CTA único */}
        <div className="mt-8 flex flex-col items-center gap-4 border-t border-white/10 pt-6 text-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary/80">{focused.ref}</p>
            <h3 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">{focused.name}</h3>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/45">{focused.brand}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
              [ Integral: {focused.full} (-5% Off) ]
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-white/80">
              [ Sinal Reserva: {focused.deposit} ]
            </span>
          </div>

          <button
            type="button"
            onClick={handleReserve}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5",
              "bg-gradient-to-r from-primary to-[#ff8a3d] font-mono text-[12px] font-black uppercase tracking-[0.18em] text-black",
              "shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.8)] transition-all duration-300",
              "hover:brightness-110 hover:shadow-[0_14px_40px_-8px_hsl(var(--primary)/1)] active:scale-[0.98]",
            )}
          >
            <PackageCheck className="h-4 w-4" strokeWidth={2.5} />
            [ RESERVAR PARA MINHA GARAGEM ]
          </button>
        </div>
      </div>
    </div>
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
        <div className="container relative py-14 text-center md:py-20">
          <img
            src={galpaoLogo}
            alt="Galpão 64 — A Arte do Diecast"
            className="mx-auto h-16 w-auto sm:h-20"
          />
          <h1 className="mx-auto mt-6 max-w-4xl text-3xl font-black uppercase leading-[1.05] tracking-tight md:text-5xl">
            Lote de reservas globais —{" "}
            <span className="bg-gradient-to-r from-primary via-[#ff8a3d] to-gold bg-clip-text text-transparent">
              garanta o inatingível
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
            Reserve os próximos lançamentos mundiais das melhores marcas antes de esgotarem.
          </p>

          {/* Brand plates */}
          <div className="mt-8 -mx-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
            <div className="flex min-w-max items-center justify-center gap-2.5 md:mx-auto">
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

          {/* Vitrine em destaque — 4 modelos da marca selecionada, no estilo "garagem" */}
          <div key={brand} className="text-left">
            <BrandShowcasePanel items={filtered.slice(0, 4)} />
          </div>

          {/* Perks */}
          <div className="mt-10 grid gap-3 text-left sm:grid-cols-3">
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

        <VipWhatsAppBanner />
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
              Instagram ou pelo WhatsApp.
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

      {/* FAQ */}
      <section className="border-t border-white/[0.06] bg-[#0b0b0d] py-14 md:py-20">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
              <ShieldQuestion className="h-3.5 w-3.5" />
              Dúvidas frequentes
            </p>
            <h2 className="mt-2 text-xl font-black uppercase tracking-[0.14em] text-white md:text-2xl">
              Tudo sobre a sua pré-venda
            </h2>
          </div>

          <Accordion type="single" collapsible className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 md:px-6">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`} className="border-white/[0.07]">
                <AccordionTrigger className="text-left text-sm font-bold text-white hover:no-underline md:text-base">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-[13px] leading-relaxed text-white/65 md:text-sm">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <p className="text-[12px] leading-relaxed text-white/60">
                Prazos de chegada são estimativas fornecidas pelos fabricantes e podem variar por conta de logística internacional.
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              <PackageSearch className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <p className="text-[12px] leading-relaxed text-white/60">
                Ainda com dúvidas? Fale direto com a equipe pelo WhatsApp ou Instagram antes de reservar.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PreVendas;
