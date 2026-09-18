import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BRANDS = ["Mini GT", "Pop Race", "Tarmac Works", "Kaido House"] as const;
type Brand = (typeof BRANDS)[number];

type PresaleProduct = {
  id: string;
  brand: string;
  ref: string;
  name: string;
  specs: string[];
  image_url: string;
  hover_image_url: string | null;
  full_price_cents: number;
  deposit_price_cents: number;
  eta_date: string | null;
  lot_code: string | null;
  lot_closes_at: string | null;
  is_published: boolean;
  display_order: number;
};

const emptyForm = {
  brand: "Mini GT" as Brand,
  ref: "",
  name: "",
  specs: "",
  image_url: "",
  hover_image_url: "",
  full_price: "",
  deposit_price: "",
  eta_date: "",
  lot_code: "",
  lot_closes_at: "",
  is_published: true,
  display_order: "0",
};

const brl = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const parsePrice = (value: string) => {
  const digits = value.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const num = Number.parseFloat(digits);
  return Number.isFinite(num) ? Math.round(num * 100) : 0;
};

const AdminPreVendas = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [items, setItems] = useState<PresaleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PresaleProduct | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin/login", { replace: true });
    }
  }, [authLoading, user, isAdmin, navigate]);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("presale_products")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) {
      toast({ title: "Erro ao carregar", description: error.message, variant: "destructive" });
    } else {
      setItems((data ?? []) as PresaleProduct[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user && isAdmin) void fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin]);

  const grouped = useMemo(() => {
    return BRANDS.map((b) => ({ brand: b, list: items.filter((i) => i.brand === b) }));
  }, [items]);

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm, display_order: String(items.length + 1) });
    setDialogOpen(true);
  };

  const openEdit = (item: PresaleProduct) => {
    setEditing(item);
    setForm({
      brand: (BRANDS.includes(item.brand as Brand) ? item.brand : "Mini GT") as Brand,
      ref: item.ref,
      name: item.name,
      specs: item.specs.join(", "),
      image_url: item.image_url,
      hover_image_url: item.hover_image_url ?? "",
      full_price: (item.full_price_cents / 100).toFixed(2).replace(".", ","),
      deposit_price: (item.deposit_price_cents / 100).toFixed(2).replace(".", ","),
      eta_date: item.eta_date ?? "",
      lot_code: item.lot_code ?? "",
      lot_closes_at: item.lot_closes_at ? item.lot_closes_at.slice(0, 16) : "",
      is_published: item.is_published,
      display_order: String(item.display_order),
    });
    setDialogOpen(true);
  };

  const uploadImage = async (file: File, field: "image_url" | "hover_image_url") => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `presale/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-media").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("product-media").getPublicUrl(path);
      setForm((f) => ({ ...f, [field]: data.publicUrl }));
      toast({ title: "Foto enviada" });
    } catch (err) {
      toast({
        title: "Erro no upload",
        description: err instanceof Error ? err.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.image_url.trim()) {
      toast({
        title: "Dados incompletos",
        description: "Nome e foto principal são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        brand: form.brand,
        ref: form.ref.trim() || form.brand,
        name: form.name.trim(),
        specs: form.specs
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        image_url: form.image_url.trim(),
        hover_image_url: form.hover_image_url.trim() || null,
        full_price_cents: parsePrice(form.full_price),
        deposit_price_cents: parsePrice(form.deposit_price),
        eta_date: form.eta_date || null,
        lot_code: form.lot_code.trim() || null,
        lot_closes_at: form.lot_closes_at ? new Date(form.lot_closes_at).toISOString() : null,
        is_published: form.is_published,
        display_order: Number.parseInt(form.display_order, 10) || 0,
      };

      const { error } = editing
        ? await supabase.from("presale_products").update(payload).eq("id", editing.id).select("id").single()
        : await supabase.from("presale_products").insert(payload).select("id").single();

      if (error) throw error;

      toast({ title: editing ? "Pré-venda atualizada" : "Pré-venda cadastrada" });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await fetchItems();
    } catch (err) {
      toast({
        title: "Erro ao salvar",
        description: err instanceof Error ? err.message : "Tente novamente",
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("presale_products").delete().eq("id", deleteId);
    if (error) {
      toast({ title: "Erro ao apagar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Item removido" });
      await fetchItems();
    }
    setDeleteId(null);
  };

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-card/40 backdrop-blur">
        <div className="container flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Painel
            </Button>
            <div>
              <h1 className="text-lg font-black uppercase tracking-wide">Pré-vendas</h1>
              <p className="text-xs text-muted-foreground">Catálogo exibido em /pre-vendas</p>
            </div>
          </div>
          <Button onClick={openNew}>
            <Plus className="mr-1 h-4 w-4" /> Nova pré-venda
          </Button>
        </div>
      </header>

      <main className="container space-y-10 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          grouped.map(({ brand, list }) => (
            <section key={brand} className="space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">{brand}</h2>
                <span className="text-xs text-muted-foreground">{list.length} item(ns)</span>
              </div>

              {list.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma miniatura cadastrada nesta marca.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((item) => (
                    <article
                      key={item.id}
                      className="flex gap-3 rounded-xl border border-border/60 bg-card/50 p-3"
                    >
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-20 w-24 shrink-0 rounded-lg object-cover"
                        loading="lazy"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {item.ref}
                        </p>
                        <h3 className="truncate text-sm font-bold">{item.name}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {brl(item.full_price_cents)} · sinal {brl(item.deposit_price_cents)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.lot_code ?? "—"} · {item.eta_date ?? "sem previsão"}
                          {item.is_published ? "" : " · oculto"}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <Button size="sm" variant="secondary" onClick={() => openEdit(item)}>
                            <Pencil className="mr-1 h-3 w-3" /> Editar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setDeleteId(item.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ))
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar pré-venda" : "Nova pré-venda"}</DialogTitle>
            <DialogDescription>Os dados aparecem na vitrine de pré-vendas do site.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Marca</Label>
              <Select value={form.brand} onValueChange={(v) => setForm((f) => ({ ...f, brand: v as Brand }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BRANDS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Referência</Label>
              <Input
                value={form.ref}
                onChange={(e) => setForm((f) => ({ ...f, ref: e.target.value }))}
                placeholder="Mini GT #642"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Nome da miniatura</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Porsche 911 GT3 RS Weissach"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Características (separadas por vírgula)</Label>
              <Textarea
                rows={2}
                value={form.specs}
                onChange={(e) => setForm((f) => ({ ...f, specs: e.target.value }))}
                placeholder="Chassi de Metal, Pneus de Borracha, Licença Oficial"
              />
            </div>

            <div className="space-y-2">
              <Label>Valor integral</Label>
              <Input
                value={form.full_price}
                onChange={(e) => setForm((f) => ({ ...f, full_price: e.target.value }))}
                placeholder="189,90"
              />
            </div>

            <div className="space-y-2">
              <Label>Valor do sinal</Label>
              <Input
                value={form.deposit_price}
                onChange={(e) => setForm((f) => ({ ...f, deposit_price: e.target.value }))}
                placeholder="55,00"
              />
            </div>

            <div className="space-y-2">
              <Label>Previsão de entrega</Label>
              <Input
                type="date"
                value={form.eta_date}
                onChange={(e) => setForm((f) => ({ ...f, eta_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Lote</Label>
              <Input
                value={form.lot_code}
                onChange={(e) => setForm((f) => ({ ...f, lot_code: e.target.value }))}
                placeholder="LOTE 01"
              />
            </div>

            <div className="space-y-2">
              <Label>Encerramento do lote</Label>
              <Input
                type="datetime-local"
                value={form.lot_closes_at}
                onChange={(e) => setForm((f) => ({ ...f, lot_closes_at: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Ordem de exibição</Label>
              <Input
                type="number"
                value={form.display_order}
                onChange={(e) => setForm((f) => ({ ...f, display_order: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Foto principal</Label>
              {form.image_url && (
                <img src={form.image_url} alt="" className="h-24 w-full rounded-lg object-cover" />
              )}
              <Input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadImage(file, "image_url");
                  e.target.value = "";
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Foto alternativa (hover)</Label>
              {form.hover_image_url && (
                <img src={form.hover_image_url} alt="" className="h-24 w-full rounded-lg object-cover" />
              )}
              <Input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadImage(file, "hover_image_url");
                  e.target.value = "";
                }}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3 sm:col-span-2">
              <div>
                <Label>Publicar na vitrine</Label>
                <p className="text-xs text-muted-foreground">Desligue para esconder do público.</p>
              </div>
              <Switch
                checked={form.is_published}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_published: v }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || uploading}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar esta pré-venda?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Apagar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPreVendas;
