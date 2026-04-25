import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ShowroomCard, { ShowroomProductData } from "@/components/ShowroomCard";
import galpaoLogo from "@/assets/galpao64-logo.png";
import garageBg from "@/assets/luxury-garage-bg.jpg";

type Row = {
  id: string;
  title: string;
  series: string | null;
  price_cents: number;
  images: string[] | null;
  sale_image_original_url: string | null;
  sale_image_processed_url: string | null;
  status: "disponivel" | "reservado" | "vendido" | null;
};

const Showroom = () => {
  const [products, setProducts] = useState<ShowroomProductData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("products")
      .select(
        "id, title, series, price_cents, images, sale_image_original_url, sale_image_processed_url, status",
      )
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setProducts(
            (data as Row[]).map((d) => {
              const imgs = d.images?.length ? d.images : [];
              // Foto 1 (Destaque) = preferimos imagem de venda original (close-up do carro)
              const highlight =
                d.sale_image_original_url || imgs[0] || "";
              // Foto 2 (Blister) = primeira do array geral, se diferente da Foto 1
              const blister =
                imgs.find((u) => u && u !== highlight) ?? imgs[1] ?? null;
              return {
                id: d.id,
                title: d.title,
                series: d.series,
                price_cents: d.price_cents,
                highlightImage: highlight,
                highlightProcessed: d.sale_image_processed_url,
                blisterImage: blister,
                status: d.status ?? "disponivel",
              } satisfies ShowroomProductData;
            }),
          );
        }
        setLoading(false);
      });
  }, []);

  return (
    <div
      className="relative min-h-screen text-foreground bg-background bg-fixed bg-center bg-cover before:content-[''] before:absolute before:inset-0 before:bg-background/80 before:pointer-events-none"
      style={{ backgroundImage: `url(${garageBg})` }}
    >
      <div className="relative z-10">
        <header className="sticky top-0 z-50 w-full bg-background/70 backdrop-blur-md border-b border-border/40">
          <div className="container flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src={galpaoLogo}
                alt="Galpão 64"
                className="h-10 w-auto transition-transform group-hover:scale-105"
              />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-foreground/80 hover:text-accent transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </div>
        </header>

        <main className="container py-10 sm:py-14">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-[11px] font-bold tracking-[0.3em] text-accent uppercase mb-3">
              Showroom Interativo
            </p>
            <h1
              className="text-3xl sm:text-5xl font-extrabold uppercase leading-[0.95] tracking-tight text-foreground"
              style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
            >
              Galeria do <span className="text-primary">Colecionador</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground">
              Examine cada peça em duas visões: a foto em destaque do carro isolado e a prova
              de colecionador na cartela original (blister).
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">
              Nenhuma peça publicada no momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {products.map((p) => (
                <ShowroomCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Showroom;