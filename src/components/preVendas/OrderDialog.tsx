import { useState } from "react";
import { Loader2, MessageCircle, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PreOrder, openReserveWhatsApp, slugifyBrand } from "@/data/preVendas";

const OrderDialog = ({ product, initialMode }: { product: PreOrder; initialMode: "full" | "deposit" }) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"full" | "deposit">(initialMode);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — campo invisível pro visitante
  const [submitting, setSubmitting] = useState(false);

  const amountLabel = mode === "full" ? product.fullDiscounted : product.deposit;

  const resetForClose = () => {
    setName("");
    setWhatsapp("");
    setEmail("");
  };

  const handleSubmit = async () => {
    if (!name.trim() || !whatsapp.trim()) {
      toast.error("Preencha nome e WhatsApp");
      return;
    }
    setSubmitting(true);
    try {
      // Volta pro card dessa marca depois de pagar (sem query string —
      // a função adiciona ?pedido=<id> sozinha).
      const returnUrl = `${window.location.origin}/pre-vendas/${slugifyBrand(product.brand)}`;
      const { data, error } = await supabase.functions.invoke("create-presale-checkout", {
        body: {
          presaleProductId: product.id,
          paymentMode: mode,
          customerName: name.trim(),
          customerWhatsapp: whatsapp.trim(),
          customerEmail: email.trim() || undefined,
          returnUrl,
          website, // honeypot
        },
      });
      if (error || data?.error || !data?.checkoutUrl) {
        // Quando a função responde com erro (4xx/5xx), o cliente do Supabase não
        // devolve o corpo JSON em `data` — só um erro genérico em `error`. Por
        // isso lemos a mensagem real direto da resposta (error.context), senão
        // toda falha aparecia com o mesmo aviso vago, mesmo quando o motivo era
        // bem específico (ex.: "pedido duplicado, aguarde 2 minutos").
        let message = data?.error as string | undefined;
        if (!message && error && "context" in error) {
          try {
            const body = await (error as { context: Response }).context.json();
            message = body?.error;
          } catch {
            // resposta não veio em JSON — mantém o fallback genérico abaixo.
          }
        }
        toast.error(message || "Não foi possível iniciar o pagamento — tenta de novo em instantes");
        return;
      }
      // Sai do site e vai pro checkout da InfinitePay (Pix ou cartão parcelado).
      // A confirmação volta sozinha por webhook — não precisa de passo extra aqui.
      window.location.href = data.checkoutUrl as string;
    } catch {
      toast.error("Falha de conexão — tenta de novo em instantes");
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForClose();
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          className={cn(
            "flex-1 rounded-full px-4 py-3.5 font-mono text-xs font-black uppercase tracking-[0.14em]",
            "bg-gradient-to-r from-primary to-[#ff8a3d] text-black",
            "shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.8)]",
            "hover:brightness-110 hover:shadow-[0_14px_40px_-8px_hsl(var(--primary)/1)] active:scale-[0.98]",
          )}
        >
          <PackageCheck className="h-4 w-4" strokeWidth={2.5} />
          Fazer pedido
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm uppercase tracking-wide">
            Pedido — {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Forma de pagamento
            </Label>
            <RadioGroup
              value={mode}
              onValueChange={(v) => setMode(v as "full" | "deposit")}
              className="mt-2 grid grid-cols-2 gap-2"
            >
              <label
                className={cn(
                  "flex cursor-pointer flex-col gap-0.5 rounded-lg border px-3 py-2 text-left",
                  mode === "deposit" ? "border-primary/70 bg-primary/10" : "border-white/10",
                )}
              >
                <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <RadioGroupItem value="deposit" className="h-3.5 w-3.5" /> Sinal
                </span>
                <span className="pl-5 text-sm font-black text-primary">{product.deposit}</span>
              </label>
              <label
                className={cn(
                  "flex cursor-pointer flex-col gap-0.5 rounded-lg border px-3 py-2 text-left",
                  mode === "full" ? "border-primary/70 bg-primary/10" : "border-white/10",
                )}
              >
                <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <RadioGroupItem value="full" className="h-3.5 w-3.5" /> Integral (5% off)
                </span>
                <span className="pl-5 text-sm font-black text-primary">{product.fullDiscounted}</span>
              </label>
            </RadioGroup>
          </div>

          <div className="flex flex-col items-center gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-4 text-center">
            <p className="text-2xl font-black text-primary">{amountLabel}</p>
            <p className="text-xs text-muted-foreground">
              Pagamento via Pix ou cartão (em até 12x) no checkout seguro da InfinitePay.
            </p>
          </div>

          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="order-name">Nome completo</Label>
              <Input id="order-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="order-whatsapp">WhatsApp</Label>
              <Input
                id="order-whatsapp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="order-email">E-mail (opcional)</Label>
              <Input
                id="order-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
            {/* honeypot — invisível pra gente, bots costumam preencher todo campo que acham */}
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <Button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="w-full rounded-full bg-gradient-to-r from-primary to-[#ff8a3d] font-mono text-xs font-black uppercase tracking-[0.14em] text-black"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageCheck className="h-4 w-4" />}
            {submitting ? "Abrindo pagamento..." : `Pagar ${amountLabel}`}
          </Button>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              openReserveWhatsApp(product, mode);
            }}
            className="flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-white/50 underline-offset-2 hover:text-white hover:underline"
          >
            <MessageCircle className="h-3.5 w-3.5" /> Prefiro falar antes no WhatsApp
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDialog;
