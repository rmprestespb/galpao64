import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import PasswordInput from "@/components/PasswordInput";

/**
 * Tela aberta pelo link "redefinir senha" que chega por email. O Supabase lê o
 * token da URL, cria uma sessão temporária de recuperação (evento
 * PASSWORD_RECOVERY) e aí aqui a pessoa escolhe a senha nova.
 */
const AdminResetPassword = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setReady(true);
        setChecking(false);
      }
    });
    // Caso o evento já tenha disparado antes desta tela montar.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    // Se em alguns segundos não houver sessão, o link é inválido/expirou.
    const t = setTimeout(() => setChecking(false), 3000);
    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(t);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres");
      return;
    }
    if (password.length > 72) {
      toast.error("Senha muito longa (máx. 72 caracteres)");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não são iguais");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      toast.error("Não foi possível redefinir a senha", { description: error.message });
      return;
    }
    toast.success("Senha redefinida! Você já está logado.");
    navigate("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-lg border border-border/60 bg-card p-8 shadow-lg">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <Flame className="h-7 w-7 text-primary" strokeWidth={2.5} fill="hsl(var(--primary))" />
          <span className="text-primary font-extrabold tracking-[0.18em]">
            GALPÃO <span className="font-black">64</span>
          </span>
        </Link>
        <h1 className="text-2xl font-display font-black uppercase text-center mb-1">
          Nova <span className="text-accent">senha</span>
        </h1>

        {ready ? (
          <>
            <p className="text-center text-sm text-muted-foreground mb-8">Escolha a nova senha do painel</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova senha</Label>
                <PasswordInput
                  id="new-password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Repita a nova senha</Label>
                <PasswordInput
                  id="confirm-password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full font-bold tracking-widest">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                SALVAR NOVA SENHA
              </Button>
            </form>
          </>
        ) : checking ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : (
          <div className="mt-6 space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Este link de redefinição é inválido ou já expirou. Peça um novo na tela de login.
            </p>
            <Button asChild className="w-full font-bold tracking-widest">
              <Link to="/admin/login">VOLTAR AO LOGIN</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminResetPassword;
