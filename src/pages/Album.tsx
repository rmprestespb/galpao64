import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, HelpCircle, Loader2, MapPin, MessageCircle, PackageCheck, Search, Truck, Warehouse } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import galpaoLogo from "@/assets/galpao64-logo.png";

type ReservationStatus = "na_garagem" | "aguardando_envio";

type Item = {
  id: string;
  title: string;
  image_url: string;
};

type Collector = {
  id: string;
  display_name: string;
  city: string;
  state: string;
  status: ReservationStatus;
  reservation_items: Item[];
};

const STATUS_LABEL: Record<ReservationStatus, string> = {
  na_garagem: "Na Garagem",
  aguardando_envio: "Aguardando Envio",
};

const WHATSAPP_NUMBER = "5546999350070";

const buildShippingMessage = (collector: Collector) => {
  const lines = [
    `Olá Robson! Sou ${collector.display_name} (${collector.city}/${collector.state.toUpperCase()}).`,
    "",
    "Gostaria de combinar o envio das miniaturas que estão no meu Álbum:",
    "",
    ...collector.reservation_items.map((it, i) => `${i + 1}. ${it.title}`),
    "",
    "Pode me passar o valor do frete e os próximos passos?",
  ];
  return encodeURIComponent(lines.join("\n"));
};

const Album = () => {
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("ALL");
  const [active, setActive] = useState<Collector | null>(null);
  const [lightbox, setLightbox] = useState<Item | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("reservation_collectors")
        .select("id, display_name, city, state, status, reservation_items(id, title, image_url, display_order)")
        .order("display_order", { ascending: true });
      if (!error && data) {
        const normalized: Collector[] = data.map((c: any) => ({
          ...c,
          reservation_items: (c.reservation_items ?? []).sort(
            (a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0),
          ),
        }));
        setCollectors(normalized);
      }
      setLoading(false);
    };
    load();
  }, []);

  const states = useMemo(() => {
    const set = new Set(collectors.map((c) => c.state.toUpperCase()));
    return ["ALL", ...Array.from(set).sort()];
  }, [collectors]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return collectors.filter((c) => {
      const matchState = stateFilter === "ALL" || c.state.toUpperCase() === stateFilter;
      if (!matchState) return false;
      if (!q) return true;
      return (
        c.display_name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q)
      );
    });
  }, [collectors, query, stateFilter]);

  return (
    <div className="min-h-screen bg-background text-foreground">
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

      <main className="container py-12 md:py-20">
        <section className="mb-10 md:mb-14">
          <p className="text-xs font-semibold tracking-[0.3em] text-accent mb-3">ÁLBUM DE RESERVAS</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05] mb-4">
            A Garagem dos Colecionadores
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
            Cada card abaixo representa a garagem de um cliente do Galpão 64.
            Clique para ver de perto as miniaturas que estão guardadas conosco
            até o próximo envio.
          </p>
        </section>

        <section className="mb-10 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome ou cidade…"
              className="pl-9 h-11 bg-card border-border/60"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {states.map((s) => (
              <button
                key={s}
                onClick={() => setStateFilter(s)}
                className={`px-3 h-11 rounded-md text-xs font-semibold tracking-[0.18em] border transition-colors ${
                  stateFilter === s
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-card text-foreground/80 border-border/60 hover:border-accent/60"
                }`}
              >
                {s === "ALL" ? "TODOS" : s}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Carregando garagens…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            Nenhuma garagem encontrada com esse filtro.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c)}
                className="group text-left rounded-xl border border-border/60 bg-card overflow-hidden hover:border-accent/60 hover:shadow-[0_8px_30px_-8px_hsl(var(--accent)/0.4)] transition-all"
              >
                <div className="relative aspect-[4/3] bg-muted/40 overflow-hidden">
                  {c.reservation_items.length > 0 ? (
                    <div
                      className={`grid h-full w-full gap-0.5 ${
                        c.reservation_items.length === 1
                          ? "grid-cols-1"
                          : c.reservation_items.length === 2
                            ? "grid-cols-2"
                            : "grid-cols-2 grid-rows-2"
                      }`}
                    >
                      {c.reservation_items.slice(0, 4).map((it, i) => (
                        <div key={it.id} className="overflow-hidden bg-background/50">
                          <img
                            src={it.image_url}
                            alt={it.title}
                            loading="lazy"
                            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                              c.reservation_items.length === 3 && i === 0 ? "row-span-2" : ""
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
                      Sem miniaturas cadastradas
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant="secondary"
                      className={`gap-1.5 backdrop-blur-md border ${
                        c.status === "na_garagem"
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {c.status === "na_garagem" ? (
                        <Warehouse className="h-3 w-3" />
                      ) : (
                        <PackageCheck className="h-3 w-3" />
                      )}
                      {STATUS_LABEL[c.status]}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 border-t border-border/60">
                  <h3 className="font-display text-lg font-semibold leading-tight">
                    {c.display_name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground inline-flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" />
                    {c.city} / {c.state.toUpperCase()}
                  </p>
                  <p className="mt-3 text-xs font-semibold tracking-[0.18em] text-accent">
                    {c.reservation_items.length}{" "}
                    {c.reservation_items.length === 1 ? "MINIATURA" : "MINIATURAS"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* FAQ */}
        <section className="mt-20 md:mt-28">
          <div className="mb-10 md:mb-14 max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.3em] text-accent mb-3 inline-flex items-center gap-2">
              <HelpCircle className="h-3.5 w-3.5" />
              FAQ
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-[1.05] mb-3">
              🏎️ Dúvidas Frequentes
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Tudo o que você precisa saber sobre a Garagem do Galpão 64 — armazenamento,
              prazos e envio das suas miniaturas.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm px-5 md:px-8">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="q1" className="border-border/60">
                <AccordionTrigger className="text-left font-display text-base md:text-lg hover:no-underline hover:text-accent">
                  Como funciona a "Garagem"?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  A Garagem é um benefício exclusivo para nossos clientes. Você pode comprar
                  suas miniaturas e, em vez de pagar o frete a cada compra, nós as guardamos
                  com total segurança. Isso permite que você acumule vários modelos e pague
                  um único frete quando decidir receber tudo em casa.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q2" className="border-border/60">
                <AccordionTrigger className="text-left font-display text-base md:text-lg hover:no-underline hover:text-accent">
                  Qual o prazo máximo de armazenamento?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  Você tem até <span className="text-foreground font-semibold">90 dias de carência</span>{" "}
                  (armazenamento gratuito) a partir da data da compra do primeiro item. Após
                  esse período, entraremos em contato para combinar o envio.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q3" className="border-border/60">
                <AccordionTrigger className="text-left font-display text-base md:text-lg hover:no-underline hover:text-accent">
                  Por que minha garagem é pública?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  Nosso álbum de reservas serve como uma vitrine de transparência e
                  comunidade. Assim, todos os colecionadores podem ver as raridades que
                  estão passando pelo Galpão, criando um histórico real de nossas
                  negociações. Exibimos apenas seu primeiro nome e cidade para preservar
                  sua privacidade.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q4" className="border-border/60">
                <AccordionTrigger className="text-left font-display text-base md:text-lg hover:no-underline hover:text-accent">
                  Como solicito o envio das minhas miniaturas?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  A qualquer momento! Basta clicar no botão{" "}
                  <span className="text-foreground font-semibold">"Solicitar Envio"</span>{" "}
                  dentro do seu box no site ou entrar em contato direto pelo nosso WhatsApp.
                  Calcularemos o frete com base no peso total e volume da sua caixa.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q5" className="border-b-0">
                <AccordionTrigger className="text-left font-display text-base md:text-lg hover:no-underline hover:text-accent">
                  Posso adicionar novos itens a uma garagem já aberta?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  Com certeza! Cada nova compra é adicionada ao seu box atual
                  automaticamente. O prazo de 90 dias continua contando a partir da data de
                  entrada do primeiro item guardado.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>

      {/* Garage detail */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-4xl bg-card border-border/60">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl md:text-3xl">
                  Garagem de {active.display_name}
                </DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-3 pt-1">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {active.city} / {active.state.toUpperCase()}
                  </span>
                  <Badge
                    variant="secondary"
                    className={`gap-1.5 ${
                      active.status === "na_garagem"
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    }`}
                  >
                    {STATUS_LABEL[active.status]}
                  </Badge>
                </DialogDescription>
              </DialogHeader>
              {active.reservation_items.length === 0 ? (
                <p className="py-10 text-center text-muted-foreground">
                  Nenhuma miniatura cadastrada nesta garagem.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 max-h-[60vh] overflow-y-auto pr-1">
                  {active.reservation_items.map((it) => (
                    <button
                      key={it.id}
                      onClick={() => setLightbox(it)}
                      className="group rounded-lg overflow-hidden border border-border/60 bg-background/40 hover:border-accent/60 transition-colors text-left"
                    >
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={it.image_url}
                          alt={it.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <p className="px-3 py-2 text-xs font-medium truncate">{it.title}</p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-3xl bg-background border-border/60 p-2">
          {lightbox && (
            <>
              <DialogHeader className="px-4 pt-3">
                <DialogTitle className="text-base">{lightbox.title}</DialogTitle>
              </DialogHeader>
              <div className="w-full">
                <img
                  src={lightbox.image_url}
                  alt={lightbox.title}
                  className="w-full max-h-[75vh] object-contain rounded-md"
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Album;
