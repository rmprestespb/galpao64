import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const INTEGRAL_DISCOUNT_PCT = 5;
const PAYMENT_CHECK_URL = "https://api.checkout.infinitepay.io/payment_check";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  pix: "Pix",
  credit_card: "Cartão de crédito",
};

// Chamada pela InfinitePay quando um pagamento do Checkout Integrado é
// aprovado. Não vem assinada (a doc deles não menciona verificação por
// secret/assinatura), então em vez de confiar direto no corpo do webhook, a
// gente reconfirma o pagamento chamando o endpoint payment_check da própria
// InfinitePay antes de marcar o pedido como pago — assim um POST forjado pra
// essa URL não consegue confirmar um pedido sozinho.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const orderNsu = String(body.order_nsu ?? "").trim();
    const transactionNsu = String(body.transaction_nsu ?? "").trim();
    const invoiceSlug = String(body.invoice_slug ?? "").trim();

    if (!orderNsu) {
      // Nada pra rastrear — responde 200 pra InfinitePay não ficar retentando.
      return json({ ok: true });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: order, error: orderErr } = await supabase
      .from("presale_orders")
      .select("id, status, presale_product_id, payment_mode, amount_cents, customer_name, customer_whatsapp, customer_email")
      .eq("id", orderNsu)
      .maybeSingle();

    if (orderErr || !order) {
      console.error("infinitepay-webhook: pedido não encontrado", orderNsu);
      return json({ ok: true });
    }

    if (order.status === "confirmado") {
      // Já processado (webhook pode repetir) — responde ok sem fazer de novo.
      return json({ ok: true });
    }

    const { data: settings } = await supabase
      .from("site_settings")
      .select("infinitepay_handle")
      .eq("id", "default")
      .maybeSingle();
    const handle = (settings?.infinitepay_handle ?? "").trim().replace(/^\$/, "");

    let verified: { paid: boolean; paid_amount?: number; installments?: number; capture_method?: string } | null = null;
    try {
      const resp = await fetch(PAYMENT_CHECK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, order_nsu: orderNsu, transaction_nsu: transactionNsu, slug: invoiceSlug }),
      });
      verified = await resp.json().catch(() => null);
    } catch (e) {
      console.error("infinitepay-webhook: falha ao chamar payment_check", e);
      // Falha de rede — pede pra InfinitePay tentar de novo mais tarde.
      return json({ error: "payment_check indisponível" }, 400);
    }

    if (!verified || verified.paid !== true) {
      console.error("infinitepay-webhook: payment_check não confirmou pagamento", orderNsu, verified);
      return json({ ok: true });
    }

    const paidAmountCents = verified.paid_amount ?? Number(body.paid_amount) ?? order.amount_cents;
    const installments = verified.installments ?? Number(body.installments) ?? 1;
    const captureMethod = verified.capture_method ?? String(body.capture_method ?? "");
    const receiptUrl = typeof body.receipt_url === "string" ? body.receipt_url : null;

    await supabase
      .from("presale_orders")
      .update({
        status: "confirmado",
        payment_method: captureMethod || null,
        installments,
        paid_amount_cents: paidAmountCents,
        checkout_slug: invoiceSlug || null,
        transaction_nsu: transactionNsu || null,
        receipt_url: receiptUrl,
      })
      .eq("id", order.id);

    // Encaminha pro Google Apps Script (mesmo webhook usado antes no fluxo de
    // PIX manual) — agora disparado quando o pagamento é confirmado de
    // verdade, não mais quando o cliente só declara que pagou.
    const webhookUrl = Deno.env.get("PEDIDOS_WEBHOOK_URL");
    if (webhookUrl) {
      try {
        const { data: product } = await supabase
          .from("presale_products")
          .select("brand, ref, name, full_price_cents, eta_date, lot_code, lot_closes_at")
          .eq("id", order.presale_product_id)
          .maybeSingle();

        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pedido_id: order.id,
            data_pedido: new Date().toISOString(),
            marca: product?.brand ?? "—",
            referencia: product?.ref ?? "—",
            produto: product?.name ?? "—",
            forma_pagamento:
              order.payment_mode === "full" ? `Integral (${INTEGRAL_DISCOUNT_PCT}% off)` : "Sinal",
            metodo_pagamento:
              captureMethod === "credit_card" && installments > 1
                ? `Cartão em ${installments}x`
                : PAYMENT_METHOD_LABEL[captureMethod] ?? captureMethod ?? "—",
            valor_pago: formatBRL(paidAmountCents),
            preco_total: product ? formatBRL(product.full_price_cents) : "—",
            lote: product?.lot_code ?? "—",
            previsao_chegada: product?.eta_date ?? "—",
            prazo_encerramento_reserva: product?.lot_closes_at ?? "—",
            cliente_nome: order.customer_name,
            cliente_whatsapp: order.customer_whatsapp,
            cliente_email: order.customer_email ?? "—",
            comprovante: receiptUrl ?? "—",
          }),
        });
      } catch {
        // Ignora erro de rede no webhook — o pedido já está confirmado no banco.
      }
    }

    return json({ ok: true });
  } catch (e) {
    console.error("infinitepay-webhook: erro inesperado", e);
    return json({ error: (e as Error).message }, 500);
  }
});
