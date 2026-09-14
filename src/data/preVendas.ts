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

import brandMiniGt from "@/assets/brand-mini-gt.webp";
import brandPopRace from "@/assets/brand-pop-race.webp";
import brandTarmacWorks from "@/assets/brand-tarmac-works.webp";
import brandKaidoHouse from "@/assets/brand-kaido-house.webp";

export const INSTAGRAM = "https://www.instagram.com/galpao64diecast/";
// Mesmo número usado nos outros pontos de contato do site (ProductGarageCard, botão flutuante do Index).
// Troque aqui caso queira usar um link de Grupo/Lista de transmissão do WhatsApp dedicado à Lista VIP.
export const WHATSAPP_NUMBER = "5546999350070";

export const BRANDS = ["Todas as Marcas", "Mini GT", "Pop Race", "Tarmac Works", "Kaido House"] as const;
export type Brand = (typeof BRANDS)[number];
export type SingleBrand = Exclude<Brand, "Todas as Marcas">;

export type PreOrder = {
  id: string;
  brand: SingleBrand;
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

// Slug de URL para cada marca (usado na rota /pre-vendas/:marca) e o mapa inverso.
export const BRAND_SLUGS: Record<SingleBrand, string> = {
  "Mini GT": "mini-gt",
  "Pop Race": "pop-race",
  "Tarmac Works": "tarmac-works",
  "Kaido House": "kaido-house",
};

export const SLUG_TO_BRAND: Record<string, SingleBrand> = Object.fromEntries(
  (Object.entries(BRAND_SLUGS) as [SingleBrand, string][]).map(([brand, slug]) => [slug, brand]),
) as Record<string, SingleBrand>;

// Arte de destaque de cada marca no showroom (/pre-vendas) — recorte real do miniatura,
// usado só como vitrine visual da marca; os preços e specs reais ficam nos PRODUCTS abaixo.
export const BRAND_SHOWCASE: Record<SingleBrand, { image: string; caption: string }> = {
  "Mini GT": { image: brandMiniGt, caption: "Toyota Supra — Edição Fast & Furious" },
  "Pop Race": { image: brandPopRace, caption: "Honda Civic Type R — Edição EVA" },
  "Tarmac Works": { image: brandTarmacWorks, caption: "Porsche 911 GT3 R — Falken Motorsports" },
  "Kaido House": { image: brandKaidoHouse, caption: "Chevrolet C10 — HKS x Yokohama" },
};

// Metadados de cada lote de pré-venda: código de exibição e data/hora de encerramento das reservas.
// Ajuste "closesAt" sempre que abrir ou prorrogar um lote.
export const LOT_INFO: Record<string, { code: string; closesAt: string }> = {
  "LOTE Q4 2026": { code: "LOTE 01", closesAt: "2026-10-31T23:59:59-03:00" },
  "LOTE Q1 2027": { code: "LOTE 02", closesAt: "2027-01-31T23:59:59-03:00" },
  "LOTE Q2 2027": { code: "LOTE 03", closesAt: "2027-04-30T23:59:59-03:00" },
};

const MONTHS: Record<string, string> = {
  JAN: "Janeiro", FEV: "Fevereiro", MAR: "Março", ABR: "Abril", MAI: "Maio", JUN: "Junho",
  JUL: "Julho", AGO: "Agosto", SET: "Setembro", OUT: "Outubro", NOV: "Novembro", DEZ: "Dezembro",
};

export const formatEta = (code: string) => {
  const [m, y] = code.split("-");
  return `${MONTHS[m] ?? m}/${y}`;
};

export const PRODUCTS: PreOrder[] = [
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

export const buildReserveMessage = (p: PreOrder, mode: "full" | "deposit") => {
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

export const openReserveWhatsApp = (p: PreOrder, mode: "full" | "deposit") => {
  const msg = buildReserveMessage(p, mode);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
};
