import LegalPageShell from "@/components/legal/LegalPageShell";

const Empresa = () => (
  <LegalPageShell title="Empresa" subtitle="GALPÃO 64 — A Arte do Diecast em Edição Limitada.">
    <p>
      O Galpão 64 nasceu da paixão por detalhes, velocidade e a cultura colecionável em escala 1:64. Somos
      especializados na seleção e garantia de lançamentos internacionais das marcas mais desejadas do mundo diecast:
      Mini GT, Kaido House, Pop Race, Tarmac Works e muito mais.
    </p>

    <div>
      <h2 className="mb-3 text-base font-black uppercase tracking-wide text-primary md:text-lg">
        Como funcionam nossas Pré-Vendas?
      </h2>
      <p>
        Para que você não precise disputar lançamentos concorridos com preços inflacionados no mercado secundário,
        nós abrimos o sistema de Reserva Antecipada de Lotes.
      </p>
      <ul className="mt-4 space-y-3">
        <li className="flex gap-2">
          <span>🔹</span>
          <span>
            <span className="font-semibold text-white/90">Garanta no Lote Oficial:</span> reserve sua unidade antes
            mesmo de ela desembarcar no Brasil.
          </span>
        </li>
        <li className="flex gap-2">
          <span>🔹</span>
          <span>
            <span className="font-semibold text-white/90">Pagamento Flexível:</span> opção de pagamento integral com
            desconto ou sinal de 30% para garantir a vaga e quitar o restante apenas na chegada do produto.
          </span>
        </li>
        <li className="flex gap-2">
          <span>🔹</span>
          <span>
            <span className="font-semibold text-white/90">100% Licenciado &amp; Lacrado:</span> miniaturas com chassi
            de metal, pneus de borracha e acabamento de altíssimo nível de detalhamento.
          </span>
        </li>
      </ul>
    </div>

    <p className="font-semibold text-white/90">
      Garanta a sua peça na garagem do Galpão 64 antes que o lote feche!
    </p>
  </LegalPageShell>
);

export default Empresa;
