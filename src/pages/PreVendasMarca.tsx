import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarClock, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import ProductCard from "@/components/preVendas/ProductCard";
import VipWhatsAppBanner from "@/components/preVendas/VipWhatsAppBanner";
import FaqSection from "@/components/preVendas/FaqSection";
import { SLUG_TO_BRAND, formatEta, getAvailabilityStatus, type AvailabilityStatus } from "@/data/preVendas";
import { usePresaleProducts } from "@/hooks/usePresaleProducts";
import { useBrands } from "@/hooks/useBrands";
import { cn } from "@/lib/utils";

/** Filtro de disponibilidade da grade de produtos — "Todas" mostra tudo,
 * as outras opções batem com o status calculado em getAvailabilityStatus. */
const AVAILABILITY_FILTERS: { key: "todas" | AvailabilityStatus; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "aberta", label: "Reserva aberta" },
  { key: "fechando", label: "Fechando em breve" },
  { key: "encerrada", label: "Encerradas" },
];

import galpaoLogo from "@/assets/galpao64-logo.png";
import heroMiniGt from "@/assets/prevendas-hero-mini-gt.jpg";
import heroPopRace from "@/assets/prevendas-hero-pop-race.jpg";
import heroTarmacWorks from "@/assets/prevendas-hero-tarmac-works.jpg";
import heroKaidoHouse from "@/assets/prevendas-hero-kaido-house.jpg";

/** Mesmo fallback de foto de pedestal usado nos cards de /pre-vendas (BrandGrid),
 * usado aqui enquanto a marca não tem `card_image_url` cadastrado no banco. */
const FALLBACK_HERO_IMAGE: Record<string, string> = {
  "mini-gt": heroMiniGt,
  "pop-race": heroPopRace,
  "tarmac-works": heroTarmacWorks,
  "kaido-house": heroKaidoHouse,
};

const PreVendasMarca = () => {
  const { marca } = useParams<{ marca: string }>();
  const brand = marca ? SLUG_TO_BRAND[marca] : undefined;
  const { products, loading } = usePresaleProducts();
  const { brands } = useBrands();
  const [availabilityFilter, setAvailabilityFilter] = useState<"todas" | AvailabilityStatus>("todas");

  // Todos os hooks precisam rodar antes de qualquer "return" condicional —
  // por isso o cálculo dos itens/contagens fica aqui em cima, mesmo que
  // "brand" ainda esteja indefinido (slug inválido); nesse caso dá tudo vazio
  // e a página redireciona logo abaixo antes de renderizar qualquer coisa.
  const items = useMemo(() => (brand ? products.filter((p) => p.brand === brand) : []), [products, brand]);
  const earliestEta = items[0]?.etaDate;

  // Conta quantos itens caem em cada status, pra mostrar ao lado do nome do
  // filtro (e pra já esconder filtros sem nenhum item, tipo "Encerradas"
  // quando não tem nenhuma pré-venda encerrada dessa marca).
  const countsByStatus = useMemo(() => {
    const counts: Record<AvailabilityStatus, number> = { aberta: 0, fechando: 0, encerrada: 0 };
    for (const p of items) counts[getAvailabilityStatus(p.lotClosesAt)]++;
    return counts;
  }, [items]);

  // Slug desconhecido — volta para a vitrine geral de pré-vendas.
  if (!brand) {
    return <Navigate to="/pre-vendas" replace />;
  }

  const filteredItems =
    availabilityFilter === "todas" ? items : items.filter((p) => getAvailabilityStatus(p.lotClosesAt) === availabilityFilter);
  const heroImage = FALLBACK_HERO_IMAGE[marca ?? ""] ?? null;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Header />

      {/* HERO da marca: mesma cena de pedestais usada no card de /pre-vendas,
          com os pills de marca pra trocar de página sem precisar voltar. */}
      <section className="relative overflow-hidden border-b border-white/[0.06] bg-black">
        <div className="container relative py-10 text-center md:py-14">
          <img src={galpaoLogo} alt="Galpão 64 — A Arte do Diecast" className="mx-auto h-12 w-auto sm:h-14" />

          <Link
            to="/pre-vendas"
            className="mt-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Todas as pré-vendas
          </Link>

          <h1 className="mx-auto mt-3 max-w-3xl text-2xl font-black uppercase leading-[1.05] tracking-tight md:text-4xl">
            Pré-vendas:
          </h1>

          {/* Pills de marca — a marca da página atual fica ativa; as outras levam
              direto pra própria página, sem passar pela vitrine geral. */}
          <div className="mx-auto mt-5 flex max-w-3xl flex-wrap items-center justify-center gap-2.5">
            {brands.map((b) => {
              const active = b.slug === marca;
              return (
                <Link
                  key={b.id}
                  to={`/pre-vendas/${b.slug}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-xs font-black uppercase tracking-wide transition-all sm:px-5 sm:text-sm",
                    active
                      ? "border-primary bg-black text-primary shadow-[0_0_18px_hsl(var(--primary)/0.55)]"
                      : "border-white/15 bg-black/60 text-white/70 hover:border-white/30 hover:text-white",
                  )}
                >
                  {b.name}
                </Link>
              );
            })}
          </div>

          {/* Cena da garagem com os pedestais dessa marca — a própria foto é
              clicável e leva direto pras pré-vendas abertas, mais abaixo
              nesta mesma página (sem precisar de um botão separado). */}
          {heroImage && (
            <a
              href="#produtos-marca"
              aria-label={`Ver pré-vendas ${brand}`}
              className="group relative mx-auto mt-6 block max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-black transition-transform duration-300 hover:scale-[1.01]"
              style={{ aspectRatio: "1736 / 576" }}
            >
              <img
                key={marca}
                src={heroImage}
                alt={`Miniaturas ${brand} em pré-venda`}
                className="absolute inset-0 h-full w-full animate-premium-fade-in object-cover"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              >
                <span className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-black sm:text-sm">
                  Ver pré-vendas {brand}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </a>
          )}

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
            {loading
              ? "Carregando reservas abertas…"
              : `${items.length} modelo${items.length === 1 ? "" : "s"} em reserva aberta — garanta o seu antes que o lote feche.`}
          </p>

          {!loading && earliestEta && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-black/70 px-4 py-2 backdrop-blur-md">
              <CalendarClock className="h-4 w-4 text-primary" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary sm:text-[11px]">
                Próxima chegada: {formatEta(earliestEta)}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* GRID da marca */}
      <section id="produtos-marca" className="container py-12 md:py-16 scroll-mt-20">
        {!loading && items.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {AVAILABILITY_FILTERS.map(({ key, label }) => {
              const count = key === "todas" ? items.length : countsByStatus[key];
              // Some filtro sem nenhum item (ex.: "Encerradas" quando não tem
              // nenhuma), menos "Todas" que sempre aparece.
              if (key !== "todas" && count === 0) return null;
              const active = availabilityFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAvailabilityFilter(key)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors",
                    active
                      ? "border-primary bg-primary text-black"
                      : "border-white/15 bg-black/40 text-white/60 hover:border-white/30 hover:text-white",
                  )}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-16 text-center text-sm text-white/50">
            Nenhuma pré-venda aberta para essa marca no momento.{" "}
            <Link to="/pre-vendas" className="text-primary underline underline-offset-4">
              Ver todas as pré-vendas
            </Link>
            .
          </p>
        ) : filteredItems.length === 0 ? (
          <p className="py-16 text-center text-sm text-white/50">
            Nenhuma miniatura nesse filtro no momento.
          </p>
        ) : (
          <div className="grid animate-premium-fade-in gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {filteredItems.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        <VipWhatsAppBanner />
      </section>

      <FaqSection />
    </div>
  );
};

export default PreVendasMarca;
