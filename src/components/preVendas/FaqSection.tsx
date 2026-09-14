import { CalendarClock, PackageSearch, ShieldQuestion } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    q: "Como funciona o pagamento do sinal?",
    a: "Você garante sua vaga no lote pagando um sinal de reserva (normalmente 30% do valor) via PIX. O saldo restante só é cobrado quando o lote físico chega ao Galpão 64, antes do envio da sua miniatura. Se preferir resolver tudo de uma vez, também dá para pagar o valor integral e ainda garantir um desconto exclusivo.",
  },
  {
    q: "O que acontece quando o lote de miniaturas chegar ao Brasil?",
    a: "Assim que o lote físico dá entrada no Galpão 64, conferimos cada peça reservada, avisamos você pelo WhatsApp e organizamos o pagamento do saldo (quando houver) e o envio ou combinamos a retirada.",
  },
  {
    q: "Como acompanhar o status e o envio do meu pedido?",
    a: "Todo o acompanhamento da sua reserva é feito diretamente pelo WhatsApp com a equipe do Galpão 64 — você pode chamar a qualquer momento para saber a fase do lote (produção, trânsito, chegada). Assim que o envio for despachado, te passamos o código de rastreio.",
  },
];

const FaqSection = () => (
  <section className="border-t border-white/[0.06] bg-[#0b0b0d] py-14 md:py-20">
    <div className="container mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
          <ShieldQuestion className="h-3.5 w-3.5" />
          Dúvidas frequentes
        </p>
        <h2 className="mt-2 text-xl font-black uppercase tracking-[0.14em] text-white md:text-2xl">
          Tudo sobre a sua pré-venda
        </h2>
      </div>

      <Accordion type="single" collapsible className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 md:px-6">
        {FAQ_ITEMS.map((item, i) => (
          <AccordionItem key={item.q} value={`item-${i}`} className="border-white/[0.07]">
            <AccordionTrigger className="text-left text-sm font-bold text-white hover:no-underline md:text-base">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-[13px] leading-relaxed text-white/65 md:text-sm">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
          <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
          <p className="text-[12px] leading-relaxed text-white/60">
            Prazos de chegada são estimativas fornecidas pelos fabricantes e podem variar por conta de logística internacional.
          </p>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
          <PackageSearch className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
          <p className="text-[12px] leading-relaxed text-white/60">
            Ainda com dúvidas? Fale direto com a equipe pelo WhatsApp ou Instagram antes de reservar.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default FaqSection;
