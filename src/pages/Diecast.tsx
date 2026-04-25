import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Crosshair,
  Flag,
  MapPin,
  Radio,
  ScanLine,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import LaserScan from "@/components/diecast/LaserScan";
import XRayMagnifier from "@/components/diecast/XRayMagnifier";
import galpaoLogo from "@/assets/galpao64-logo.png";
import monsterHero from "@/assets/diecast-monster-hero.jpg";
import salao from "@/assets/diecast-salao.jpg";
import trocas from "@/assets/diecast-trocas.jpg";
import destaque from "@/assets/diecast-destaque.jpg";
import legends from "@/assets/diecast-legends.jpg";

// Monster Trucks Live Curitiba — agosto 2026
const TARGET_DATE = new Date("2026-08-15T20:00:00-03:00");

interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const computeCountdown = (): CountdownParts => {
  const ms = Math.max(0, TARGET_DATE.getTime() - Date.now());
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return { days, hours, minutes, seconds };
};

const useCountdown = (): CountdownParts => {
  const [parts, setParts] = useState<CountdownParts>(() => computeCountdown());
  useEffect(() => {
    const id = setInterval(() => setParts(computeCountdown()), 1000);
    return () => clearInterval(id);
  }, []);
  return parts;
};

const events = [
  {
    code: "EVT_05_2026",
    when: "MAIO / 2026",
    title: "Hot Wheels Legends Tour — Inscrições Brasil",
    detail:
      "Abertura oficial das inscrições para a etapa brasileira. O Galpão 64 vai mapear cada finalista nacional.",
    location: "ONLINE · BR",
    icon: Trophy,
    status: "PRIORITY: HIGH",
  },
  {
    code: "EVT_08_2026",
    when: "AGOSTO / 2026",
    title: "Monster Trucks Live — Curitiba",
    detail:
      "Pedreira Paulo Leminski recebe a maior arena de Monster Trucks do país. Cobertura completa do Galpão 64.",
    location: "PEDREIRA PAULO LEMINSKI · CWB",
    icon: Flag,
    status: "PRIORITY: CRITICAL",
  },
] as const;

const gallery = [
  {
    src: salao,
    code: "GAL_001",
    title: "Salão Diecast — São Paulo",
    caption:
      "Expositores e designers internacionais. Dioramas premiados em vitrines blindadas.",
  },
  {
    src: trocas,
    code: "GAL_002",
    title: "Coração das Trocas",
    caption:
      "Mesas repletas de raridades. STHs, Redlines e Premiums circulando entre colecionadores BR.",
  },
  {
    src: legends,
    code: "GAL_003",
    title: "Legends Tour — Etapa Brasil",
    caption:
      "Customs nacionais disputando vaga para virar miniatura oficial Hot Wheels global.",
  },
];

const PADDED = (n: number, len = 2) => String(n).padStart(len, "0");

const Diecast = () => {
  const cd = useCountdown();
  const dayDigits = useMemo(() => PADDED(cd.days, 3).split(""), [cd.days]);

  return (
    <div className="diecast-scope min-h-screen di-carbon">
      {/* ============ HEADER / TERMINAL BAR ============ */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0a0a0a]/85 border-b border-[color:var(--di-line)]">
        <div className="container flex h-14 items-center justify-between gap-4">
          <Link to="/" className="di-click flex items-center gap-3 group">
            <img src={galpaoLogo} alt="Galpão 64" className="h-8 w-auto" />
            <span className="hidden sm:inline font-mono-tech text-[10px] uppercase tracking-[0.3em] text-[color:var(--di-neon)]/80 group-hover:text-[color:var(--di-neon)]">
              SYS://G64_DIECAST.MODULE
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline-flex items-center gap-2 font-mono-tech text-[10px] uppercase tracking-[0.25em] text-[color:var(--di-text-dim)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--di-neon)] di-blink" />
              ONLINE · SECURED
            </span>
            <Link
              to="/"
              className="di-click inline-flex items-center gap-2 font-mono-tech text-[10px] uppercase tracking-[0.3em] text-[color:var(--di-text)] hover:text-[color:var(--di-neon)] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              [EXIT_MODULE]
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ============ 1. HERO / CABEÇALHO DINÂMICO ============ */}
        <section className="relative overflow-hidden border-b border-[color:var(--di-line)] di-scanlines">
          <div className="absolute inset-0 di-grid opacity-40" />
          <div className="container relative grid lg:grid-cols-12 gap-8 py-16 md:py-24">
            {/* Left: copy */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <p className="font-mono-tech inline-flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-[0.35em] text-[color:var(--di-neon)] mb-5">
                <Radio className="h-3.5 w-3.5" />
                [DIECAST_LIVE] · 2026
              </p>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[0.95] tracking-tight mb-6 uppercase">
                A escala muda.
                <br />
                A <span className="di-neon-text">paixão</span>
                <br />é a mesma.
              </h1>
              <p className="font-mono-tech text-sm md:text-base text-[color:var(--di-text-dim)] max-w-md leading-relaxed">
                {"> "}O <span className="text-[color:var(--di-text)]">Galpão 64</span> no
                coração dos maiores eventos diecast do Brasil — do rugido dos motores reais ao
                detalhe milimétrico do 1:64.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <a
                  href="#radar"
                  className="di-click di-neon-border bg-[color:var(--di-neon)] text-black px-5 py-3 font-mono-tech text-[11px] uppercase tracking-[0.25em] font-bold hover:brightness-110 transition"
                  style={{ boxShadow: "var(--di-neon-glow)" }}
                >
                  [INICIAR_VARREDURA]
                </a>
                <a
                  href="#acervo"
                  className="di-click border border-[color:var(--di-line-strong)] px-5 py-3 font-mono-tech text-[11px] uppercase tracking-[0.25em] text-[color:var(--di-neon)] hover:bg-[color:var(--di-neon)]/10 transition"
                >
                  [ACESSAR_GARAGEM]
                </a>
              </div>
            </div>

            {/* Right: split-frame with laser scan */}
            <div className="lg:col-span-7 relative">
              <div className="relative di-panel di-brackets aspect-[16/10] overflow-hidden">
                <LaserScan
                  src={monsterHero}
                  alt="Monster Truck real e versão Hot Wheels 1:64 lado a lado"
                  className="absolute inset-0"
                />
                {/* HUD overlays */}
                <div className="pointer-events-none absolute top-3 left-3 right-3 flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-[0.25em] text-[color:var(--di-neon)]">
                  <span className="flex items-center gap-1.5">
                    <ScanLine className="h-3 w-3" />
                    SCAN_MODE: ACTIVE
                  </span>
                  <span className="flex items-center gap-1.5">
                    REAL ⟷ 1:64
                    <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--di-neon)] di-blink" />
                  </span>
                </div>
                <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-[0.25em] text-[color:var(--di-text-dim)]">
                  <span>SUBJECT: MONSTER_TRUCK</span>
                  <span>FIDELITY: 99.7%</span>
                </div>
              </div>
              {/* Telemetry strip */}
              <div className="mt-3 grid grid-cols-3 gap-2 font-mono-tech text-[10px] uppercase tracking-[0.2em]">
                {[
                  ["LAT", "-25.4284"],
                  ["LON", "-49.2733"],
                  ["TIME", new Date().toISOString().slice(11, 19)],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="border border-[color:var(--di-line)] bg-black/40 px-3 py-2 flex items-center justify-between"
                  >
                    <span className="text-[color:var(--di-text-dim)]">{k}</span>
                    <span className="text-[color:var(--di-neon)]">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ 2. RADAR DIECAST BRASIL ============ */}
        <section id="radar" className="relative border-b border-[color:var(--di-line)] py-20 md:py-28">
          <div className="container">
            <div className="mb-12 max-w-2xl">
              <p className="font-mono-tech inline-flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-[0.3em] text-[color:var(--di-neon)] mb-3">
                <CalendarDays className="h-3.5 w-3.5" />
                [RADAR_DIECAST_BRASIL // INTEL_FEED]
              </p>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold leading-[1.05] mb-3 uppercase">
                Monitoramento de inteligência.
              </h2>
              <p className="font-mono-tech text-sm md:text-base text-[color:var(--di-text-dim)]">
                {"> "}Próximos sinais captados em território nacional.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
              {/* Event list — terminal feed */}
              <ul className="space-y-4">
                {events.map((e) => {
                  const Icon = e.icon;
                  return (
                    <li
                      key={e.code}
                      className="di-panel di-brackets group p-5 md:p-6 transition-all hover:border-[color:var(--di-neon)]/60 hover:shadow-[0_0_30px_-8px_rgba(255,215,0,0.4)]"
                    >
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 border border-[color:var(--di-line-strong)] bg-black/60 p-3">
                          <Icon className="h-5 w-5 text-[color:var(--di-neon)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 font-mono-tech text-[10px] uppercase tracking-[0.25em]">
                            <span className="text-[color:var(--di-neon)]">{e.code}</span>
                            <span className="text-[color:var(--di-text-dim)]">|</span>
                            <span className="text-[color:var(--di-text)]">{e.when}</span>
                            <span className="text-[color:var(--di-text-dim)]">|</span>
                            <span className="text-[color:var(--di-neon)]/80 flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--di-neon)] di-blink" />
                              {e.status}
                            </span>
                          </div>
                          <h3 className="font-display text-lg md:text-xl font-bold leading-tight uppercase mb-1.5">
                            {e.title}
                          </h3>
                          <p className="font-mono-tech text-xs md:text-sm text-[color:var(--di-text-dim)] leading-relaxed mb-2">
                            {e.detail}
                          </p>
                          <p className="font-mono-tech inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[color:var(--di-neon)]/80">
                            <MapPin className="h-3 w-3" />
                            {e.location}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Countdown widget */}
              <div className="di-panel di-brackets relative overflow-hidden p-6 md:p-7">
                <div
                  className="absolute -top-24 -right-24 h-56 w-56 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(255,215,0,0.18), transparent 70%)" }}
                />
                <p className="font-mono-tech inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[color:var(--di-neon)] mb-3">
                  <Flag className="h-3.5 w-3.5" />
                  [COUNTDOWN_LOCK_ON]
                </p>
                <h3 className="font-display text-lg md:text-xl font-bold leading-tight uppercase mb-1">
                  Monster Trucks Live
                </h3>
                <p className="font-mono-tech text-[11px] uppercase tracking-[0.2em] text-[color:var(--di-text-dim)] mb-5">
                  CURITIBA · AGO/2026
                </p>

                {/* Days big counter */}
                <div className="flex items-end gap-1.5 mb-4">
                  {dayDigits.map((d, i) => (
                    <div
                      key={i}
                      className="relative h-16 w-12 md:h-20 md:w-16 flex items-center justify-center border border-[color:var(--di-neon)]/50 bg-black/70 font-display text-3xl md:text-4xl font-extrabold di-neon-text"
                      style={{ boxShadow: "inset 0 0 18px rgba(255,215,0,0.12)" }}
                    >
                      {d}
                    </div>
                  ))}
                  <span className="ml-2 mb-1 font-mono-tech text-[10px] uppercase tracking-[0.3em] text-[color:var(--di-text-dim)]">
                    DIAS
                  </span>
                </div>

                {/* HMS row */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    ["HRS", PADDED(cd.hours)],
                    ["MIN", PADDED(cd.minutes)],
                    ["SEC", PADDED(cd.seconds)],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="border border-[color:var(--di-line)] bg-black/50 py-2 text-center"
                    >
                      <div className="font-display text-xl font-bold di-neon-text">{v}</div>
                      <div className="font-mono-tech text-[9px] uppercase tracking-[0.25em] text-[color:var(--di-text-dim)]">
                        {k}
                      </div>
                    </div>
                  ))}
                </div>

                <p className="font-mono-tech text-[11px] text-[color:var(--di-text-dim)] leading-relaxed">
                  {"> "}LOCAL: PEDREIRA PAULO LEMINSKI
                  <br />
                  {"> "}CURADORIA: G64_MONSTER_DROP
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ 3. CORAÇÃO DAS TROCAS / GALERIA ============ */}
        <section className="relative border-b border-[color:var(--di-line)] py-20 md:py-28">
          <div className="container">
            <div className="mb-12 max-w-2xl">
              <p className="font-mono-tech inline-flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-[0.3em] text-[color:var(--di-neon)] mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                [CORAÇÃO_DAS_TROCAS // ARCHIVE]
              </p>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold leading-[1.05] mb-3 uppercase">
                Eventos que moldam a cultura.
              </h2>
              <p className="font-mono-tech text-sm md:text-base text-[color:var(--di-text-dim)]">
                {"> "}Mesas, expositores e designers — a engrenagem viva do diecast brasileiro.
              </p>
            </div>

            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-4">
                {gallery.map((g) => (
                  <CarouselItem key={g.code} className="pl-4 md:basis-2/3 lg:basis-1/2">
                    <figure className="di-panel di-brackets">
                      {/* Terminal frame header */}
                      <div className="flex items-center justify-between border-b border-[color:var(--di-line)] bg-black/60 px-3 py-1.5 font-mono-tech text-[10px] uppercase tracking-[0.25em]">
                        <span className="flex items-center gap-2 text-[color:var(--di-neon)]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--di-neon)] di-blink" />
                          {g.code}
                        </span>
                        <span className="text-[color:var(--di-text-dim)]">VISUAL_FEED.LIVE</span>
                      </div>
                      <div className="aspect-[4/3] overflow-hidden bg-black">
                        <img
                          src={g.src}
                          alt={g.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                      </div>
                      <figcaption className="border-t border-[color:var(--di-line)] p-4 md:p-5 bg-black/40">
                        <p className="font-mono-tech text-[10px] uppercase tracking-[0.25em] text-[color:var(--di-neon)] mb-1.5">
                          {g.title}
                        </p>
                        <p className="font-mono-tech text-xs md:text-sm text-[color:var(--di-text-dim)] leading-snug">
                          {g.caption}
                        </p>
                      </figcaption>
                    </figure>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-4 border-[color:var(--di-line-strong)] bg-black/80 text-[color:var(--di-neon)] hover:bg-[color:var(--di-neon)] hover:text-black" />
              <CarouselNext className="hidden md:flex -right-4 border-[color:var(--di-line-strong)] bg-black/80 text-[color:var(--di-neon)] hover:bg-[color:var(--di-neon)] hover:text-black" />
            </Carousel>
          </div>
        </section>

        {/* ============ 4. X-RAY VIEW / ACERVO ============ */}
        <section id="acervo" className="relative py-20 md:py-28">
          <div className="container">
            <div className="mb-10 max-w-2xl">
              <p className="font-mono-tech inline-flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-[0.3em] text-[color:var(--di-neon)] mb-3">
                <Crosshair className="h-3.5 w-3.5" />
                [X_RAY_VIEW // PRECISION_SCAN]
              </p>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold leading-[1.05] mb-3 uppercase">
                Mira de precisão.
              </h2>
              <p className="font-mono-tech text-sm md:text-base text-[color:var(--di-text-dim)]">
                {"> "}Passe o cursor sobre as peças do acervo. Cada item é autenticado pelo
                sistema G64_SCAN_PRO.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {[
                {
                  src: destaque,
                  code: "ITM_001",
                  badge: "DESTAQUE_DO_MES",
                  title: "Inspirada num vencedor do Legends Tour",
                  text:
                    "Esta peça foi inspirada no vencedor do Legends Tour. Uma das mais desejadas por colecionadores que buscam fidelidade extrema — proporções, paleta de pintura e até as rodas reproduzidas em escala 1:64.",
                },
                {
                  src: legends,
                  code: "ITM_002",
                  badge: "VISTO_NO_SALAO",
                  title: "Acabamento Premium · Salão Diecast SP",
                  text:
                    "Modelo exclusivo com acabamento Premium, destaque na última edição do Salão Diecast em São Paulo. Spectraflame, Real Riders e tampografia detalhada.",
                },
              ].map((item) => (
                <article key={item.code} className="di-panel di-brackets">
                  <div className="flex items-center justify-between border-b border-[color:var(--di-line)] bg-black/60 px-3 py-1.5 font-mono-tech text-[10px] uppercase tracking-[0.25em]">
                    <span className="flex items-center gap-2 text-[color:var(--di-neon)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--di-neon)] di-blink" />
                      {item.code} · {item.badge}
                    </span>
                    <span className="text-[color:var(--di-text-dim)]">G64_SCAN_PRO</span>
                  </div>
                  <XRayMagnifier
                    src={item.src}
                    alt={item.title}
                    className="aspect-[4/3] bg-black"
                  />
                  <div className="border-t border-[color:var(--di-line)] p-5 md:p-6 bg-black/40">
                    <h3 className="font-display text-lg md:text-xl font-bold leading-tight uppercase mb-2">
                      {item.title}
                    </h3>
                    <p className="font-mono-tech text-xs md:text-sm text-[color:var(--di-text-dim)] leading-relaxed">
                      {"> "}
                      {item.text}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-14 flex flex-col items-center gap-4 text-center">
              <p className="font-mono-tech text-[11px] uppercase tracking-[0.3em] text-[color:var(--di-text-dim)]">
                {"> "}TRANSFERIR PARA MÓDULO DE VENDAS
              </p>
              <Link
                to="/album"
                className="di-click di-neon-border bg-[color:var(--di-neon)] text-black px-8 py-4 font-mono-tech text-xs uppercase tracking-[0.3em] font-bold hover:brightness-110 inline-flex items-center gap-3 transition"
                style={{ boxShadow: "var(--di-neon-glow)" }}
              >
                <Zap className="h-4 w-4" />
                [ACESSAR_GARAGEM]
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer terminal */}
        <footer className="border-t border-[color:var(--di-line)] bg-black/60">
          <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-3 font-mono-tech text-[10px] uppercase tracking-[0.25em] text-[color:var(--di-text-dim)]">
            <span>{"> "}G64_DIECAST.MODULE · v2.6.2026</span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--di-neon)] di-blink" />
              SECURE_LINK · AUTHENTIC_ITEMS_ONLY
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Diecast;