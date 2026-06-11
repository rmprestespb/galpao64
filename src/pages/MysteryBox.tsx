import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import mysterySilhouette from "@/assets/mystery-box-silhouette.jpg";

type Lot = {
  id: string;
  name: string;
  total_boxes: number;
  sold_count: number;
  is_closed: boolean;
};

type Box = {
  number: number;
  collector_name: string | null;
  product_name: string | null;
  product_image_url: string | null;
};

export default function MysteryBox() {
  const { isAdmin } = useAuth();
  const [lot, setLot] = useState<Lot | null>(null);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const loadAll = async () => {
    const { data: lotData, error: lotErr } = await supabase
      .from("mystery_lots")
      .select("id,name,total_boxes,sold_count,is_closed")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (lotErr || !lotData) {
      setLoading(false);
      return;
    }
    setLot(lotData as Lot);

    // Server-side RLS will return rows only if the lot is closed (or admin).
    const { data: boxData } = await supabase
      .from("mystery_boxes")
      .select("number,collector_name,product_name,product_image_url")
      .eq("lot_id", lotData.id)
      .order("number", { ascending: true });
    setBoxes((boxData ?? []) as Box[]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    const channel = supabase
      .channel("mystery-lot-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "mystery_lots" },
        () => loadAll(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const simulateClosed = async () => {
    if (!lot) return;
    setActing(true);
    const { error } = await supabase
      .from("mystery_lots")
      .update({
        is_closed: true,
        sold_count: lot.total_boxes,
        closed_at: new Date().toISOString(),
      })
      .eq("id", lot.id);
    setActing(false);
    if (error) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem fechar o lote no servidor.",
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Lote fechado no servidor", description: "Revelação liberada." });
    loadAll();
  };

  const reopenLot = async () => {
    if (!lot) return;
    setActing(true);
    const { error } = await supabase
      .from("mystery_lots")
      .update({ is_closed: false, sold_count: 0, closed_at: null })
      .eq("id", lot.id);
    setActing(false);
    if (error) {
      toast({ title: "Acesso negado", variant: "destructive" });
      return;
    }
    loadAll();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Carregando lote...
      </main>
    );
  }

  if (!lot) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Nenhum lote disponível.
      </main>
    );
  }

  const total = lot.total_boxes;
  const sold = lot.sold_count;
  const revealed = lot.is_closed;
  const progressPct = total > 0 ? (sold / total) * 100 : 0;

  // Render a placeholder grid (just numbers) when not revealed, so the page is
  // always visually consistent even though no box data was fetched from the server.
  const displayBoxes: Box[] =
    revealed && boxes.length > 0
      ? boxes
      : Array.from({ length: total }, (_, i) => ({
          number: i + 1,
          collector_name: null,
          product_name: null,
          product_image_url: null,
        }));

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-gradient-to-b from-background to-background/60">
        <div className="container mx-auto px-4 py-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-fuchsia-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
              MYSTERY BOX
            </span>
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Escolha sua caixa. O conteúdo só é revelado quando o lote completo for vendido.
          </p>

          <div className="mt-8 rounded-xl border border-border/60 bg-card/60 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-wider text-muted-foreground">
                  Progresso do Lote
                </p>
                <p className="text-2xl font-semibold">
                  <span className="text-cyan-400">{sold}</span>
                  <span className="text-muted-foreground"> de {total} caixas vendidas</span>
                </p>
              </div>
              {revealed ? (
                <Badge className="bg-fuchsia-500/90 text-white">LOTE REVELADO</Badge>
              ) : (
                <Badge variant="outline" className="border-cyan-400/40 text-cyan-300">
                  Em andamento
                </Badge>
              )}
            </div>
            <Progress value={progressPct} className="mt-4 h-2" />

            {/* Admin-only simulation controls — enforced by server RLS */}
            {isAdmin ? (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-fuchsia-400/40 text-fuchsia-300">
                  Admin
                </Badge>
                <Button size="sm" variant="secondary" disabled={acting || revealed} onClick={simulateClosed}>
                  Simular Lote Esgotado
                </Button>
                <Button size="sm" variant="outline" disabled={acting || !revealed} onClick={reopenLot}>
                  Reabrir lote
                </Button>
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                A revelação é controlada pelo servidor e liberada automaticamente quando o lote for fechado.
              </p>
            )}
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-10">
          {displayBoxes.map((box) => (
            <BoxCard key={box.number} box={box} revealed={revealed} />
          ))}
        </div>
      </section>
    </main>
  );
}

function BoxCard({ box, revealed }: { box: Box; revealed: boolean }) {
  return (
    <div
      className="group relative aspect-[3/4] [perspective:1000px]"
      aria-label={`Caixa ${box.number}`}
    >
      <div
        className={`relative h-full w-full rounded-lg transition-transform duration-700 [transform-style:preserve-3d] ${
          revealed ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* FRONT: mystery */}
        <div className="absolute inset-0 overflow-hidden rounded-lg border border-fuchsia-500/30 bg-black [backface-visibility:hidden]">
          <img
            src={mysterySilhouette}
            alt=""
            loading="lazy"
            width={400}
            height={533}
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="font-display text-4xl md:text-5xl font-extrabold text-white drop-shadow-[0_0_10px_rgba(236,72,153,0.9)]"
              style={{ textShadow: "0 0 12px rgba(34,211,238,0.7)" }}
            >
              {String(box.number).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* BACK: revealed */}
        <div className="absolute inset-0 overflow-hidden rounded-lg border border-cyan-400/40 bg-card [transform:rotateY(180deg)] [backface-visibility:hidden]">
          {box.product_image_url ? (
            <img
              src={box.product_image_url}
              alt={box.product_name ?? ""}
              loading="lazy"
              width={400}
              height={400}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-muted" />
          )}
          <div className="absolute inset-x-0 top-0 flex justify-between p-1.5">
            <span className="rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">
              #{String(box.number).padStart(2, "0")}
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2">
            <p className="line-clamp-1 text-[11px] font-semibold text-white">
              {box.product_name ?? "—"}
            </p>
            <p className="mt-0.5 line-clamp-1 text-[10px] text-cyan-300">
              Ganha por: {box.collector_name ?? "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}