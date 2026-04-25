import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame, Loader2, LogOut, Plus, Trash2, Printer, FileText, ArrowLeft, MessageCircle, QrCode } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import logo from "@/assets/galpao64-logo.png";

type Item = {
  id: string;
  description: string;
  quantity: number;
  unit: number; // reais
  code: string;
};

type Payment = "Dinheiro" | "PIX" | "Cartão Débito" | "Cartão Crédito" | "Outro";
const PAYMENTS: Payment[] = ["Dinheiro", "PIX", "Cartão Débito", "Cartão Crédito", "Outro"];

// ===== Helpers BR Code (PIX Copia e Cola) — banco C6 =====
const tlv = (id: string, value: string) => {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
};
const crc16 = (payload: string) => {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
};
const stripDiacritics = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const buildPixPayload = ({
  key,
  amount,
  merchantName,
  city,
  description,
}: {
  key: string;
  amount: number;
  merchantName: string;
  city: string;
  description?: string;
}) => {
  const gui = tlv("00", "br.gov.bcb.pix");
  const keyTlv = tlv("01", key);
  const desc = description ? tlv("02", stripDiacritics(description).slice(0, 50)) : "";
  const merchantAccountInfo = tlv("26", gui + keyTlv + desc);
  const payloadFormat = tlv("00", "01");
  const merchantCategoryCode = tlv("52", "0000");
  const transactionCurrency = tlv("53", "986");
  const transactionAmount = amount > 0 ? tlv("54", amount.toFixed(2)) : "";
  const countryCode = tlv("58", "BR");
  const name = tlv("59", stripDiacritics(merchantName).slice(0, 25));
  const cityTlv = tlv("60", stripDiacritics(city).slice(0, 15).toUpperCase());
  const additionalData = tlv("62", tlv("05", "***"));
  const partial =
    payloadFormat +
    merchantAccountInfo +
    merchantCategoryCode +
    transactionCurrency +
    transactionAmount +
    countryCode +
    name +
    cityTlv +
    additionalData +
    "6304";
  return partial + crc16(partial);
};

const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const newItem = (): Item => ({
  id: crypto.randomUUID(),
  description: "",
  quantity: 1,
  unit: 0,
  code: "",
});

const buildReceiptNumber = () => {
  const d = new Date();
  const y = d.getFullYear().toString().slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `G64-${y}${m}${day}-${rand}`;
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const formatDateBR = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const Receipts = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [receiptNumber, setReceiptNumber] = useState(buildReceiptNumber);
  const [date, setDate] = useState(todayISO());
  const [client, setClient] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState<Item[]>([newItem()]);
  const [shipping, setShipping] = useState(0);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notes, setNotes] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin/login", { replace: true });
    }
  }, [authLoading, user, isAdmin, navigate]);

  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + i.quantity * i.unit, 0),
    [items],
  );
  const totalQty = useMemo(
    () => items.reduce((acc, i) => acc + (Number.isFinite(i.quantity) ? i.quantity : 0), 0),
    [items],
  );
  const total = subtotal + (shipping || 0);

  // PIX (banco C6) — persistido no localStorage e compartilhado com o gerador PIX
  const [pixKey, setPixKey] = useState(
    () => localStorage.getItem("pix_key") || "rmprestespb@gmail.com",
  );
  const [pixName, setPixName] = useState(
    () => localStorage.getItem("pix_name") || "Robson Galpao 64",
  );
  const [pixCity, setPixCity] = useState(
    () => localStorage.getItem("pix_city") || "PATO BRANCO",
  );
  const [includePix, setIncludePix] = useState(true);

  useEffect(() => {
    localStorage.setItem("pix_key", pixKey);
    localStorage.setItem("pix_name", pixName);
    localStorage.setItem("pix_city", pixCity);
  }, [pixKey, pixName, pixCity]);

  const pixPayload = useMemo(() => {
    if (!includePix || !pixKey.trim() || !pixName.trim() || !pixCity.trim()) return "";
    try {
      return buildPixPayload({
        key: pixKey.trim(),
        amount: total,
        merchantName: pixName.trim(),
        city: pixCity.trim(),
        description: `Recibo ${receiptNumber}`,
      });
    } catch {
      return "";
    }
  }, [includePix, pixKey, pixName, pixCity, total, receiptNumber]);

  const pixQrUrl = pixPayload
    ? `https://quickchart.io/qr?size=320&margin=1&dark=000000&light=ffffff&text=${encodeURIComponent(pixPayload)}`
    : "";

  const updateItem = (id: string, patch: Partial<Item>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const removeItem = (id: string) =>
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((i) => i.id !== id)));

  const togglePayment = (p: Payment) =>
    setPayments((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const clearForm = () => {
    setReceiptNumber(buildReceiptNumber());
    setDate(todayISO());
    setClient("");
    setPhone("");
    setAddress("");
    setItems([newItem()]);
    setShipping(0);
    setPayments([]);
    setNotes("");
    toast.success("Formulário limpo");
  };

  const generate = () => {
    if (!client.trim()) {
      toast.error("Informe o nome do cliente");
      return;
    }
    if (items.every((i) => !i.description.trim())) {
      toast.error("Adicione ao menos um item com descrição");
      return;
    }
    setPreviewOpen(true);
  };

  const printReceipt = () => {
    window.print();
  };

  const buildWhatsAppMessage = () => {
    const lines = [
      `*GALPÃO 64 — Recibo ${receiptNumber}*`,
      `Data: ${formatDateBR(date)}`,
      `Cliente: ${client}`,
      phone && `Telefone: ${phone}`,
      address && `Endereço: ${address}`,
      "",
      "*Itens:*",
      ...items
        .filter((i) => i.description.trim())
        .map(
          (i, idx) =>
            `${idx + 1}. ${i.description} — ${i.quantity}x ${formatBRL(i.unit)} = ${formatBRL(i.quantity * i.unit)}${i.code ? ` (cód. ${i.code})` : ""}`,
        ),
      "",
      `Subtotal: ${formatBRL(subtotal)}`,
      `Frete: ${formatBRL(shipping)}`,
      `*TOTAL: ${formatBRL(total)}*`,
      payments.length ? `Pagamento: ${payments.join(", ")}` : "",
      notes && `Obs: ${notes}`,
      "",
      "_A Arte do Diecast_",
    ]
      .filter(Boolean)
      .join("\n");
    return lines;
  };

  const sendWhatsApp = () => {
    const message = buildWhatsAppMessage();
    const phoneDigits = phone.replace(/\D/g, "");
    const url = phoneDigits
      ? `https://wa.me/55${phoneDigits}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const sendToClientWhatsApp = () => {
    if (!client.trim()) {
      toast.error("Informe o nome do cliente");
      return;
    }
    const phoneDigits = phone.replace(/\D/g, "");
    if (!phoneDigits) {
      toast.error("Informe o telefone (WhatsApp) do cliente");
      return;
    }
    if (items.every((i) => !i.description.trim())) {
      toast.error("Adicione ao menos um item com descrição");
      return;
    }
    const message = buildWhatsAppMessage();
    const url = `https://wa.me/55${phoneDigits}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    toast.success("Abrindo WhatsApp do cliente...");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  if (authLoading || (user && !isAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER (no print) */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur print:hidden">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-primary" strokeWidth={2.5} fill="hsl(var(--primary))" />
            <span className="text-primary font-extrabold tracking-[0.18em] text-sm">
              GALPÃO <span className="font-black">64</span>
              <span className="ml-2 text-muted-foreground font-semibold">/ RECIBOS</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin">
                <ArrowLeft className="h-4 w-4" /> Admin
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 print:hidden">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-black uppercase tracking-wider">
            Emissão de <span className="text-accent">Recibos</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gere recibos formatados para clientes do Galpão 64
          </p>
        </div>

        {/* TOP META */}
        <section className="rounded-lg border border-border/60 bg-card/60 backdrop-blur-sm p-6 mb-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-primary">Nº Recibo</Label>
              <Input
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-primary">Data</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-primary">Cliente *</Label>
              <Input
                placeholder="Nome completo do cliente"
                value={client}
                onChange={(e) => setClient(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-primary">Telefone</Label>
              <Input
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-primary">Endereço</Label>
              <Input
                placeholder="Rua, número, cidade/UF"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* ITEMS */}
        <section className="rounded-lg border border-border/60 bg-card/60 backdrop-blur-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs uppercase tracking-[0.3em] text-primary font-bold">Itens</h2>
          </div>

          <div className="hidden md:grid md:grid-cols-[40px_90px_1fr_140px_140px_120px_40px] gap-2 text-[10px] uppercase tracking-[0.2em] text-primary/80 px-2 pb-2 border-b border-border/60">
            <span>Nº</span>
            <span>Qtd</span>
            <span>Produto</span>
            <span>Valor Unitário</span>
            <span>Total</span>
            <span>Código</span>
            <span>Ação</span>
          </div>

          <div className="divide-y divide-border/60">
            {items.map((item, idx) => {
              const lineTotal = item.quantity * item.unit;
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-2 md:grid-cols-[40px_90px_1fr_140px_140px_120px_40px] gap-2 py-3 items-center"
                >
                  <div className="text-muted-foreground text-sm font-mono">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <Input
                    type="number"
                    min={0}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(item.id, { quantity: Math.max(0, Number(e.target.value) || 0) })
                    }
                  />
                  <Input
                    placeholder="Descrição da miniatura"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                    className="md:col-span-1 col-span-2"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">R$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={item.unit}
                      onChange={(e) =>
                        updateItem(item.id, { unit: Math.max(0, Number(e.target.value) || 0) })
                      }
                    />
                  </div>
                  <div className="text-primary font-bold tabular-nums">{formatBRL(lineTotal)}</div>
                  <Input
                    placeholder="Código"
                    value={item.code}
                    onChange={(e) => updateItem(item.id, { code: e.target.value })}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="text-destructive hover:text-destructive"
                    aria-label="Remover item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>

          <Button
            variant="outline"
            className="mt-4 border-primary/40 text-primary hover:bg-primary/10"
            onClick={() => setItems((p) => [...p, newItem()])}
          >
            <Plus className="h-4 w-4" /> Adicionar Item
          </Button>
        </section>

        {/* PAYMENT + TOTALS */}
        <section className="grid gap-6 md:grid-cols-3 mb-6">
          <div className="rounded-lg border border-border/60 bg-card/60 backdrop-blur-sm p-6">
            <h2 className="text-xs uppercase tracking-[0.3em] text-primary font-bold mb-4">
              Forma de Pagamento
            </h2>
            <div className="space-y-3">
              {PAYMENTS.map((p) => (
                <label key={p} className="flex items-center gap-3 cursor-pointer text-sm">
                  <Checkbox
                    checked={payments.includes(p)}
                    onCheckedChange={() => togglePayment(p)}
                  />
                  <span>{p}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-card/60 backdrop-blur-sm p-6">
            <h2 className="text-xs uppercase tracking-[0.3em] text-primary font-bold mb-4">
              Totalizações
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total de Itens (QTD):</span>
                <span className="font-bold tabular-nums">{totalQty}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal Produtos:</span>
                <span className="font-bold tabular-nums">{formatBRL(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <Label className="text-muted-foreground text-sm font-normal">Frete (R$):</Label>
                <div className="flex items-center gap-1 max-w-[140px]">
                  <span className="text-xs text-muted-foreground">R$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={shipping}
                    onChange={(e) => setShipping(Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
              </div>
              <div className="border-t border-border/60 pt-3 flex items-center justify-between">
                <span className="text-primary uppercase tracking-[0.2em] text-xs font-bold">
                  Total Geral:
                </span>
                <span className="text-primary font-display font-black text-2xl tabular-nums">
                  {formatBRL(total)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-card/60 backdrop-blur-sm p-6">
            <h2 className="text-xs uppercase tracking-[0.3em] text-primary font-bold mb-4">
              Observações
            </h2>
            <Textarea
              placeholder="Notas, condições, garantia..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[160px] resize-none"
            />
          </div>
        </section>

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={generate} className="font-bold tracking-wider">
            <FileText className="h-4 w-4" /> GERAR RECIBO
          </Button>
          <Button
            onClick={sendToClientWhatsApp}
            className="font-bold tracking-wider bg-[#25D366] hover:bg-[#1ebe5a] text-white"
          >
            <MessageCircle className="h-4 w-4" /> ENVIAR PARA WHATSAPP DO CLIENTE
          </Button>
          <Button onClick={clearForm} variant="outline">
            Limpar Campos
          </Button>
        </div>
      </main>

      {/* PREVIEW DIALOG */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 print:max-w-none print:max-h-none print:overflow-visible">
          <div className="flex items-center justify-end gap-2 p-3 border-b border-border/60 print:hidden">
            <Button size="sm" onClick={printReceipt}>
              <Printer className="h-4 w-4" /> Imprimir / PDF
            </Button>
            <Button size="sm" variant="outline" onClick={sendWhatsApp}>
              Enviar WhatsApp
            </Button>
          </div>

          {/* PRINTABLE AREA */}
          <div id="receipt-print" className="receipt-sheet bg-white text-black p-10 print:p-8">
            <div className="flex items-start justify-between gap-6 border-b-2 border-black pb-4">
              <div className="flex items-center gap-4">
                <img src={logo} alt="Galpão 64" className="h-16 w-16 object-contain" />
                <div>
                  <div className="text-2xl font-black tracking-wider">GALPÃO 64</div>
                  <div className="text-xs uppercase tracking-[0.3em] text-neutral-600">
                    A Arte do Diecast
                  </div>
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="font-bold">RECIBO</div>
                <div className="font-mono text-xs">{receiptNumber}</div>
                <div className="text-xs mt-1">Data: {formatDateBR(date)}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Cliente</div>
                <div className="font-bold">{client || "—"}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Telefone</div>
                <div>{phone || "—"}</div>
              </div>
              <div className="col-span-2">
                <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Endereço</div>
                <div>{address || "—"}</div>
              </div>
            </div>

            <table className="w-full mt-6 text-sm border-collapse">
              <thead>
                <tr className="border-b border-black text-left text-[10px] uppercase tracking-[0.2em]">
                  <th className="py-2 w-8">Nº</th>
                  <th className="py-2 w-12">Qtd</th>
                  <th className="py-2">Produto</th>
                  <th className="py-2 w-24 text-right">Unit.</th>
                  <th className="py-2 w-24 text-right">Total</th>
                  <th className="py-2 w-20">Código</th>
                </tr>
              </thead>
              <tbody>
                {items
                  .filter((i) => i.description.trim())
                  .map((i, idx) => (
                    <tr key={i.id} className="border-b border-neutral-300 align-top">
                      <td className="py-2">{idx + 1}</td>
                      <td className="py-2">{i.quantity}</td>
                      <td className="py-2">{i.description}</td>
                      <td className="py-2 text-right tabular-nums">{formatBRL(i.unit)}</td>
                      <td className="py-2 text-right tabular-nums font-bold">
                        {formatBRL(i.quantity * i.unit)}
                      </td>
                      <td className="py-2 font-mono text-xs">{i.code || "—"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>

            <div className="mt-6 grid grid-cols-2 gap-6">
              <div className="text-sm">
                <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-1">
                  Forma de Pagamento
                </div>
                <div>{payments.length ? payments.join(", ") : "—"}</div>

                {notes && (
                  <>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mt-4 mb-1">
                      Observações
                    </div>
                    <div className="whitespace-pre-wrap">{notes}</div>
                  </>
                )}
              </div>
              <div className="text-sm">
                <div className="flex justify-between border-b border-neutral-300 py-1">
                  <span className="text-neutral-600">Subtotal:</span>
                  <span className="tabular-nums">{formatBRL(subtotal)}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-300 py-1">
                  <span className="text-neutral-600">Frete:</span>
                  <span className="tabular-nums">{formatBRL(shipping)}</span>
                </div>
                <div className="flex justify-between border-t-2 border-black py-2 mt-2">
                  <span className="font-black uppercase tracking-wider">Total Geral</span>
                  <span className="font-black text-xl tabular-nums">{formatBRL(total)}</span>
                </div>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-10 text-xs">
              <div className="border-t border-black pt-2 text-center">
                Assinatura do Cliente
              </div>
              <div className="border-t border-black pt-2 text-center">
                Galpão 64 / Carimbo
              </div>
            </div>

            <div className="mt-8 text-center text-[10px] uppercase tracking-[0.3em] text-neutral-500">
              Galpão 64 — A Arte do Diecast
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Receipts;