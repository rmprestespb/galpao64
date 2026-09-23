import LegalPageShell, { LegalBullets, LegalItem, LegalSection } from "@/components/legal/LegalPageShell";

const TermosUso = () => (
  <LegalPageShell title="Termos e Condições Gerais de Uso" subtitle="GALPÃO 64">
    <LegalSection title="I. Aceitação das Condições">
      <LegalItem id="I.a">
        Ao navegar, acessar, registrar-se ou utilizar qualquer funcionalidade disponibilizada no website oficial do
        GALPÃO 64 (galpao64.com.br), o usuário declara ter lido, compreendido e aceitado integralmente as
        disposições destes Termos e Condições Gerais de Uso.
      </LegalItem>
      <LegalItem id="I.b">
        Caso não concorde com qualquer disposição aqui estabelecida, o usuário deverá interromper imediatamente o
        acesso e a utilização do site.
      </LegalItem>
      <LegalItem id="I.c">
        Todo o conteúdo disponibilizado nesta plataforma encontra-se protegido pela legislação brasileira referente à
        propriedade intelectual, direitos autorais, marcas, patentes e demais normas de proteção de software e
        design.
      </LegalItem>
    </LegalSection>

    <LegalSection title="II. Autorização de Uso do Conteúdo e Propriedade Intelectual">
      <LegalItem id="II.a">
        O GALPÃO 64 concede ao usuário uma autorização limitada, revogável, temporária, não exclusiva e
        intransferível para acessar e visualizar o catálogo de produtos e miniaturas disponibilizados no site
        exclusivamente para fins pessoais e não comerciais.
      </LegalItem>
      <LegalItem id="II.b">
        Essa autorização não implica cessão de propriedade ou transferência de quaisquer direitos sobre os
        conteúdos, artes, renderizações visuais, marcas e códigos do site.
      </LegalItem>
      <LegalItem id="II.c">Fica expressamente vedado ao usuário:</LegalItem>
      <LegalBullets
        items={[
          <>
            <span className="font-semibold text-white/90">II.c.1.</span> Reproduzir, alterar, adaptar, traduzir,
            copiar ou distribuir qualquer elemento visual do site (incluindo cenários da garagem, marcas do Galpão
            64 e fotografias) sem autorização prévia e expressa por escrito do GALPÃO 64.
          </>,
          <>
            <span className="font-semibold text-white/90">II.c.2.</span> Utilizar os materiais, imagens, descrições
            de pré-vendas ou demais recursos do site para atividades comerciais ou promocionais de terceiros sem
            autorização formal.
          </>,
          <>
            <span className="font-semibold text-white/90">II.c.3.</span> Realizar procedimentos de engenharia
            reversa, web scraping, descompilação, desmontagem ou qualquer tentativa de obtenção do código-fonte de
            sistemas ou aplicações vinculadas à plataforma.
          </>,
          <>
            <span className="font-semibold text-white/90">II.c.4.</span> Suprimir, ocultar ou modificar avisos de
            direitos autorais, marcas registradas ou quaisquer identificações de titularidade existentes nos
            conteúdos ou produtos.
          </>,
          <>
            <span className="font-semibold text-white/90">II.c.5.</span> Hospedar, republicar, transmitir ou
            disponibilizar os materiais em plataformas, servidores ou ambientes digitais de terceiros sem
            consentimento prévio.
          </>,
        ]}
      />
      <LegalItem id="II.d">
        O descumprimento de qualquer das disposições acima poderá resultar na suspensão ou cancelamento imediato do
        acesso à conta do usuário, independentemente de aviso prévio, sem prejuízo da adoção das medidas legais e
        compensatórias cabíveis.
      </LegalItem>
    </LegalSection>

    <LegalSection title="III. Declarações e Exclusão de Garantias">
      <LegalItem id="III.a">
        Os conteúdos, informações, produtos, pré-vendas e serviços disponibilizados por meio deste site são
        fornecidos conforme disponíveis no momento do acesso.
      </LegalItem>
      <LegalItem id="III.b">
        O GALPÃO 64 empenha seus melhores esforços para manter a plataforma estável e segura, mas não assegura que o
        funcionamento ocorrerá de forma ininterrupta, totalmente livre de falhas, erros técnicos, indisponibilidades
        temporárias do servidor ou incompatibilidades com determinados equipamentos/navegadores utilizados pelos
        usuários.
      </LegalItem>
      <LegalItem id="III.c">
        Na extensão permitida pela legislação aplicável, ficam excluídas garantias implícitas relacionadas ao
        desempenho ininterrupto de servidores de terceiros ou falhas de conexão de dados por parte do usuário.
      </LegalItem>
    </LegalSection>

    <LegalSection title="IV. Limitação de Responsabilidade">
      <LegalItem id="IV.a">
        O GALPÃO 64, seus administradores, colaboradores, parceiros ou fornecedores não serão responsáveis por
        perdas, prejuízos ou danos incidentais e consequenciais decorrentes de:
      </LegalItem>
      <LegalBullets
        items={[
          <>
            <span className="font-semibold text-white/90">IV.a.1.</span> Impossibilidade temporária de acesso ao
            site decorrente de manutenções técnicas ou quedas de servidores de hospedagem.
          </>,
          <>
            <span className="font-semibold text-white/90">IV.a.2.</span> Inconsistências de conexão de internet ou
            instabilidades em gateways de pagamento do usuário.
          </>,
          <>
            <span className="font-semibold text-white/90">IV.a.3.</span> Utilização inadequada das informações
            cadastrais ou senhas por parte do próprio usuário.
          </>,
          <>
            <span className="font-semibold text-white/90">IV.a.4.</span> Atos praticados por terceiros
            mal-intencionados, como ataques cibernéticos, vírus de computador ou fraudes decorrentes do ambiente do
            dispositivo do usuário.
          </>,
        ]}
      />
    </LegalSection>

    <LegalSection title="V. Informações sobre Produtos, Imagens e Atualizações">
      <LegalItem id="V.a">
        O GALPÃO 64 busca manter as descrições, fotos, escalas (ex.: 1:64), marcas (Mini GT, Pop Race, Tarmac Works,
        Kaido House) e valores de pré-vendas permanentemente precisos e atualizados.
      </LegalItem>
      <LegalItem id="V.b">
        As imagens dos produtos e protótipos de pré-venda têm caráter ilustrativo e demonstrativo. Variações de
        tonalidade, brilho e detalhes finos podem ocorrer em razão das configurações de tela do dispositivo do
        usuário ou ajustes finais de fabricação homologados pelas marcas licenciadas.
      </LegalItem>
      <LegalItem id="V.c">
        As especificações, preços, estoques e previsões de chegada de lotes poderão ser alterados, corrigidos ou
        atualizados a qualquer momento no site, respeitando-se sempre os direitos de pedidos e reservas já
        confirmados financeiramente.
      </LegalItem>
    </LegalSection>

    <LegalSection title="VI. Sites, Recursos e Integrações de Terceiros">
      <LegalItem id="VI.a">
        A plataforma poderá conter integrações, links ou redirecionamentos para serviços de terceiros, tais como
        gateways de processamento de pagamento, ferramentas de cálculo de frete ou redes sociais.
      </LegalItem>
      <LegalItem id="VI.b">
        A presença de tais recursos possui finalidade estritamente operacional para viabilizar as transações e a
        navegação. O GALPÃO 64 não responde pelas políticas de privacidade, termos de uso ou conteúdos mantidos por
        esses serviços externos de terceiros.
      </LegalItem>
      <LegalItem id="VI.c">
        Recomenda-se que o usuário consulte os termos e políticas de cada serviço externo ao ser redirecionado.
      </LegalItem>
    </LegalSection>

    <LegalSection title="VII. Alterações destes Termos">
      <LegalItem id="VII.a">
        O GALPÃO 64 poderá modificar, atualizar ou substituir estes Termos e Condições Gerais de Uso a qualquer
        momento, visando sua adequação legislativa, evolução tecnológica ou ajuste comercial.
      </LegalItem>
      <LegalItem id="VII.b">
        As alterações produzirão efeitos imediatamente após a publicação da nova versão no site oficial
        galpao64.com.br.
      </LegalItem>
      <LegalItem id="VII.c">
        A continuidade de navegação e utilização dos serviços da plataforma após a divulgação das atualizações será
        interpretada como concordância e aceitação tácita do usuário com as novas disposições.
      </LegalItem>
    </LegalSection>

    <LegalSection title="VIII. Legislação Aplicável e Foro Competente">
      <LegalItem id="VIII.a">
        Estes Termos e Condições são interpretados e aplicados em conformidade com a legislação vigente da República
        Federativa do Brasil, em especial o Marco Civil da Internet (Lei nº 12.965/2014) e a Lei Geral de Proteção de
        Dados (Lei nº 13.709/2018).
      </LegalItem>
      <LegalItem id="VIII.b">
        Para dirimir quaisquer dúvidas ou controvérsias decorrentes da utilização do site, as partes elegem o foro do
        domicílio do consumidor (para usuários residentes no Brasil) ou o foro da comarca da sede do GALPÃO 64,
        renúncia feita a qualquer outro, por mais privilegiado que seja.
      </LegalItem>
    </LegalSection>
  </LegalPageShell>
);

export default TermosUso;
