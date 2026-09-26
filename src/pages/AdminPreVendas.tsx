import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CalendarIcon,
  Flame,
  Loader2,
  Pencil,
  Plus,
  Share2,
  Trash2,
  Upload,
  X,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BRAND_SLUGS, INTEGRAL_DISCOUNT_PCT, SingleBrand, formatDeadline, formatEta } from "@/data/preVendas";
import type { PresaleProductRow } from "@/data/preVendas";

const BRAND_OPTIONS = Object.keys(BRAND_SLUGS) as SingleBrand[];

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Mensagem de divulgação pro admin mandar no WhatsApp (grupo, status, contato
 * avulso) — não confundir com a mensagem de reserva do cliente. Abre o
 * WhatsApp sem número fixo (o admin escolhe pra quem manda) com o texto já
 * pronto e o link direto pra página da marca no site. */
const buildPromoMessage = (p: PresaleProductRow) => {
  const fullDiscountedCents = Math.round(p.full_price_cents * (1 - INTEGRAL_DISCOUNT_PCT / 100));
  const link = `${window.location.origin}/pre-vendas/${BRAND_SLUGS[p.brand as SingleBrand] ?? ""}`;
  return (
    `🔥 *Pré-venda aberta — Galpão 64* 🔥\n\n` +
    `*${p.brand} — ${p.name}*\n` +
    `Referência: ${p.ref}\n\n` +
    `💰 Sinal: ${formatBRL(p.deposit_price_cents)}\n` +
    `💵 Ou à vista: ${formatBRL(fullDiscountedCents)} (${INTEGRAL_DISCOUNT_PCT}% off)\n` +
    `📦 Previsão de chegada: ${formatEta(p.eta_date)}\n` +
    (formatDeadline(p.lot_closes_at) ? `⏳ Reserva até: ${formatDeadline(p.lot_closes_at)}\n` : "") +
    `\nGaranta a sua: ${link}`
  );
};

const shareOnWhatsApp = (p: PresaleProductRow) => {
  const msg = buildPromoMessage(p);
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
};

const presaleSchema = z.object({
  brand: z.enum(["Mini GT", "Pop Race", "Tarmac Works", "Kaido House"]),
  ref: z.string().trim().min(1, "Referência obrigatória").max(80),
  name: z.string().trim().min(1, "Nome do modelo obrigatório").max(120),
});

const formatBRLInput = (value: string) => {
  const raw = (value || "").trim().replace(/\./g, "").replace(",", ".");
  if (!raw) return 0;
  const num = parseFloat(raw);
  return Number.isFinite(num) && num >= 0 ? Math.round(num * 100) : 0;
};

const centsToInput = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");

const emptyForm = {
  brand: "Mini GT" as SingleBrand,
  ref: "",
  name: "",
  specs: "",
  description: "",
  imageUrl: "",
  hoverImageUrl: "",
  extraImageUrl: "",
  fullPrice: "",
  depositPrice: "",
  etaDate: undefined as Date | undefined,
  lotCode: "",
  lotClosesAt: undefined as Date | undefined,
  lotSize: "12",
  unitsReserved: "0",
  isPublished: true,
  displayOrder: "0",
};

const LOT_SIZE_OPTIONS = [6, 12, 24] as const;

const AdminPreVendas = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<PresaleProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PresaleProductRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin/login", { replace: true });
    }
  }, [authLoading, user, isAdmin, navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("presale_products")
      .select("*")
      .order("brand", { ascending: true })
      .order("display_order", { ascending: true });
    if (error) toast.error("Erro ao carregar", { description: error.message });
    else setProducts(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (user && isAdmin) fetchProducts();
  }, [user, isAdmin]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: PresaleProductRow) => {
    setEditing(p);
    setForm({
      brand: p.brand as SingleBrand,
      ref: p.ref,
      name: p.name,
      specs: (p.specs ?? []).join(", "),
      description: p.description ?? "",
      imageUrl: p.image_url,
      hoverImageUrl: p.hover_image_url ?? "",
      extraImageUrl: p.extra_image_url ?? "",
      fullPrice: centsToInput(p.full_price_cents),
      depositPrice: centsToInput(p.deposit_price_cents),
      etaDate: p.eta_date ? new Date(`${p.eta_date}T00:00:00`) : undefined,
      lotCode: p.lot_code ?? "",
      lotClosesAt: p.lot_closes_at ? new Date(p.lot_closes_at) : undefined,
      lotSize: String(p.lot_size ?? 12),
      unitsReserved: String(p.units_reserved ?? 0),
      isPublished: p.is_published,
      displayOrder: String(p.display_order ?? 0),
    });
    setDialogOpen(true);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const MAX_BYTES = 25 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      throw new Error(`"${file.name}" tem ${(file.size / 1024 / 1024).toFixed(1)}MB. Máximo 25MB.`);
    }
    const rawExt = file.name.includes(".") ? file.name.split(".").pop() ?? "" : "";
    let ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!ext) {
      const mimeExt = file.type.split("/")[1]?.toLowerCase();
      ext = mimeExt && /^[a-z0-9]+$/.test(mimeExt) ? mimeExt : "jpg";
    }
    if (ext === "heic" || ext === "heif") {
      throw new Error(`"${file.name}" está em formato HEIC (iPhone). Converta para JPG ou PNG antes de enviar.`);
    }
    const path = `presale/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("product-media").upload(path, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
      cacheControl: "3600",
    });
    if (error) throw error;
    const { data } = supabase.storage.from("product-media").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "imageUrl" | "hoverImageUrl" | "extraImageUrl",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, [field]: url }));
      toast.success("Foto enviada");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Falha no upload", { description: msg, duration: 8000 });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (saving || uploading) return;

    const parsed = presaleSchema.safeParse({ brand: form.brand, ref: form.ref, name: form.name });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (!form.imageUrl) {
      toast.error("Envie a foto principal da miniatura");
      return;
    }

    setSaving(true);
    try {
      const specs = form.specs
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const lotSize = parseInt(form.lotSize, 10) || 12;
      const unitsReserved = Math.min(Math.max(parseInt(form.unitsReserved, 10) || 0, 0), lotSize);

      const payload = {
        brand: parsed.data.brand,
        ref: parsed.data.ref,
        name: parsed.data.name,
        specs,
        description: form.description.trim() || null,
        image_url: form.imageUrl,
        hover_image_url: form.hoverImageUrl || null,
        extra_image_url: form.extraImageUrl || null,
        full_price_cents: formatBRLInput(form.fullPrice),
        deposit_price_cents: formatBRLInput(form.depositPrice),
        eta_date: form.etaDate ? format(form.etaDate, "yyyy-MM-dd") : null,
        lot_code: form.lotCode || null,
        lot_closes_at: form.lotClosesAt ? form.lotClosesAt.toISOString() : null,
        lot_size: lotSize,
        units_reserved: unitsReserved,
        is_published: form.isPublished,
        display_order: parseInt(form.displayOrder, 10) || 0,
      };

      const { error } = editing
        ? await supabase.from("presale_products").update(payload).eq("id", editing.id)
        : await supabase.from("presale_products").insert(payload);

      if (error) throw error;

      toast.success(editing ? "Miniatura atualizada" : "Miniatura adicionada à pré-venda");
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await fetchProducts();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Erro ao salvar", { description: msg, duration: 8000 });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("presale_products").delete().eq("id", deleteId);
    if (error) toast.error("Erro ao apagar", { description: error.message });
    else {
      toast.success("Miniatura removida da pré-venda");
      fetchProducts();
    }
    setDeleteId(null);
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
              <span className="ml-2 text-muted-foreground font-semibold">/ ADMIN · PRÉ-VENDAS</span>
            </span>
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4" /> Miniaturas da Garagem
            </Link>
          </Button>
        </div>
      </header>

      <main className="container py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-black uppercase">
              Pré-vendas <span className="text-accent">({products.length})</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Miniaturas exibidas em /pre-vendas e nas páginas de cada marca
            </p>
          </div>
          <Button onClick={openCreate} className="font-bold tracking-wider">
            <Plus className="h-4 w-4" /> NOVA PRÉ-VENDA
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">Nenhuma miniatura de pré-venda cadastrada ainda.</p>
            <Button onClick={openCreate} variant="outline" className="mt-4">
              <Plus className="h-4 w-4" /> Adicionar a primeira
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <article key={p.id} className="rounded-lg border border-border/60 bg-card overflow-hidden flex flex-col">
                <div className="aspect-square bg-black relative">
                  <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                  {!p.is_published && (
                    <span className="absolute top-2 left-2 text-xs bg-background/90 px-2 py-1 rounded">
                      RASCUNHO
                    </span>
                  )}
                  {p.lot_code && (
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold uppercase tracking-wider bg-background/90 px-2 py-1 rounded">
                      {p.lot_code}
                    </span>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{p.brand}</p>
                  <h3 className="font-bold leading-tight">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{p.ref}</p>
                  <p className="text-primary font-extrabold">
                    {(p.full_price_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.units_reserved >= p.lot_size ? (
                      <span className="text-destructive font-semibold">Esgotado — {p.lot_size}/{p.lot_size}</span>
                    ) : (
                      <>{p.units_reserved}/{p.lot_size} unidades reservadas</>
                    )}
                  </p>
                  <div className="mt-auto flex flex-col gap-2 pt-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(p)}>
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleteId(p.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-primary/40 text-primary hover:bg-primary/10"
                      onClick={() => shareOnWhatsApp(p)}
                    >
                      <Share2 className="h-3.5 w-3.5" /> Divulgar no WhatsApp
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar pré-venda" : "Nova pré-venda"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="brand">Marca *</Label>
                <Select value={form.brand} onValueChange={(v: SingleBrand) => setForm({ ...form, brand: v })}>
                  <SelectTrigger id="brand">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAND_OPTIONS.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ref">Referência *</Label>
                <Input
                  id="ref"
                  value={form.ref}
                  onChange={(e) => setForm({ ...form, ref: e.target.value })}
                  placeholder="Ex: Mini GT #642"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome do modelo *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Porsche 911 GT3 RS Weissach"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specs">Especificações (separadas por vírgula)</Label>
              <Input
                id="specs"
                value={form.specs}
                onChange={(e) => setForm({ ...form, specs: e.target.value })}
                placeholder="Chassi de Metal, Pneus de Borracha, Licença Oficial"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional — uma informação por linha)</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={
                  "Sinal de R$20 na reserva e o restante na chegada ao Brasil\n" +
                  "Prazo estimado de entrega: Abril 2027\n" +
                  "Fechamento dessa pré-venda: 24/09\n" +
                  "Pode ser pago mensalmente em 3x 4x 5x 6x até a chegada da miniatura!"
                }
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Cada linha vira uma linha separada na caixinha exibida em /pre-vendas.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="fullPrice">Valor integral (R$)</Label>
                <Input
                  id="fullPrice"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={form.fullPrice}
                  onChange={(e) => setForm({ ...form, fullPrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="depositPrice">Sinal de reserva (R$)</Label>
                <Input
                  id="depositPrice"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={form.depositPrice}
                  onChange={(e) => setForm({ ...form, depositPrice: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Foto principal *</Label>
              {form.imageUrl ? (
                <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded bg-black">
                  <img src={form.imageUrl} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, imageUrl: "" })}
                    className="absolute top-1 right-1 bg-background/90 rounded-full p-1 hover:bg-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex aspect-video w-full max-w-xs items-center justify-center gap-2 rounded border-2 border-dashed border-border hover:border-accent text-xs text-muted-foreground cursor-pointer transition-colors">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Enviar foto
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "imageUrl")} />
                </label>
              )}
            </div>

            <div className="space-y-2">
              <Label>Foto de hover (opcional — some ao passar o mouse)</Label>
              {form.hoverImageUrl ? (
                <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded bg-black">
                  <img src={form.hoverImageUrl} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, hoverImageUrl: "" })}
                    className="absolute top-1 right-1 bg-background/90 rounded-full p-1 hover:bg-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex aspect-video w-full max-w-xs items-center justify-center gap-2 rounded border-2 border-dashed border-border hover:border-accent text-xs text-muted-foreground cursor-pointer transition-colors">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Enviar foto
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "hoverImageUrl")} />
                </label>
              )}
            </div>

            <div className="space-y-2">
              <Label>Foto extra (opcional — 3ª foto, ex: embalagem/blister)</Label>
              {form.extraImageUrl ? (
                <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded bg-black">
                  <img src={form.extraImageUrl} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, extraImageUrl: "" })}
                    className="absolute top-1 right-1 bg-background/90 rounded-full p-1 hover:bg-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex aspect-video w-full max-w-xs items-center justify-center gap-2 rounded border-2 border-dashed border-border hover:border-accent text-xs text-muted-foreground cursor-pointer transition-colors">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Enviar foto
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "extraImageUrl")} />
                </label>
              )}
            </div>

            <div className="rounded border border-border p-3 space-y-3 bg-muted/20">
              <Label className="text-sm font-bold uppercase tracking-wider">Lote &amp; previsão de chegada</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="eta">Previsão de chegada</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="eta"
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !form.etaDate && "text-muted-foreground")}
                      >
                        <CalendarIcon className="h-4 w-4" />
                        {form.etaDate ? format(form.etaDate, "MMMM/yyyy", { locale: ptBR }) : "Selecionar mês"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.etaDate}
                        onSelect={(d) => setForm({ ...form, etaDate: d })}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lotCode">Código do lote (opcional)</Label>
                  <Input
                    id="lotCode"
                    value={form.lotCode}
                    onChange={(e) => setForm({ ...form, lotCode: e.target.value })}
                    placeholder="Ex: LOTE 01"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lotCloses">Encerramento da reserva (para a contagem regressiva)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="lotCloses"
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !form.lotClosesAt && "text-muted-foreground")}
                    >
                      <CalendarIcon className="h-4 w-4" />
                      {form.lotClosesAt ? format(form.lotClosesAt, "PPP", { locale: ptBR }) : "Sem contagem regressiva"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.lotClosesAt}
                      onSelect={(d) => {
                        if (!d) return setForm({ ...form, lotClosesAt: undefined });
                        const withEndOfDay = new Date(d);
                        withEndOfDay.setHours(23, 59, 59, 0);
                        setForm({ ...form, lotClosesAt: withEndOfDay });
                      }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                {form.lotClosesAt && (
                  <Button type="button" size="sm" variant="ghost" onClick={() => setForm({ ...form, lotClosesAt: undefined })}>
                    Remover contagem regressiva
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="lotSize">Tamanho do lote (unidades)</Label>
                  <Select value={form.lotSize} onValueChange={(v) => setForm({ ...form, lotSize: v })}>
                    <SelectTrigger id="lotSize">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LOT_SIZE_OPTIONS.map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} unidades
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitsReserved">Unidades já reservadas</Label>
                  <Input
                    id="unitsReserved"
                    type="number"
                    min={0}
                    max={form.lotSize}
                    value={form.unitsReserved}
                    onChange={(e) => setForm({ ...form, unitsReserved: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Atualize aqui conforme fechar reservas no WhatsApp/Instagram. Ao bater no tamanho do lote, a
                    miniatura aparece como "Encerrada" em /pre-vendas.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="displayOrder">Ordem de exibição</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between rounded border border-border p-3">
                <div>
                  <Label htmlFor="published">Publicar</Label>
                  <p className="text-xs text-muted-foreground">Visível em /pre-vendas</p>
                </div>
                <Switch
                  id="published"
                  checked={form.isPublished}
                  onCheckedChange={(v) => setForm({ ...form, isPublished: v })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || uploading}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover da pré-venda?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPreVendas;
