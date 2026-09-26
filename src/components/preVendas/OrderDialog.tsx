import { useMemo, useState } from "react";
import { Copy, Loader2, MessageCircle, PackageCheck, QrCode } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { buildPixPayload, pixQrUrl } from "@/lib/pix";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PreOrder, openReserveWhatsApp } from "@/data/preVendas";

type Step = "form" | "success";

const OrderDialog = ({ product, initialMode }: { product: PreOrder; initialMode: "full" | "deposit" }) => {
  const { settings } = useSiteSettings();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [mode, setMode] = useState<"full" | "deposit">(initialMode);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [confirmedPayment, setConfirmedPayment] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot — campo invisível pro visitante
  const [submitting, setSubmitting] = useState(false);

  const amountLabel = mode === "full" ? product.fullDiscounted : product.deposit;
  const amountNumber = useMemo(() => {
    const n = parseFloat(amountLabel.replace(/[^\d,]/g, "").replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }, [amountLabel]);

  const pixReady = Boolean(settings?.pixKey && settings?.pixMerchantName && settings?.pixCity);

  const payload = useMemo(() => {
    if (!pixReady || amountNumber <= 0) return "";
    try {
      return buildPixPayload({
        key: settings!.pixKey!.trim(),
        amount: amountNumber,
        merchantName: settings!.pixMerchantName!.trim(),
        city: settings!.pixCity!.trim(),
        description: `${product.ref} ${product.name}`.slice(0, 50),
      });
    } catch {
      return "";
    }
  }, [pixReady, amountNumber, settings, product]);

  const qrUrl = payload ? pixQrUrl(payload) : "";

  const handleCopyPix = async () => {
    if (!payload) return;
    await navigator.clipboard.writeText(payload);
    toast.success("PIX Copia e Cola copiado!");
  };

  const resetForClose = () => {
    setStep("form");
    setName("");
    setWhatsapp("");
    setEmail("");
    setConfirmedPayment(false);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !whatsapp.trim()) {
      toast.error("Preencha nome e WhatsApp");
      return;
    }
    if (!confirmedPayment) {
      toast.error("Marque que já fez o pagamento via PIX");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("submit-presale-order", {
        body: {
          presaleProductId: product.id,
          paymentMode: mode,
          customerName: name.trim(),
          customerWhatsapp: whatsapp.trim(),
          customerEmail: email.trim() || undefined,
          confirmedPayment,
          website, // honeypot
        },
      });
      if (error || data?.error) {
        toast.error(data?.error || "Não foi possível enviar o pedido — tenta de novo em instantes");
        return;
      }
      setStep("success");
    } catch {
      toast.error("Falha de conexão — tenta de novo em instantes");
    } finally {
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
        {step === "form" ? (
          <>
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

              <div className="flex flex-col items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-4">
                {pixReady && qrUrl ? (
                  <>
                    <img src={qrUrl} alt="QR Code PIX" className="h-44 w-44 rounded bg-white p-2" />
                    <p className="text-center text-lg font-black text-primary">{amountLabel}</p>
                    <Button type="button" size="sm" variant="outline" className="w-full" onClick={handleCopyPix}>
                      <Copy className="h-4 w-4" /> Copiar PIX Copia e Cola
                    </Button>
                  </>
                ) : (
                  <div className="flex h-24 w-full items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                    <QrCode className="h-4 w-4 shrink-0" />
                    Chave PIX ainda não configurada — fale direto no WhatsApp pra combinar o pagamento.
                  </div>
                )}
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

              <label className="flex items-start gap-2 text-xs text-white/70">
                <Checkbox
                  checked={confirmedPayment}
                  onCheckedChange={(v) => setConfirmedPayment(v === true)}
                  className="mt-0.5"
                />
                Já fiz o pagamento de {amountLabel} via PIX pra garantir minha reserva.
              </label>

              <Button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="w-full rounded-full bg-gradient-to-r from-primary to-[#ff8a3d] font-mono text-xs font-black uppercase tracking-[0.14em] text-black"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageCheck className="h-4 w-4" />}
                Confirmar pedido
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
          </>
        ) : (
          <div className="space-y-4 py-2 text-center">
            <PackageCheck className="mx-auto h-12 w-12 text-primary" />
            <DialogHeader>
              <DialogTitle className="text-center font-mono text-sm uppercase tracking-wide">
                Pedido recebido!
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-white/70">
              Recebemos seu pedido de <strong className="text-white">{product.name}</strong>. Vamos conferir o
              pagamento e confirmar sua reserva pelo WhatsApp em breve.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                openReserveWhatsApp(product, mode);
              }}
            >
              <MessageCircle className="h-4 w-4" /> Falar agora no WhatsApp
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDialog;
