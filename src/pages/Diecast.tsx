import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Flag,
  MapPin,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import galpaoLogo from "@/assets/galpao64-logo.png";
import monsterHero from "@/assets/diecast-monster-hero.jpg";
import salao from "@/assets/diecast-salao.jpg";
import trocas from "@/assets/diecast-trocas.jpg";
import destaque from "@/assets/diecast-destaque.jpg";
import legends from "@/assets/diecast-legends.jpg";

// Curitiba Monster Trucks Live — agosto 2026 (target: 15/08/2026)
const TARGET_DATE = new Date("2026-08-15T20:00:00-03:00");

const useCountdown = () => {
  const [days, setDays] = useState(() =>
    Math.max(0, Math.ceil((TARGET_DATE.getTime() - Date.now()) / 86400000)),
  );
  useEffect(() => {
    const id = setInterval(() => {
      setDays(Math.max(0, Math.ceil((TARGET_DATE.getTime() - Date.now()) / 86400000)));
    }, 60_000);
    return () => clearInterval(id);
  }, []);
  return days;
};

const events = [
  {
    when: "MAIO / 2026",
    title: "Hot Wheels Legends Tour Brasil",
    detail:
      "Abertura das inscrições para a etapa brasileira. Prepare seu custom — o Galpão 64 estará acompanhando cada finalista de perto.",
    icon: Trophy,
    accent: "text-accent",
  },
  {
    when: "AGOSTO / 2026",
    title: "Monster Trucks Live — Curitiba",
    detail: "Pedreira Paulo Leminski. A adrenalina dos motores em tamanho real, bem perto de casa.",
    icon: Flag,
    accent: "text-primary",
  },
  {
    when: "OUTUBRO / 2026",
    title: "Salão Diecast — São Paulo",
    detail:
      "Maior encontro de colecionadores 1:64 do Brasil. Dioramas premiados, designers convidados e mesa de trocas histórica.",
    icon: Sparkles,
    accent: "text-accent",
  },
];

const gallery = [
  {
    src: salao,
    title: "Salão Diecast — São Paulo",
    caption:
      "Dioramas premiados, expositores lotados e designers internacionais (como Jun Imai) autografando minis raras.",
  },
  {
    src: trocas,
    title: "Coração das Trocas",
    caption:
      "Mesas repletas de raridades — STHs, Redlines e Premiums passando de mão em mão entre colecionadores brasileiros.",
  },
  {
    src: legends,
    title: "Legends Tour — Etapa Brasil",
    caption:
      "Customs nacionais disputando uma vaga para virar miniatura oficial Hot Wheels distribuída no mundo todo.",
  },
];

const Diecast = () => {
  const days = useCountdown();
  const counterDigits = useMemo(() => String(days).padStart(3, "0").split(""), [days]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src={galpaoLogo}
              alt="Galpão 64"
              className="h-9 w-auto transition-transform group-hover:scale-105"
            />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-foreground/80 hover:text-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            VOLTAR
          </Link>
        </div>
      </header>

      <main>
        {/* 1. CABEÇALHO DINÂMICO */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0">
            <img
              src={monsterHero}
              alt="Monster Truck real e versão Hot Wheels 1:64 lado a lado"
              className="h-full w-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
          </div>

          <div className="relative container py-20 md:py-32">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold tracking-[0.35em] text-accent uppercase mb-5">
                <Zap className="h-3.5 w-3.5" />
                Diecast Live · Edição 2026
              </p>
              <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[0.95] tracking-tight mb-6">
                A escala muda.
                <br />
                A <span className="text-primary">paixão</span> é a mesma.
              </h1>
              <p className="text-base md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                O <span className="text-foreground font-semibold">Galpão 64</span> no coração dos
                maiores eventos diecast do Brasil — do rugido dos motores reais ao detalhe
                milimétrico do 1:64.
              </p>
            </div>
          </div>
          {/* bottom fade for seamless next section */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </section>

        {/* 2. RADAR DIECAST BRASIL */}
        <section className="container py-20 md:py-28">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-bold tracking-[0.3em] text-accent uppercase mb-3 inline-flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5" />
              Radar Diecast Brasil
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold leading-[1.05] mb-3">
              O hub de tudo que acontece no país.
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Acompanhamos cada lançamento, cada encontro e cada etapa para que sua coleção
              esteja sempre um passo à frente.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            {/* Agenda */}
            <ul className="space-y-4">
              {events.map((e) => {
                const Icon = e.icon;
                return (
                  <li
                    key={e.title}
                    className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/60 p-5 md:p-6 backdrop-blur-sm transition-all hover:border-accent/60 hover:shadow-[0_8px_30px_-10px_hsl(var(--accent)/0.45)]"
                  >
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-accent via-primary to-accent opacity-70 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 rounded-lg border border-border/60 bg-background/60 p-3">
                        <Icon className={`h-5 w-5 ${e.accent}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-[10px] md:text-xs font-bold tracking-[0.3em] ${e.accent} uppercase mb-1`}>
                          {e.when}
                        </p>
                        <h3 className="font-display text-lg md:text-xl font-bold leading-tight mb-1">
                          {e.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {e.detail}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Countdown Widget */}
            <div className="relative overflow-hidden rounded-xl border border-accent/30 bg-gradient-to-br from-card via-card to-background p-6 md:p-8">
              <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
              <div className="relative">
                <p className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-accent uppercase mb-3 inline-flex items-center gap-2">
                  <Flag className="h-3.5 w-3.5" />
                  Contador Regressivo
                </p>
                <h3 className="font-display text-xl md:text-2xl font-bold leading-tight mb-6">
                  Faltam para o rugido dos motores em Curitiba
                </h3>
                <div className="flex items-end gap-2 mb-4">
                  {counterDigits.map((d, i) => (
                    <div
                      key={i}
                      className="flex h-20 w-16 md:h-24 md:w-20 items-center justify-center rounded-lg border border-border/60 bg-background/80 font-display text-4xl md:text-5xl font-extrabold text-primary shadow-inner shadow-black/40"
                    >
                      {d}
                    </div>
                  ))}
                  <span className="ml-2 mb-2 text-xs font-bold tracking-[0.25em] text-muted-foreground uppercase">
                    dias
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  O Galpão 64 estará presente na{" "}
                  <span className="text-foreground font-semibold">Pedreira Paulo Leminski</span>,
                  Curitiba/PR, com curadoria exclusiva de miniaturas Monster Trucks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. MEMÓRIA DE ELITE */}
        <section className="relative border-y border-border/40 bg-gradient-to-b from-black via-[hsl(0_0%_5%)] to-black py-20 md:py-28">
          <div className="container">
            <div className="mb-12 max-w-2xl">
              <p className="text-xs font-bold tracking-[0.3em] text-primary uppercase mb-3 inline-flex items-center gap-2">
                <Users className="h-3.5 w-3.5" />
                Memória de Elite
              </p>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold leading-[1.05] mb-3">
                Eventos que moldam a cultura.
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Não é apenas venda — é cultura. Participamos ativamente dos maiores clubes de
                trocas do Brasil para trazer o melhor do mundo diecast para o nosso acervo.
              </p>
            </div>

            <Carousel
              opts={{ align: "start", loop: true }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {gallery.map((g) => (
                  <CarouselItem
                    key={g.title}
                    className="pl-4 md:basis-2/3 lg:basis-1/2"
                  >
                    <figure className="group relative overflow-hidden rounded-xl border border-border/60 bg-card">
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={g.src}
                          alt={g.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <figcaption className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/40 to-transparent p-5 md:p-6">
                        <p className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-accent uppercase mb-1.5">
                          {g.title}
                        </p>
                        <p className="text-sm md:text-base text-foreground/95 leading-snug max-w-md">
                          {g.caption}
                        </p>
                      </figcaption>
                    </figure>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-4 bg-background/80 border-border/60 hover:bg-accent hover:text-accent-foreground" />
              <CarouselNext className="hidden md:flex -right-4 bg-background/80 border-border/60 hover:bg-accent hover:text-accent-foreground" />
            </Carousel>
          </div>
        </section>

        {/* 4. CONEXÃO COM O ACERVO */}
        <section className="container py-20 md:py-28">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-bold tracking-[0.3em] text-accent uppercase mb-3 inline-flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              Conexão com o Acervo
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold leading-[1.05] mb-3">
              Cada peça da Garagem tem história.
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              As miniaturas que passam pelo Galpão 64 carregam o DNA dos eventos onde foram
              celebradas. É curadoria, não acaso.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Destaque do Mês */}
            <article className="group relative overflow-hidden rounded-xl border border-border/60 bg-card">
              <div className="aspect-[4/3] overflow-hidden bg-black">
                <img
                  src={destaque}
                  alt="Miniatura destaque inspirada no vencedor do Hot Wheels Legends Tour"
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <Badge className="bg-primary/15 text-primary border border-primary/40 hover:bg-primary/20 mb-3">
                  <Trophy className="mr-1.5 h-3 w-3" />
                  Destaque do Mês
                </Badge>
                <h3 className="font-display text-xl md:text-2xl font-bold leading-tight mb-3">
                  Inspirada num vencedor do Legends Tour.
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Esta peça foi inspirada no vencedor do{" "}
                  <span className="text-foreground font-semibold">Legends Tour</span> e é uma das
                  mais desejadas por colecionadores que buscam fidelidade extrema ao custom
                  original — proporções, paleta de pintura e até as rodas reproduzidas em escala 1:64.
                </p>
              </div>
            </article>

            {/* Visto no Salão */}
            <article className="group relative overflow-hidden rounded-xl border border-border/60 bg-card">
              <div className="aspect-[4/3] overflow-hidden bg-black">
                <img
                  src={legends}
                  alt="Modelo Premium destaque na última edição do Salão Diecast em São Paulo"
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <Badge className="bg-accent/15 text-accent border border-accent/40 hover:bg-accent/20 mb-3">
                  <MapPin className="mr-1.5 h-3 w-3" />
                  Visto no Salão
                </Badge>
                <h3 className="font-display text-xl md:text-2xl font-bold leading-tight mb-3">
                  Acabamento Premium, presença no Salão.
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Modelo exclusivo com acabamento{" "}
                  <span className="text-foreground font-semibold">Premium</span>, destaque na
                  última edição do <span className="text-foreground font-semibold">Salão
                  Diecast em São Paulo</span>. Pintura Spectraflame, Real Riders e tampografia
                  detalhada — uma peça que só faz sentido na mão de quem entende o jogo.
                </p>
              </div>
            </article>
          </div>

          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
            <Link
              to="/album"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-7 py-3.5 text-xs font-bold tracking-[0.25em] text-primary-foreground uppercase shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.6)] transition-all hover:bg-primary/95 hover:shadow-[0_12px_40px_-8px_hsl(var(--primary)/0.8)] active:scale-[0.98]"
            >
              Ver a Garagem dos Colecionadores
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Diecast;
