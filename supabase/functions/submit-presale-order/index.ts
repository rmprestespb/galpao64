import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const INTEGRAL_DISCOUNT_PCT = 5;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));

    // Honeypot: campo escondido no formulário que só um bot preencheria.
    if (typeof body.website === "string" && body.website.trim() !== "") {
      // Responde como se tivesse dado certo, sem processar nada — não entrega pro
      // bot que é spam.
      return json({ ok: true, orderId: null });
    }

    const presaleProductId = String(body.presaleProductId ?? "").trim();
    const paymentMode = body.paymentMode === "full" ? "full" : body.paymentMode === "deposit" ? "deposit" : null;
    const customerName = String(body.customerName ?? "").trim().slice(0, 200);
    const customerWhatsapp = String(body.customerWhatsapp ?? "").trim().slice(0, 40);
    const customerEmailRaw = String(body.customerEmail ?? "").trim().slice(0, 200);
    const customerEmail = customerEmailRaw || null;
    const confirmedPayment = body.confirmedPayment === true;

    if (!presaleProductId || !paymentMode || !customerName || !customerWhatsapp) {
      return json({ error: "Dados obrigatórios faltando" }, 400);
    }
    if (!confirmedPayment) {
      return json({ error: "Confirme que o pagamento via PIX foi feito" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: product, error: productErr } = await supabase
      .from("presale_products")
      .select("id, brand, ref, name, full_price_cents, deposit_price_cents, eta_date, lot_code, lot_closes_at, is_published")
      .eq("id", presaleProductId)
      .maybeSingle();

    if (productErr || !product || !product.is_published) {
      return json({ error: "Produto de pré-venda não encontrado" }, 404);
    }

    // Valor sempre calculado aqui a partir do preço real do produto no banco —
    // nunca aceito direto do cliente, pra ninguém conseguir forjar um valor menor.
    const amountCents =
      paymentMode === "full"
        ? Math.round(product.full_price_cents * (1 - INTEGRAL_DISCOUNT_PCT / 100))
        : product.deposit_price_cents;

    // Anti-spam simples: bloqueia o mesmo whatsapp fazendo 2 pedidos do mesmo
    // produto em menos de 2 minutos (evita duplo-clique e bots básicos).
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const { data: recent } = await supabase
      .from("presale_orders")
      .select("id")
      .eq("presale_product_id", presaleProductId)
      .eq("customer_whatsapp", customerWhatsapp)
      .gte("created_at", twoMinutesAgo)
      .limit(1);
    if (recent && recent.length > 0) {
      return json({ error: "Pedido já recebido — aguarde antes de enviar de novo" }, 429);
    }

    const { data: order, error: insertErr } = await supabase
      .from("presale_orders")
      .insert({
        presale_product_id: presaleProductId,
        payment_mode: paymentMode,
        amount_cents: amountCents,
        customer_name: customerName,
        customer_whatsapp: customerWhatsapp,
        customer_email: customerEmail,
        customer_confirmed_payment: confirmedPayment,
      })
      .select("id, created_at")
      .single();

    if (insertErr || !order) {
      return json({ error: "Erro ao salvar o pedido" }, 500);
    }

    // Encaminha pro Google Apps Script (Web App publicado direto na conta Google
    // do Robson) — o script lá cuida de mandar o e-mail e adicionar a linha na
    // planilha. Falha aqui não desfaz o pedido: ele já está salvo no banco e
    // visível em /admin/pedidos de qualquer forma.
    const webhookUrl = Deno.env.get("PEDIDOS_WEBHOOK_URL");
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pedido_id: order.id,
            data_pedido: order.created_at,
            marca: product.brand,
            referencia: product.ref,
            produto: product.name,
            forma_pagamento: paymentMode === "full" ? `Integral (${INTEGRAL_DISCOUNT_PCT}% off)` : "Sinal",
            valor_pago: formatBRL(amountCents),
            preco_total: formatBRL(product.full_price_cents),
            lote: product.lot_code ?? "—",
            previsao_chegada: product.eta_date ?? "—",
            prazo_encerramento_reserva: product.lot_closes_at ?? "—",
            cliente_nome: customerName,
            cliente_whatsapp: customerWhatsapp,
            cliente_email: customerEmail ?? "—",
          }),
        });
      } catch {
        // Ignora erro de rede no webhook — o pedido já foi salvo.
      }
    }

    return json({ ok: true, orderId: order.id, amountCents, amountFormatted: formatBRL(amountCents) });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
