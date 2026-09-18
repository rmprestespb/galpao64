import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarClock, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import ProductCard from "@/components/preVendas/ProductCard";
import VipWhatsAppBanner from "@/components/preVendas/VipWhatsAppBanner";
import FaqSection from "@/components/preVendas/FaqSection";
import { SLUG_TO_BRAND, formatEta } from "@/data/preVendas";
import { usePresaleProducts } from "@/hooks/usePresaleProducts";

import garageBg from "@/assets/luxury-garage-bg.jpg";
import galpaoLogo from "@/assets/galpao64-logo.png";

const PreVendasMarca = () => {
  const { marca } = useParams<{ marca: string }>();
  const brand = marca ? SLUG_TO_BRAND[marca] : undefined;
  const { products, loading } = usePresaleProducts();

  // Slug desconhecido — volta para a vitrine geral de pré-vendas.
  if (!brand) {
    return <Navigate to="/pre-vendas" replace />;
  }

  const items = products.filter((p) => p.brand === brand);
  const earliestEta = items[0]?.etaDate;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Header />

      {/* HERO da marca */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <img
          src={garageBg}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/70 via-[#09090b]/85 to-[#09090b]" />
        <div className="container relative py-12 text-center md:py-16">
          <img src={galpaoLogo} alt="Galpão 64 — A Arte do Diecast" className="mx-auto h-14 w-auto sm:h-16" />

          <Link
            to="/pre-vendas"
            className="mt-6 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Todas as pré-vendas
          </Link>

          <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-black uppercase leading-[1.05] tracking-tight md:text-5xl">
            Pré-vendas{" "}
            <span className="bg-gradient-to-r from-primary via-[#ff8a3d] to-gold bg-clip-text text-transparent">
              {brand}
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
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
      <section className="container py-12 md:py-16">
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
        ) : (
          <div className="grid animate-premium-fade-in gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {items.map((p) => (
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
