import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const INTEGRAL_DISCOUNT_PCT = 5;
const INFINITEPAY_LINKS_URL = "https://api.checkout.infinitepay.io/links";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Cria o pedido no banco e devolve um link de checkout de verdade da
// InfinitePay (Pix ou cartão em até 12x) — substitui o antigo fluxo de PIX
// manual (cliente mostrava o QR e marcava "já paguei" no próprio formulário,
// sem confirmação real). A confirmação agora chega sozinha via webhook
// (função infinitepay-webhook), assim que o cliente termina de pagar lá.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));

    // Honeypot: campo escondido no formulário que só um bot preencheria.
    if (typeof body.website === "string" && body.website.trim() !== "") {
      return json({ ok: true, checkoutUrl: null });
    }

    const presaleProductId = String(body.presaleProductId ?? "").trim();
    const paymentMode = body.paymentMode === "full" ? "full" : body.paymentMode === "deposit" ? "deposit" : null;
    const customerName = String(body.customerName ?? "").trim().slice(0, 200);
    const customerWhatsapp = String(body.customerWhatsapp ?? "").trim().slice(0, 40);
    const customerEmailRaw = String(body.customerEmail ?? "").trim().slice(0, 200);
    const customerEmail = customerEmailRaw || null;
    // Página pra onde o cliente volta depois de pagar (sem query string) —
    // mandada pelo próprio front, que já sabe em qual marca/produto está.
    const returnUrl = String(body.returnUrl ?? "").trim();

    if (!presaleProductId || !paymentMode || !customerName || !customerWhatsapp || !returnUrl) {
      return json({ error: "Dados obrigatórios faltando" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: product, error: productErr } = await supabase
      .from("presale_products")
      .select("id, brand, ref, name, full_price_cents, deposit_price_cents, is_published")
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

    // Anti-spam simples: bloqueia o mesmo whatsapp gerando 2 checkouts do
    // mesmo produto em menos de 2 minutos (evita duplo-clique e bots básicos).
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

    const { data: settings } = await supabase
      .from("site_settings")
      .select("infinitepay_handle")
      .eq("id", "default")
      .maybeSingle();

    const handle = (settings?.infinitepay_handle ?? "").trim().replace(/^\$/, "");
    if (!handle) {
      return json({ error: "Pagamento ainda não configurado — fale com a gente pelo WhatsApp pra reservar." }, 503);
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
        status: "aguardando_pagamento",
      })
      .select("id")
      .single();

    if (insertErr || !order) {
      return json({ error: "Erro ao salvar o pedido" }, 500);
    }

    const separator = returnUrl.includes("?") ? "&" : "?";
    const redirectUrl = `${returnUrl}${separator}pedido=${order.id}`;
    const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/infinitepay-webhook`;

    let checkoutUrl: string | null = null;
    try {
      const resp = await fetch(INFINITEPAY_LINKS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle,
          items: [
            {
              quantity: 1,
              price: amountCents,
              description: `${product.brand} — ${product.name}`.slice(0, 120),
            },
          ],
          order_nsu: order.id,
          redirect_url: redirectUrl,
          webhook_url: webhookUrl,
          customer: {
            name: customerName,
            phone_number: customerWhatsapp,
            ...(customerEmail ? { email: customerEmail } : {}),
          },
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && typeof data.url === "string" && data.url) {
        checkoutUrl = data.url;
      }
    } catch {
      // rede fora do ar — trata como falha abaixo.
    }

    if (!checkoutUrl) {
      return json({ error: "Não foi possível iniciar o pagamento — tenta de novo em instantes" }, 502);
    }

    const checkoutSlug = checkoutUrl.split("/").filter(Boolean).pop() ?? null;
    await supabase
      .from("presale_orders")
      .update({ checkout_url: checkoutUrl, checkout_slug: checkoutSlug })
      .eq("id", order.id);

    return json({ ok: true, checkoutUrl, orderId: order.id });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
