import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Flame, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }).max(255),
  password: z.string().min(6, { message: "Senha muito curta" }).max(72),
});

const AdminLogin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    if (!authLoading && user && isAdmin) navigate("/admin", { replace: true });
  }, [authLoading, user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } =
      mode === "signup"
        ? await supabase.auth.signUp({
            email: parsed.data.email,
            password: parsed.data.password,
            options: { emailRedirectTo: `${window.location.origin}/admin` },
          })
        : await supabase.auth.signInWithPassword({
            email: parsed.data.email,
            password: parsed.data.password,
          });
    setSubmitting(false);
    if (error) {
      toast.error(mode === "signup" ? "Falha no cadastro" : "Falha no login", {
        description: error.message,
      });
      return;
    }
    if (mode === "signup") {
      toast.success("Conta criada! Faça login para entrar.");
      setMode("signin");
    } else {
      toast.success("Bem-vindo ao painel");
      navigate("/admin", { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-lg border border-border/60 bg-card p-8 shadow-lg">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8 group">
          <Flame className="h-7 w-7 text-primary" strokeWidth={2.5} fill="hsl(var(--primary))" />
          <span className="text-primary font-extrabold tracking-[0.18em]">
            GALPÃO <span className="font-black">64</span>
          </span>
        </Link>
        <h1 className="text-2xl font-display font-black uppercase text-center mb-1">
          Painel <span className="text-accent">Administrativo</span>
        </h1>
        <p className="text-center text-sm text-muted-foreground mb-8">
          Acesso restrito aos curadores
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full font-bold tracking-widest">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signup" ? "CRIAR CONTA" : "ENTRAR"}
          </Button>
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full text-xs text-muted-foreground hover:text-accent transition-colors"
          >
            {mode === "signin"
              ? "Primeira vez? Criar conta admin"
              : "Já tenho conta · Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;