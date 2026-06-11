import { useEffect, useState } from "react";
import { Loader2, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Lot = {
  id: string;
  name: string;
  total_boxes: number;
  sold_count: number;
  is_closed: boolean;
  closed_at: string | null;
};

export default function MysteryLotControl() {
  const [lot, setLot] = useState<Lot | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("mystery_lots")
      .select("id,name,total_boxes,sold_count,is_closed,closed_at")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    setLot((data as Lot) ?? null);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const closeLot = async () => {
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
      toast.error("Falha ao fechar o lote", { description: error.message });
      return;
    }
    toast.success("Lote fechado oficialmente", {
      description: "A revelação foi liberada no servidor.",
    });
    load();
  };

  const reopenLot = async () => {
    if (!lot) return;
    setActing(true);
    const { error } = await supabase
      .from("mystery_lots")
      .update({ is_closed: false, closed_at: null })
      .eq("id", lot.id);
    setActing(false);
    if (error) {
      toast.error("Falha ao reabrir", { description: error.message });
      return;
    }
    toast.success("Lote reaberto");
    load();
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-border/60 bg-card/60 p-5 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando lote...
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">
        Nenhum lote da Mystery Box cadastrado.
      </div>
    );
  }

  const formattedClosedAt = lot.closed_at
    ? new Date(lot.closed_at).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "medium",
      })
    : null;

  return (
    <section className="mb-8 rounded-lg border border-border/60 bg-card/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-display font-bold uppercase tracking-wider">
              Mystery Box — {lot.name}
            </h2>
            {lot.is_closed ? (
              <Badge className="bg-fuchsia-500/90 text-white">FECHADO</Badge>
            ) : (
              <Badge variant="outline" className="border-cyan-400/40 text-cyan-300">
                ABERTO
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {lot.sold_count} de {lot.total_boxes} caixas vendidas
          </p>
          {formattedClosedAt && (
            <p className="mt-1 text-xs text-muted-foreground">
              Fechado em <span className="text-foreground">{formattedClosedAt}</span>
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {!lot.is_closed ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={acting} className="font-bold tracking-wider">
                  <Lock className="h-4 w-4" /> FECHAR LOTE
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Fechar lote oficialmente?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação é registrada no servidor com data e hora exatas e libera
                    imediatamente a revelação pública das {lot.total_boxes} caixas.
                    Você poderá reabrir manualmente depois, se necessário.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={closeLot}>
                    Sim, fechar agora
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={acting}>
                  <Unlock className="h-4 w-4" /> Reabrir lote
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reabrir o lote?</AlertDialogTitle>
                  <AlertDialogDescription>
                    A revelação pública será ocultada novamente e a data de fechamento
                    será apagada.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={reopenLot}>Reabrir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </section>
  );
}