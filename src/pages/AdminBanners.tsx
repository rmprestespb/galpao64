import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CalendarIcon, Copy, Flame, Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { BannerRow } from "@/hooks/useBanners";
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

type Position = "LEFT" | "RIGHT";

// Páginas que já sabem exibir banner (ver SideBannerLayout). Conforme outras
// páginas (mystery-box, album, no-galpao) ganharem a moldura, é só somar aqui.
const PAGE_OPTIONS: { value: string; label: string }[] = [
  { value: "__all__", label: "Todas as páginas" },
  { value: "pre-vendas", label: "Pré-vendas" },
];

const POSITION_LABEL: Record<Position, string> = { LEFT: "Esquerda", RIGHT: "Direita" };

const bannerSchema = z.object({
  titulo: z.string().trim().min(1, "Título obrigatório").max(80),
  posicao: z.enum(["LEFT", "RIGHT"]),
});

const emptyForm = {
  titulo: "",
  descricao: "",
  imagemUrl: "",
  link: "",
  ctaLabel: "",
  selo: "",
  posicao: "LEFT" as Position,
  pagina: "__all__",
  ordem: "0",
  ativo: true,
  dataInicio: undefined as Date | undefined,
  dataFim: undefined as Date | undefined,
};

const AdminBanners = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [banners, setBanners] = useState<BannerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BannerRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin/login", { replace: true });
    }
  }, [authLoading, user, isAdmin, navigate]);

  const fetchBanners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("posicao", { ascending: true })
      .order("ordem", { ascending: true });
    if (error) toast.error("Erro ao carregar", { description: error.message });
    else setBanners(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (user && isAdmin) fetchBanners();
  }, [user, isAdmin]);

  const openCreate = (position?: Position) => {
    setEditing(null);
    setForm({ ...emptyForm, posicao: position ?? "LEFT" });
    setDialogOpen(true);
  };

  const openEdit = (b: BannerRow) => {
    setEditing(b);
    setForm({
      titulo: b.titulo,
      descricao: b.descricao ?? "",
      imagemUrl: b.imagem_url ?? "",
      link: b.link ?? "",
      ctaLabel: b.cta_label ?? "",
      selo: b.selo ?? "",
      posicao: b.posicao as Position,
      pagina: b.pagina ?? "__all__",
      ordem: String(b.ordem ?? 0),
      ativo: b.ativo,
      dataInicio: b.data_inicio ? new Date(b.data_inicio) : undefined,
      dataFim: b.data_fim ? new Date(b.data_fim) : undefined,
    });
    setDialogOpen(true);
  };

  const openDuplicate = (b: BannerRow) => {
    setEditing(null);
    setForm({
      titulo: `${b.titulo} (cópia)`,
      descricao: b.descricao ?? "",
      imagemUrl: b.imagem_url ?? "",
      link: b.link ?? "",
      ctaLabel: b.cta_label ?? "",
      selo: b.selo ?? "",
      posicao: b.posicao as Position,
      pagina: b.pagina ?? "__all__",
      ordem: String(b.ordem ?? 0),
      ativo: false,
      dataInicio: undefined,
      dataFim: undefined,
    });
    setDialogOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX_BYTES = 25 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      toast.error(`"${file.name}" tem ${(file.size / 1024 / 1024).toFixed(1)}MB. Máximo 25MB.`);
      e.target.value = "";
      return;
    }
    setUploading(true);
    try {
      const rawExt = file.name.includes(".") ? file.name.split(".").pop() ?? "" : "";
      let ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!ext) {
        const mimeExt = file.type.split("/")[1]?.toLowerCase();
        ext = mimeExt && /^[a-z0-9]+$/.test(mimeExt) ? mimeExt : "jpg";
      }
      if (ext === "heic" || ext === "heif") {
        throw new Error(`"${file.name}" está em formato HEIC (iPhone). Converta para JPG ou PNG antes de enviar.`);
      }
      const path = `banners/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("product-media").upload(path, file, {
        contentType: file.type || "image/jpeg",
        upsert: false,
        cacheControl: "3600",
      });
      if (error) throw error;
      const { data } = supabase.storage.from("product-media").getPublicUrl(path);
      setForm((f) => ({ ...f, imagemUrl: data.publicUrl }));
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

    const parsed = bannerSchema.safeParse({ titulo: form.titulo, posicao: form.posicao });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        titulo: parsed.data.titulo,
        descricao: form.descricao.trim() || null,
        imagem_url: form.imagemUrl || null,
        link: form.link.trim() || null,
        cta_label: form.ctaLabel.trim() || null,
        selo: form.selo.trim() || null,
        posicao: parsed.data.posicao,
        pagina: form.pagina === "__all__" ? null : form.pagina,
        ordem: parseInt(form.ordem, 10) || 0,
        ativo: form.ativo,
        data_inicio: form.dataInicio ? form.dataInicio.toISOString() : null,
        data_fim: form.dataFim ? form.dataFim.toISOString() : null,
      };

      const { error } = editing
        ? await supabase.from("banners").update(payload).eq("id", editing.id)
        : await supabase.from("banners").insert(payload);

      if (error) throw error;

      toast.success(editing ? "Banner atualizado" : "Banner criado");
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await fetchBanners();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Erro ao salvar", { description: msg, duration: 8000 });
    } finally {
      setSaving(false);
    }
  };

  const toggleAtivo = async (b: BannerRow) => {
    const { error } = await supabase.from("banners").update({ ativo: !b.ativo }).eq("id", b.id);
    if (error) toast.error("Erro ao atualizar", { description: error.message });
    else fetchBanners();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("banners").delete().eq("id", deleteId);
    if (error) toast.error("Erro ao apagar", { description: error.message });
    else {
      toast.success("Banner removido");
      fetchBanners();
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

  const left = banners.filter((b) => b.posicao === "LEFT");
  const right = banners.filter((b) => b.posicao === "RIGHT");

  const renderColumn = (title: string, position: Position, items: BannerRow[]) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-[0.14em] text-muted-foreground">{title}</h2>
        <Button size="sm" variant="outline" onClick={() => openCreate(position)}>
          <Plus className="h-3.5 w-3.5" /> Novo banner
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          Nenhum banner cadastrado nesse lado ainda.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((b) => (
            <article key={b.id} className="flex gap-3 rounded-lg border border-border/60 bg-card p-3">
              <div className="h-20 w-16 shrink-0 overflow-hidden rounded bg-black">
                {b.imagem_url ? (
                  <img src={b.imagem_url} alt={b.titulo} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                    sem foto
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-bold leading-tight">{b.titulo}</h3>
                  {b.selo && (
                    <span className="shrink-0 rounded-full border border-primary/40 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">
                      {b.selo}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Status: <span className={b.ativo ? "text-emerald-400" : "text-muted-foreground"}>{b.ativo ? "Ativo" : "Inativo"}</span>
                  {" · "}
                  Ordem: {b.ordem}
                  {" · "}
                  {b.pagina ? PAGE_OPTIONS.find((p) => p.value === b.pagina)?.label ?? b.pagina : "Todas as páginas"}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => openEdit(b)}>
                    <Pencil className="h-3 w-3" /> Editar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openDuplicate(b)}>
                    <Copy className="h-3 w-3" /> Duplicar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleAtivo(b)}>
                    {b.ativo ? "Desativar" : "Ativar"}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteId(b.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-primary" strokeWidth={2.5} fill="hsl(var(--primary))" />
            <span className="text-primary font-extrabold tracking-[0.18em] text-sm">
              GALPÃO <span className="font-black">64</span>
              <span className="ml-2 text-muted-foreground font-semibold">/ ADMIN · BANNERS</span>
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
        <div className="mb-8">
          <h1 className="text-3xl font-display font-black uppercase">
            Banners <span className="text-accent">({banners.length})</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Banners verticais exibidos nas laterais das páginas (só aparecem em telas bem largas)
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {renderColumn("Lateral esquerda", "LEFT", left)}
            {renderColumn("Lateral direita", "RIGHT", right)}
          </div>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar banner" : "Novo banner"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder='Ex: "PRÉ-VENDAS ABERTAS"'
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição / subtítulo</Label>
              <Textarea
                id="descricao"
                rows={2}
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Garanta antes de todo mundo."
              />
            </div>

            <div className="space-y-2">
              <Label>Foto</Label>
              {form.imagemUrl ? (
                <div className="relative aspect-[3/4] w-32 overflow-hidden rounded bg-black">
                  <img src={form.imagemUrl} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, imagemUrl: "" }))}
                    className="absolute top-1 right-1 bg-background/90 rounded-full p-1 hover:bg-destructive"
                    aria-label="Remover imagem"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex aspect-[3/4] w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded border-2 border-dashed border-border text-xs text-muted-foreground transition-colors hover:border-accent">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Adicionar
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </label>
              )}
              <p className="text-[11px] text-muted-foreground">
                Sem foto, o banner mostra um fundo texturizado escuro com o título — funciona, mas uma foto de
                campanha fica melhor.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cta">Texto do botão (CTA)</Label>
                <Input
                  id="cta"
                  value={form.ctaLabel}
                  onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                  placeholder="Ver pré-vendas"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="selo">Selo</Label>
                <Input
                  id="selo"
                  value={form.selo}
                  onChange={(e) => setForm({ ...form, selo: e.target.value })}
                  placeholder="NOVIDADE / OFERTA"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link</Label>
              <Input
                id="link"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="/pre-vendas/mini-gt ou https://instagram.com/..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="posicao">Posição *</Label>
                <Select value={form.posicao} onValueChange={(v: Position) => setForm({ ...form, posicao: v })}>
                  <SelectTrigger id="posicao">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(POSITION_LABEL) as Position[]).map((p) => (
                      <SelectItem key={p} value={p}>
                        {POSITION_LABEL[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pagina">Página</Label>
                <Select value={form.pagina} onValueChange={(v) => setForm({ ...form, pagina: v })}>
                  <SelectTrigger id="pagina">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_OPTIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="data-inicio">Início da campanha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="data-inicio"
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !form.dataInicio && "text-muted-foreground")}
                    >
                      <CalendarIcon className="h-4 w-4" />
                      {form.dataInicio ? format(form.dataInicio, "PPP", { locale: ptBR }) : "Sem início definido"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.dataInicio}
                      onSelect={(d) => setForm({ ...form, dataInicio: d })}
                      initialFocus
                      className="pointer-events-auto p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data-fim">Fim da campanha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="data-fim"
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !form.dataFim && "text-muted-foreground")}
                    >
                      <CalendarIcon className="h-4 w-4" />
                      {form.dataFim ? format(form.dataFim, "PPP", { locale: ptBR }) : "Sem fim definido"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.dataFim}
                      onSelect={(d) => setForm({ ...form, dataFim: d })}
                      initialFocus
                      className="pointer-events-auto p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ordem">Ordem de exibição</Label>
              <Input
                id="ordem"
                type="number"
                min={0}
                value={form.ordem}
                onChange={(e) => setForm({ ...form, ordem: e.target.value })}
                className="w-24"
              />
            </div>

            <div className="flex items-center justify-between rounded border border-border p-3">
              <div>
                <Label htmlFor="ativo">Ativo</Label>
                <p className="text-xs text-muted-foreground">Desativado nunca aparece no site, mesmo dentro do período.</p>
              </div>
              <Switch id="ativo" checked={form.ativo} onCheckedChange={(v) => setForm({ ...form, ativo: v })} />
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
            <AlertDialogTitle>Apagar banner?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
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

export default AdminBanners;
