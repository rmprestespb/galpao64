import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Flame, Loader2, MessageCircle, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type OrderRow = {
  id: string;
  presale_product_id: string;
  payment_mode: string;
  amount_cents: number;
  customer_name: string;
  customer_whatsapp: string;
  customer_email: string | null;
  customer_confirmed_payment: boolean;
  status: string;
  created_at: string;
  presale_products: { name: string; ref: string; brand: string } | null;
};

const STATUS_LABEL: Record<string, string> = {
  novo: "Novo",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
};

const STATUS_STYLE: Record<string, string> = {
  novo: "border-gold/50 bg-gold/10 text-gold",
  confirmado: "border-primary/50 bg-primary/10 text-primary",
  cancelado: "border-white/20 bg-white/[0.06] text-white/50",
};

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const whatsappLink = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
};

const AdminPedidos = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [pixKey, setPixKey] = useState("");
  const [pixMerchantName, setPixMerchantName] = useState("");
  const [pixCity, setPixCity] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin/login", { replace: true });
    }
  }, [authLoading, user, isAdmin, navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("presale_orders")
      .select("*, presale_products(name, ref, brand)")
      .order("created_at", { ascending: false });
    if (error) toast.error("Erro ao carregar pedidos", { description: error.message });
    else setOrders((data ?? []) as unknown as OrderRow[]);
    setLoading(false);
  };

  const fetchSettings = async () => {
    setLoadingSettings(true);
    const { data, error } = await supabase
      .from("site_settings")
      .select("pix_key, pix_merchant_name, pix_city")
      .eq("id", "default")
      .maybeSingle();
    if (!error && data) {
      setPixKey(data.pix_key ?? "");
      setPixMerchantName(data.pix_merchant_name ?? "");
      setPixCity(data.pix_city ?? "");
    }
    setLoadingSettings(false);
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchOrders();
      fetchSettings();
    }
  }, [user, isAdmin]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("presale_orders").update({ status }).eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar status", { description: error.message });
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    const { error } = await supabase
      .from("site_settings")
      .update({
        pix_key: pixKey.trim() || null,
        pix_merchant_name: pixMerchantName.trim() || null,
        pix_city: pixCity.trim() || null,
      })
      .eq("id", "default");
    setSavingSettings(false);
    if (error) toast.error("Erro ao salvar", { description: error.message });
    else toast.success("Configuração de PIX salva");
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
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-primary" strokeWidth={2.5} fill="hsl(var(--primary))" />
            <span className="text-primary font-extrabold tracking-[0.18em] text-sm">
              GALPÃO <span className="font-black">64</span>
              <span className="ml-2 text-muted-foreground font-semibold">/ ADMIN · PEDIDOS</span>
            </span>
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4" /> Miniaturas da Garagem
            </Link>
          </Button>
        </div>
      </header>

      <main className="container py-10 space-y-10">
        {/* Configuração da chave PIX usada no QR mostrado pro cliente */}
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-lg font-display font-black uppercase mb-1">Configuração do PIX</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Usada pra gerar o QR Code/copia-e-cola mostrado no formulário de pedido do site. A chave fica visível
            pra quem faz o pedido (é o próprio QR), então não é um dado secreto.
          </p>
          {loadingSettings ? (
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <Label>Chave PIX</Label>
                <Input value={pixKey} onChange={(e) => setPixKey(e.target.value)} placeholder="CPF, e-mail, telefone ou aleatória" />
              </div>
              <div className="space-y-1">
                <Label>Favorecido</Label>
                <Input value={pixMerchantName} onChange={(e) => setPixMerchantName(e.target.value)} maxLength={25} placeholder="Nome do recebedor" />
              </div>
              <div className="space-y-1">
                <Label>Cidade</Label>
                <Input value={pixCity} onChange={(e) => setPixCity(e.target.value)} maxLength={15} placeholder="Cidade do recebedor" />
              </div>
            </div>
          )}
          <Button onClick={saveSettings} disabled={savingSettings || loadingSettings} className="mt-4 font-bold tracking-wider">
            {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar
          </Button>
        </section>

        {/* Lista de pedidos recebidos */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-display font-black uppercase">
                Pedidos <span className="text-accent">({orders.length})</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Pedidos feitos direto pelos cards de pré-venda. Também chegam por e-mail e na planilha.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchOrders}>
              <RefreshCw className="h-4 w-4" /> Atualizar
            </Button>
          </div>

          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum pedido recebido ainda.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          STATUS_STYLE[o.status] ?? STATUS_STYLE.novo,
                        )}
                      >
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(o.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <p className="mt-1 font-bold">
                      {o.presale_products?.name ?? "Produto removido"}{" "}
                      <span className="font-normal text-muted-foreground">({o.presale_products?.ref})</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {o.customer_name} · {o.customer_whatsapp}
                      {o.customer_email ? ` · ${o.customer_email}` : ""}
                    </p>
                    <p className="text-sm">
                      <strong className="text-primary">{formatBRL(o.amount_cents)}</strong>{" "}
                      <span className="text-muted-foreground">
                        ({o.payment_mode === "full" ? "Integral" : "Sinal"}
                        {o.customer_confirmed_payment ? " — cliente confirmou o PIX" : ""})
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <a href={whatsappLink(o.customer_whatsapp)} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-4 w-4" /> WhatsApp
                      </a>
                    </Button>
                    <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="novo">Novo</SelectItem>
                        <SelectItem value="confirmado">Confirmado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminPedidos;
