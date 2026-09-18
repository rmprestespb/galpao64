import { MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/data/preVendas";

const VipWhatsAppBanner = () => {
  const msg = "Olá! Quero entrar na Lista VIP de Lançamentos do Galpão 64 para saber primeiro quando abrirem novos lotes de pré-venda 🚗";
  return (
    <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-white/[0.03] to-[#ff8a3d]/10 p-6 text-center sm:flex-row sm:justify-between sm:text-left md:p-8">
      <div className="flex items-center gap-4">
        <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 sm:flex">
          <MessageCircle className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.14em] text-white">
            Entre no Grupo VIP de Lançamentos
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/60">
            Saiba primeiro quando abrirem novos lotes de pré-venda — vagas costumam esgotar em minutos.
          </p>
        </div>
      </div>
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-black shadow-[0_10px_30px_-10px_rgba(37,211,102,0.7)] transition-all hover:brightness-110 active:scale-[0.98]"
      >
        <MessageCircle className="h-4 w-4" strokeWidth={2.5} />
        Quero entrar na Lista VIP
      </a>
    </div>
  );
};

export default VipWhatsAppBanner;
