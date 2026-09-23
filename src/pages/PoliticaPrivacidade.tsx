import LegalPageShell, { LegalBullets, LegalItem, LegalSection } from "@/components/legal/LegalPageShell";

const PoliticaPrivacidade = () => (
  <LegalPageShell title="Política de Privacidade e Proteção de Dados" subtitle="GALPÃO 64">
    <p>
      Esta Política de Privacidade foi adotada com o compromisso de dar total transparência e publicidade sobre como
      o GALPÃO 64 realiza o tratamento, a coleta, o armazenamento e a proteção dos dados pessoais e cadastrais dos
      usuários do seu site oficial (galpao64.com.br).
    </p>
    <p>
      Esta política aplica-se exclusivamente ao GALPÃO 64 e não se estende a sites, plataformas ou serviços de
      terceiros que possam ser acessados por meio de links externos existentes em nosso ambiente digital.
    </p>

    <LegalSection title="I. Compromisso com a LGPD e o Marco Civil da Internet">
      <p>
        O GALPÃO 64 atua em estrita conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº
        13.709/2018) e com o Marco Civil da Internet (Lei nº 12.965/2014).
      </p>
      <p className="italic text-white/60">
        "É política do GALPÃO 64 tratar dados pessoais exclusivamente para finalidades legítimas e autorizadas pela
        LGPD (como a execução de contratos de compra/reserva e o cumprimento de obrigações fiscais), sempre
        observando a boa-fé, a transparência, os direitos dos titulares e adotando rígidas medidas de segurança da
        informação."
      </p>
    </LegalSection>

    <LegalSection title="II. Coleta de Dados Pessoais e Cadastrais">
      <p>O GALPÃO 64 coleta informações pessoais necessárias para a prestação de seus serviços quando o usuário:</p>
      <LegalBullets
        items={[
          <>
            <span className="font-semibold text-white/90">Cria uma conta de acesso ou cadastro:</span> nome completo,
            CPF, e-mail, telefone/WhatsApp de contato e endereço de entrega.
          </>,
          <>
            <span className="font-semibold text-white/90">Realiza uma compra ou reserva de pré-venda:</span> dados de
            faturamento, opção de pagamento e histórico de pedidos/lotes garantidos.
          </>,
          <>
            <span className="font-semibold text-white/90">Comunica-se com a equipe de suporte:</span> atendimento via
            chat, e-mail ou WhatsApp.
          </>,
          <>
            <span className="font-semibold text-white/90">Navega pela plataforma:</span> dados de acesso e
            identificação de sessão técnica (cookies).
          </>,
        ]}
      />
    </LegalSection>

    <LegalSection title="III. Uso de Cookies e Dados de Navegação">
      <LegalItem id="III.a">
        O GALPÃO 64 armazena automaticamente dados técnicos de navegação utilizando cookies essenciais para a
        identificação de sessão, manutenção de itens no carrinho de compras e segurança do usuário.
      </LegalItem>
      <LegalItem id="III.b">
        O usuário poderá, a qualquer momento, alterar as configurações de seu navegador de internet para bloquear ou
        recusar a utilização de cookies. No entanto, o bloqueio de cookies essenciais poderá inviabilizar o correto
        funcionamento de algumas funcionalidades do site (como manter a sessão ativa ou concluir pedidos de
        pré-venda).
      </LegalItem>
      <LegalItem id="III.c">
        Em situações extraordinárias de tentativas de fraude, ataques cibernéticos ou violações dos sistemas, os
        logs de acesso poderão ser utilizados de forma individualizada para a elucidação dos fatos e instrução de
        procedimentos legais ou judiciais.
      </LegalItem>
    </LegalSection>

    <LegalSection title="IV. Navegação e Aceite dos Termos">
      <LegalItem id="IV.a">
        O fornecimento de dados pessoais não é um requisito obrigatório para a simples navegação e visualização do
        catálogo de miniaturas e pré-vendas no site.
      </LegalItem>
      <LegalItem id="IV.b">
        No entanto, ao efetuar o cadastro, realizar o pagamento de uma compra/reserva ou solicitar atendimento, o
        usuário concorda expressamente com os termos desta Política de Privacidade e com o tratamento de seus dados
        para o cumprimento dessas finalidades.
      </LegalItem>
    </LegalSection>

    <LegalSection title="V. Segurança da Informação e Armazenamento">
      <LegalItem id="V.a">
        Todas as transações e trocas de informações realizadas no site do GALPÃO 64 utilizam protocolo de
        criptografia padrão da internet (SSL/TLS), trafegando em ambiente seguro.
      </LegalItem>
      <LegalItem id="V.b">
        Os dados são armazenados em infraestrutura de nuvem protegida por rígidos padrões de segurança cibernética,
        incluindo uso de firewalls, redundância de dados, segregação de bases e controle restrito de acesso.
      </LegalItem>
      <LegalItem id="V.c">
        Dados bancários ou números de cartão de crédito digitados no checkout são processados diretamente pelas
        gateways de pagamento homologadas e seguras, não ficando armazenados nos servidores do GALPÃO 64.
      </LegalItem>
    </LegalSection>

    <LegalSection title="VI. Controladoria e Restrição de Acesso">
      <LegalItem id="VI.a">
        O acesso às informações pessoais coletadas é restrito exclusivamente aos colaboradores e prestadores de
        serviços estritamente autorizados e necessários para o processamento, separação, faturamento (emissão de
        NF-e) e despacho logístico das encomendas.
      </LegalItem>
      <LegalItem id="VI.b">
        Qualquer uso indevido ou não autorizado de dados pessoais por agentes internos sujeitará o infrator a sanções
        administrativas, disciplinares e às responsabilizações cíveis e criminais cabíveis.
      </LegalItem>
    </LegalSection>

    <LegalSection title="VII. Direitos dos Titulares de Dados (Art. 18 da LGPD)">
      <p>
        O usuário, na condição de titular dos dados pessoais, poderá a qualquer momento exercer seus direitos perante
        o GALPÃO 64, mediante solicitação formal:
      </p>
      <LegalBullets
        items={[
          <>
            <span className="font-semibold text-white/90">Confirmação e Acesso:</span> confirmar a existência de
            tratamento e acessar os seus dados cadastrais.
          </>,
          <>
            <span className="font-semibold text-white/90">Correção:</span> solicitar a atualização ou correção de
            dados incompletos, inexatos ou desatualizados.
          </>,
          <>
            <span className="font-semibold text-white/90">Anonimização ou Eliminação:</span> solicitar a exclusão ou
            anonimização de dados desnecessários ou tratados em desconformidade com a lei (ressalvadas as hipóteses de
            guarda obrigatória por lei ou regulamento fiscal).
          </>,
          <>
            <span className="font-semibold text-white/90">Revogação do Consentimento:</span> revogar o consentimento
            para o recebimento de comunicações de marketing.
          </>,
        ]}
      />
    </LegalSection>

    <LegalSection title="VIII. Responsabilidade do Usuário">
      <LegalItem id="VIII.a">
        O usuário é o único e exclusivo responsável pela exatidão, veracidade e atualização dos dados pessoais e
        cadastrais informados ao GALPÃO 64.
      </LegalItem>
      <LegalItem id="VIII.b">
        Não poderá ser imputada ao GALPÃO 64 qualquer responsabilidade por atrasos ou falhas na entrega de encomendas
        decorrentes de endereços incorretos ou desatualizados fornecidos pelo próprio consumidor.
      </LegalItem>
    </LegalSection>

    <LegalSection title="IX. Canal de Atendimento e Encarregado de Dados (DPO)">
      <p>
        Em caso de dúvidas sobre esta Política de Privacidade, solicitações de alteração de dados ou exercício de
        direitos previstos na LGPD, entre em contato com a equipe de atendimento do GALPÃO 64:
      </p>
      <LegalBullets
        items={[
          <>
            <span className="font-semibold text-white/90">E-mail de Suporte / Privacidade:</span> contato@galpao64.com.br
          </>,
          <>
            <span className="font-semibold text-white/90">Canal Oficial:</span> galpao64.com.br
          </>,
        ]}
      />
    </LegalSection>
  </LegalPageShell>
);

export default PoliticaPrivacidade;
