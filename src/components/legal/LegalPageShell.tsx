import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * Casca visual compartilhada pelas páginas institucionais/legais (Empresa,
 * Política de Privacidade, Termos de Uso, Termos de Compra) — mesmo tema
 * escuro do resto do site, com Header/Footer padrão e um miolo de texto
 * legível (largura limitada, tipografia maior que o resto do site).
 */
const LegalPageShell = ({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) => (
  <div className="min-h-screen bg-[#09090b] text-white">
    <Header />

    <main className="container max-w-3xl py-10 md:py-16">
      <Link
        to="/pre-vendas"
        className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar
      </Link>

      <h1 className="mt-5 text-2xl font-black uppercase leading-tight tracking-tight md:text-4xl">{title}</h1>
      {subtitle && <p className="mt-3 text-sm leading-relaxed text-white/60">{subtitle}</p>}

      <div className="prose-legal mt-10 space-y-10 text-sm leading-relaxed text-white/70 md:text-[15px]">
        {children}
      </div>
    </main>

    <Footer />
  </div>
);

export const LegalSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <section>
    <h2 className="mb-4 text-base font-black uppercase tracking-wide text-primary md:text-lg">{title}</h2>
    <div className="space-y-3">{children}</div>
  </section>
);

export const LegalItem = ({ id, children }: { id?: string; children: ReactNode }) => (
  <p>
    {id && <span className="mr-1.5 font-bold text-white/90">{id}.</span>}
    {children}
  </p>
);

export const LegalBullets = ({ items }: { items: ReactNode[] }) => (
  <ul className="ml-4 list-disc space-y-1.5 marker:text-primary/70">
    {items.map((it, i) => (
      <li key={i} className="pl-1">
        {it}
      </li>
    ))}
  </ul>
);

export default LegalPageShell;
