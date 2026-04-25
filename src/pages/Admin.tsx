import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CalendarIcon, Flame, Loader2, Lock, LogOut, Pencil, Plus, Trash2, Upload, X, Film, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { PixGeneratorDialog } from "@/components/PixGeneratorDialog";
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

type ProductStatus = "disponivel" | "reservado" | "vendido";

type Product = {
  id: string;
  title: string;
  series: string | null;
  description: string | null;
  rarity: number | null;
  price_cents: number;
  images: string[];
  video_url: string | null;
  is_published: boolean;
  display_order: number;
  status: ProductStatus;
  reservation_started_at: string | null;
};

type Collector = {
  id: string;
  display_name: string;
  city: string;
  state: string;
};

const productSchema = z.object({
  title: z.string().trim().min(1, "Título obrigatório").max(120),
  series: z.string().trim().max(80).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  rarity: z.number().min(0).max(100).optional(),
  price_cents: z.number().min(0).max(100_000_00),
});

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const emptyForm = {
  title: "",
  series: "",
  description: "",
  rarity: "",
  priceReais: "",
  is_published: true,
  images: [] as string[],
  video_url: "" as string,
  status: "disponivel" as ProductStatus,
  collectorId: "" as string, // "" = não vincular
  reservationDate: undefined as Date | undefined,
};

const STATUS_LABEL: Record<ProductStatus, string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  vendido: "Vendido",
};

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
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
      .from("products")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) toast.error("Erro ao carregar", { description: error.message });
    else setProducts((data ?? []) as Product[]);
    setLoading(false);
  };

  const fetchCollectors = async () => {
    const { data, error } = await supabase
      .from("reservation_collectors")
      .select("id, display_name, city, state")
      .order("display_name", { ascending: true });
    if (!error) setCollectors((data ?? []) as Collector[]);
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchProducts();
      fetchCollectors();
    }
  }, [user, isAdmin]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      title: p.title,
      series: p.series ?? "",
      description: p.description ?? "",
      rarity: p.rarity?.toString() ?? "",
      priceReais: (p.price_cents / 100).toString(),
      is_published: p.is_published,
      images: p.images,
      video_url: p.video_url ?? "",
      status: p.status ?? "disponivel",
      collectorId: "",
      reservationDate: p.reservation_started_at ? new Date(p.reservation_started_at) : undefined,
    });
    setDialogOpen(true);
  };

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    kind: "image" | "video",
  ) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `${kind}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage
          .from("product-media")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (error) throw error;
        const { data } = supabase.storage.from("product-media").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      if (kind === "image") {
        setForm((f) => ({ ...f, images: [...f.images, ...uploaded] }));
      } else {
        setForm((f) => ({ ...f, video_url: uploaded[0] }));
      }
      toast.success(kind === "image" ? "Foto(s) enviada(s)" : "Vídeo enviado");
    } catch (err) {
      toast.error("Falha no upload", { description: (err as Error).message });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (url: string) =>
    setForm((f) => ({ ...f, images: f.images.filter((i) => i !== url) }));

  const handleSave = async () => {
    const priceCents = Math.round(parseFloat(form.priceReais || "0") * 100);
    const rarityNum = form.rarity ? parseInt(form.rarity, 10) : undefined;
    const parsed = productSchema.safeParse({
      title: form.title,
      series: form.series,
      description: form.description,
      rarity: rarityNum,
      price_cents: isNaN(priceCents) ? 0 : priceCents,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    // Se status virou "reservado" sem data, define data atual.
    const reservationDate =
      form.status === "reservado"
        ? form.reservationDate ?? new Date()
        : null;

    setSaving(true);
    const payload = {
      title: parsed.data.title,
      series: form.series || null,
      description: form.description || null,
      rarity: rarityNum ?? null,
      price_cents: parsed.data.price_cents,
      images: form.images,
      video_url: form.video_url || null,
      is_published: form.is_published,
      status: form.status,
      reservation_started_at: reservationDate ? reservationDate.toISOString() : null,
    };
    const { error } = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar", { description: error.message });
      return;
    }

    // Se vinculou a um colecionador, cria o item no álbum dele.
    if (form.collectorId && form.images[0]) {
      const { error: itemErr } = await supabase.from("reservation_items").insert({
        collector_id: form.collectorId,
        title: parsed.data.title,
        image_url: form.images[0],
      });
      if (itemErr) {
        toast.warning("Produto salvo, mas falhou ao vincular ao colecionador", {
          description: itemErr.message,
        });
      } else {
        toast.success("Vinculado ao álbum do colecionador");
      }
    }

    toast.success(editing ? "Miniatura atualizada" : "Miniatura adicionada");
    setDialogOpen(false);
    fetchProducts();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("products").delete().eq("id", deleteId);
    if (error) toast.error("Erro ao apagar", { description: error.message });
    else {
      toast.success("Miniatura removida");
      fetchProducts();
    }
    setDeleteId(null);
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
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-primary" strokeWidth={2.5} fill="hsl(var(--primary))" />
            <span className="text-primary font-extrabold tracking-[0.18em] text-sm">
              GALPÃO <span className="font-black">64</span>
              <span className="ml-2 text-muted-foreground font-semibold">/ ADMIN</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <PixGeneratorDialog />
            <Button asChild variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/10">
              <Link to="/admin/recibos">
                <FileText className="h-4 w-4" /> Recibos
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-black uppercase">
              Miniaturas <span className="text-accent">({products.length})</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie o catálogo do Galpão 64
            </p>
          </div>
          <Button onClick={openCreate} className="font-bold tracking-wider">
            <Plus className="h-4 w-4" /> NOVA MINIATURA
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">Nenhuma miniatura cadastrada ainda.</p>
            <Button onClick={openCreate} variant="outline" className="mt-4">
              <Plus className="h-4 w-4" /> Adicionar a primeira
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <article
                key={p.id}
                className="rounded-lg border border-border/60 bg-card overflow-hidden flex flex-col"
              >
                <div className="aspect-square bg-black relative">
                  {p.images[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      sem imagem
                    </div>
                  )}
                  {!p.is_published && (
                    <span className="absolute top-2 left-2 text-xs bg-background/90 px-2 py-1 rounded">
                      RASCUNHO
                    </span>
                  )}
                  {p.status && p.status !== "disponivel" && (
                    <span
                      className={cn(
                        "absolute bottom-2 left-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded backdrop-blur-md border",
                        p.status === "reservado"
                          ? "bg-amber-500/20 text-amber-200 border-amber-400/40"
                          : "bg-red-500/20 text-red-200 border-red-400/40",
                      )}
                    >
                      <Lock className="h-2.5 w-2.5" />
                      {STATUS_LABEL[p.status]}
                    </span>
                  )}
                  {p.video_url && (
                    <span className="absolute top-2 right-2 bg-background/90 p-1.5 rounded">
                      <Film className="h-3 w-3 text-accent" />
                    </span>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col gap-2">
                  <h3 className="font-bold leading-tight">{p.title}</h3>
                  <p className="text-xs text-muted-foreground">{p.series ?? "—"}</p>
                  <p className="text-primary font-extrabold">{formatBRL(p.price_cents)}</p>
                  <div className="flex gap-2 mt-auto pt-3">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(p)}>
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteId(p.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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
            <DialogTitle>
              {editing ? "Editar miniatura" : "Nova miniatura"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: Red Line Club Exclusive"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="series">Série</Label>
                <Input
                  id="series"
                  value={form.series}
                  onChange={(e) => setForm({ ...form, series: e.target.value })}
                  placeholder="Ex: Super Treasure Hunt"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rarity">Raridade (%)</Label>
                <Input
                  id="rarity"
                  type="number"
                  min={0}
                  max={100}
                  value={form.rarity}
                  onChange={(e) => setForm({ ...form, rarity: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min={0}
                value={form.priceReais}
                onChange={(e) => setForm({ ...form, priceReais: e.target.value })}
                placeholder="2600.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Fotos</Label>
              <div className="grid grid-cols-4 gap-2">
                {form.images.map((url) => (
                  <div key={url} className="relative aspect-square rounded overflow-hidden bg-black">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute top-1 right-1 bg-background/90 rounded-full p-1 hover:bg-destructive"
                      aria-label="Remover imagem"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="aspect-square rounded border-2 border-dashed border-border hover:border-accent flex flex-col items-center justify-center text-xs text-muted-foreground cursor-pointer transition-colors">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mb-1" />}
                  <span>Adicionar</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleUpload(e, "image")}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Vídeo</Label>
              {form.video_url ? (
                <div className="flex items-center gap-2 rounded border border-border p-2">
                  <Film className="h-4 w-4 text-accent" />
                  <span className="text-xs flex-1 truncate">{form.video_url}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setForm({ ...form, video_url: "" })}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 rounded border-2 border-dashed border-border hover:border-accent p-4 text-sm text-muted-foreground cursor-pointer transition-colors">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Enviar vídeo (mp4, webm)
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleUpload(e, "video")}
                  />
                </label>
              )}
            </div>

            <div className="flex items-center justify-between rounded border border-border p-3">
              <div>
                <Label htmlFor="published">Publicar na vitrine</Label>
                <p className="text-xs text-muted-foreground">Visível para visitantes</p>
              </div>
              <Switch
                id="published"
                checked={form.is_published}
                onCheckedChange={(v) => setForm({ ...form, is_published: v })}
              />
            </div>

            {/* Reserva / Venda */}
            <div className="space-y-3 rounded border border-border p-3 bg-muted/20">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-accent" />
                <Label className="text-sm font-bold uppercase tracking-wider">
                  Reserva &amp; Venda
                </Label>
              </div>
              <p className="text-xs text-muted-foreground -mt-1">
                Pagamento via PIX direto. Marque o status e (opcionalmente) vincule
                ao álbum de um colecionador.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v: ProductStatus) =>
                      setForm({ ...form, status: v })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disponivel">Disponível</SelectItem>
                      <SelectItem value="reservado">Reservado</SelectItem>
                      <SelectItem value="vendido">Vendido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reservation-date">
                    Início da reserva (90 dias)
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="reservation-date"
                        variant="outline"
                        disabled={form.status !== "reservado"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !form.reservationDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="h-4 w-4" />
                        {form.reservationDate
                          ? format(form.reservationDate, "PPP", { locale: ptBR })
                          : "Hoje (padrão)"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.reservationDate}
                        onSelect={(d) =>
                          setForm({ ...form, reservationDate: d })
                        }
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="collector">Vincular ao álbum (opcional)</Label>
                <Select
                  value={form.collectorId || "none"}
                  onValueChange={(v) =>
                    setForm({ ...form, collectorId: v === "none" ? "" : v })
                  }
                >
                  <SelectTrigger id="collector">
                    <SelectValue placeholder="Nenhum colecionador" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não vincular</SelectItem>
                    {collectors.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.display_name} — {c.city}/{c.state.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.collectorId && (
                  <p className="text-[11px] text-muted-foreground">
                    Ao salvar, esta miniatura será adicionada ao álbum do colecionador
                    selecionado.
                  </p>
                )}
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
            <AlertDialogTitle>Apagar miniatura?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
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

export default Admin;