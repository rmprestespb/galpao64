import {
  ShieldCheck,
  Warehouse,
  Radar,
  CircleDot,
  Cog,
  Truck,
  Play,
  Instagram,
  Loader2,
} from "lucide-react";
import Header from "@/components/Header";
import BrandGrid from "@/components/preVendas/BrandGrid";
import VipWhatsAppBanner from "@/components/preVendas/VipWhatsAppBanner";
import FaqSection from "@/components/preVendas/FaqSection";
import { INSTAGRAM } from "@/data/preVendas";
import { useBrands } from "@/hooks/useBrands";

import garageBg from "@/assets/luxury-garage-bg.jpg";
import cineFrame from "@/assets/diecast-destaque.jpg";
import galpaoLogo from "@/assets/galpao64-logo.png";

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

const PreVendas = () => {
  const { brands, loading, error } = useBrands();

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
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black uppercase leading-[1.05] tracking-tight md:text-6xl">
            Pré Vendas
            <span className="bg-gradient-to-r from-primary via-[#ff8a3d] to-gold bg-clip-text text-transparent">:</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
            Escolha a marca e reserve os próximos lançamentos mundiais antes de esgotarem.
          </p>

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

      {/* PORTAL DE MARCAS — cada card representa uma marca; produtos ficam
          só dentro da página de cada marca (/pre-vendas/:slug). */}
      <section className="container py-12 md:py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-xl font-black uppercase tracking-[0.14em] text-white md:text-2xl">
            Escolha a marca
          </h2>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
            {brands.length} marca{brands.length === 1 ? "" : "s"} em pré-venda
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <p className="py-16 text-center text-sm text-white/50">
            Não foi possível carregar as marcas agora. Tenta recarregar a página.
          </p>
        ) : brands.length === 0 ? (
          <p className="py-16 text-center text-sm text-white/50">
            Nenhuma marca cadastrada no momento — volte em breve.
          </p>
        ) : (
          <div className="animate-premium-fade-in">
            <BrandGrid brands={brands} />
          </div>
        )}

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

      <FaqSection />
    </div>
  );
};

export default PreVendas;
