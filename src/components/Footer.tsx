import { Link } from "react-router-dom";
import { Disc3 } from "lucide-react";
import galpaoLogo from "@/assets/galpao64-logo.png";
import { WHATSAPP_NUMBER } from "@/data/preVendas";

/**
 * Rodapé compartilhado do site: marca + coluna institucional (empresa,
 * políticas, termos, contato) + a "rodinha" discreta de acesso administrativo
 * (leva pra /admin/login) + crédito da agência.
 *
 * Antes esse rodapé só existia na página Index (Home antiga), que hoje não
 * é mais visitada porque a rota "/" redireciona direto pra /pre-vendas — por
 * isso ele "sumiu" do site. Extraído aqui como componente único pra ficar
 * presente em todas as páginas públicas do fluxo atual.
 */
const INSTITUTIONAL_LINKS = [
  { label: "Empresa", to: "/empresa" },
  { label: "Política de Privacidade", to: "/politica-de-privacidade" },
  { label: "Termos de Uso", to: "/termos-de-uso" },
  { label: "Termos e Condições de Compra", to: "/termos-de-compra" },
  { label: "Contato", href: `https://wa.me/${WHATSAPP_NUMBER}` },
];

const Footer = () => (
  <footer className="border-t border-border/40 py-10 mt-10">
    <div className="container grid gap-10 sm:grid-cols-[auto_1fr_auto] sm:items-start">
      <Link to="/" className="flex items-center gap-2 group">
        <img
          src={galpaoLogo}
          alt="Galpão 64 — A Arte do Diecast"
          className="h-10 w-auto transition-transform group-hover:scale-105 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
        />
      </Link>

      <div className="sm:justify-self-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-foreground/90">Institucional</p>
        <ul className="mt-3 space-y-2">
          {INSTITUTIONAL_LINKS.map((item) => (
            <li key={item.label}>
              {"to" in item ? (
                <Link
                  to={item.to}
                  className="text-xs text-muted-foreground transition-colors hover:text-accent"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground transition-colors hover:text-accent"
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>

      <a
        href="/admin/login"
        aria-label="Acesso administrativo"
        title="Acesso administrativo"
        className="group inline-flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-card transition-all sm:justify-self-end hover:border-accent hover:shadow-glow-cyan"
      >
        <Disc3
          className="h-7 w-7 text-muted-foreground transition-all group-hover:text-accent group-hover:rotate-180 duration-500"
          strokeWidth={2}
        />
      </a>
    </div>

    <div className="container mt-8 flex flex-col items-center gap-2 border-t border-border/20 pt-6 text-center">
      <p className="text-xs text-muted-foreground tracking-wider">
        © {new Date().getFullYear()} GALPÃO 64 · Vitrine de Miniaturas
      </p>
      <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground/80">
        Criado por{" "}
        <a
          href="https://www.kaeth.com.br/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground/90 hover:text-accent transition-colors underline-offset-4 hover:underline"
        >
          Agência Kaeth
        </a>
      </p>
    </div>
  </footer>
);

export default Footer;
