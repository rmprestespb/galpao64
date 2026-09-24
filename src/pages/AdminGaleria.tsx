import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowUp, Flame, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { GalpaoPhotoRow } from "@/hooks/useGalpaoPhotos";

/** Opção de pré-venda pra vincular a uma foto — usada só pro texto do select,
 * não precisa de todas as colunas de presale_products. */
type PresaleOption = { id: string; name: string; ref: string; brand: string };

const NONE_VALUE = "none";

/** Extrai uma mensagem legível de qualquer formato de erro (Error nativo,
 * PostgrestError/StorageError do Supabase, que são objetos simples e não
 * "instanceof Error", ou qualquer outra coisa) — sem isso, erros que não são
 * Error nativo caem no "[object Object]" do String() padrão. */
const errorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object") {
    const anyErr = err as Record<string, unknown>;
    if (typeof anyErr.message === "string" && anyErr.message) return anyErr.message;
    if (typeof anyErr.error_description === "string" && anyErr.error_description) return anyErr.error_description;
    try {
      return JSON.stringify(err);
    } catch {
      /* segue pro fallback abaixo */
    }
  }
  return String(err);
};

/**
 * Admin da galeria "No Galpão" (/no-galpao) — upload de fotos reais do espaço
 * e do estoque, com legenda opcional, ordem de exibição e publicar/ocultar.
 * Segue o mesmo bucket de storage ("product-media") e padrão de RLS por
 * has_role() já usados em /admin/pre-vendas.
 */
const AdminGaleria = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [photos, setPhotos] = useState<GalpaoPhotoRow[]>([]);
  const [presaleOptions, setPresaleOptions] = useState<PresaleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [captionDrafts, setCaptionDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin/login", { replace: true });
    }
  }, [authLoading, user, isAdmin, navigate]);

  const fetchPhotos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("galpao_photos")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      toast.error("Erro ao carregar", { description: error.message });
    } else {
      setPhotos(data ?? []);
      setCaptionDrafts(Object.fromEntries((data ?? []).map((p) => [p.id, p.caption ?? ""])));
    }
    setLoading(false);
  };

  const fetchPresaleOptions = async () => {
    const { data, error } = await supabase
      .from("presale_products")
      .select("id, name, ref, brand")
      .order("brand", { ascending: true })
      .order("name", { ascending: true });
    if (!error) setPresaleOptions(data ?? []);
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchPhotos();
      fetchPresaleOptions();
    }
  }, [user, isAdmin]);

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
    const path = `galpao/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("product-media").upload(path, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
      cacheControl: "3600",
    });
    if (error) throw error;
    const { data } = supabase.storage.from("product-media").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const startOrder = photos.length > 0 ? Math.max(...photos.map((p) => p.display_order)) + 1 : 0;
      for (let i = 0; i < files.length; i++) {
        const url = await uploadImage(files[i]);
        const { error } = await supabase.from("galpao_photos").insert({
          image_url: url,
          display_order: startOrder + i,
        });
        if (error) throw error;
      }
      toast.success(files.length > 1 ? `${files.length} fotos enviadas` : "Foto enviada");
      fetchPhotos();
    } catch (err) {
      toast.error("Falha no upload", { description: errorMessage(err), duration: 8000 });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const saveCaption = async (id: string) => {
    setSavingId(id);
    const { error } = await supabase
      .from("galpao_photos")
      .update({ caption: captionDrafts[id]?.trim() || null })
      .eq("id", id);
    setSavingId(null);
    if (error) toast.error("Erro ao salvar legenda", { description: error.message });
    else setPhotos((ps) => ps.map((p) => (p.id === id ? { ...p, caption: captionDrafts[id]?.trim() || null } : p)));
  };

  const linkPresale = async (photoId: string, presaleProductId: string | null) => {
    setLinkingId(photoId);
    const { error } = await supabase
      .from("galpao_photos")
      .update({ presale_product_id: presaleProductId })
      .eq("id", photoId);
    setLinkingId(null);
    if (error) {
      toast.error("Erro ao vincular pré-venda", { description: errorMessage(error) });
      return;
    }
    setPhotos((ps) => ps.map((p) => (p.id === photoId ? { ...p, presale_product_id: presaleProductId } : p)));
  };

  const togglePublished = async (photo: GalpaoPhotoRow) => {
    const { error } = await supabase
      .from("galpao_photos")
      .update({ is_published: !photo.is_published })
      .eq("id", photo.id);
    if (error) {
      toast.error("Erro ao atualizar", { description: error.message });
      return;
    }
    setPhotos((ps) => ps.map((p) => (p.id === photo.id ? { ...p, is_published: !p.is_published } : p)));
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= photos.length) return;
    const a = photos[index];
    const b = photos[target];
    const [{ error: errA }, { error: errB }] = await Promise.all([
      supabase.from("galpao_photos").update({ display_order: b.display_order }).eq("id", a.id),
      supabase.from("galpao_photos").update({ display_order: a.display_order }).eq("id", b.id),
    ]);
    if (errA || errB) {
      toast.error("Erro ao reordenar");
      return;
    }
    fetchPhotos();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("galpao_photos").delete().eq("id", deleteId);
    setDeleteId(null);
    if (error) toast.error("Erro ao remover", { description: error.message });
    else {
      toast.success("Foto removida");
      setPhotos((ps) => ps.filter((p) => p.id !== deleteId));
    }
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
              <span className="ml-2 text-muted-foreground font-semibold">/ ADMIN · NO GALPÃO</span>
            </span>
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4" /> Painel
            </Link>
          </Button>
        </div>
      </header>

      <main className="container py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-black uppercase">
              No Galpão <span className="text-accent">({photos.length})</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Fotos exibidas em /no-galpao — pode enviar várias de uma vez
            </p>
          </div>
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 text-sm font-bold tracking-wider text-primary-foreground transition-colors hover:bg-primary/90">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "ENVIANDO..." : "ENVIAR FOTOS"}
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              className="hidden"
              onChange={handleUpload}
            />
          </label>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : photos.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted-foreground">
            Nenhuma foto cadastrada ainda — envie a primeira acima.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/60 p-3"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-black">
                  <img src={photo.image_url} alt="" className="h-full w-full object-cover" />
                  {!photo.is_published && (
                    <span className="absolute left-2 top-2 rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/70">
                      Oculta
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Legenda (opcional)</Label>
                  <Input
                    value={captionDrafts[photo.id] ?? ""}
                    onChange={(e) => setCaptionDrafts((d) => ({ ...d, [photo.id]: e.target.value }))}
                    onBlur={() => {
                      if ((captionDrafts[photo.id] ?? "") !== (photo.caption ?? "")) saveCaption(photo.id);
                    }}
                    placeholder="Ex: Estoque de Mini GT recém-chegado"
                    disabled={savingId === photo.id}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Vincular a uma pré-venda (opcional)</Label>
                  <Select
                    value={photo.presale_product_id ?? NONE_VALUE}
                    onValueChange={(v) => linkPresale(photo.id, v === NONE_VALUE ? null : v)}
                    disabled={linkingId === photo.id}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Nenhuma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>Nenhuma</SelectItem>
                      {presaleOptions.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.brand} — {p.ref} — {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    Quando o lote encerrar (prazo ou esgotar), a previsão de chegada aparece nessa foto em /no-galpao.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Switch checked={photo.is_published} onCheckedChange={() => togglePublished(photo)} />
                    <span className="text-xs text-muted-foreground">
                      {photo.is_published ? "Publicada" : "Oculta"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={index === photos.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(photo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover essa foto?</AlertDialogTitle>
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

export default AdminGaleria;
