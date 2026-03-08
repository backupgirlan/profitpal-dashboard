import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, { global: { headers: { Authorization: authHeader } } });

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Token inválido" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claims.claims.sub as string;
    const userEmail = claims.claims.email as string;

    const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    if (!MERCADO_PAGO_ACCESS_TOKEN) {
      return new Response(JSON.stringify({ error: "Integração de pagamento não configurada. Entre em contato com o suporte." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || supabaseUrl.replace(".supabase.co", ".lovable.app");

    // Create Mercado Pago Pix payment
    const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `${userId}-${Date.now()}`,
      },
      body: JSON.stringify({
        transaction_amount: 29.90,
        description: "Super VIP - Horus IA",
        payment_method_id: "pix",
        payer: {
          email: userEmail,
        },
        notification_url: `${supabaseUrl}/functions/v1/mercado-pago-webhook`,
        external_reference: userId,
      }),
    });

    if (!mpResponse.ok) {
      const errBody = await mpResponse.text();
      console.error("Mercado Pago error:", mpResponse.status, errBody);
      return new Response(JSON.stringify({ error: "Falha ao criar cobrança. Tente novamente." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const mpData = await mpResponse.json();

    const qrCode = mpData.point_of_interaction?.transaction_data?.qr_code;
    const qrCodeBase64 = mpData.point_of_interaction?.transaction_data?.qr_code_base64;
    const ticketUrl = mpData.point_of_interaction?.transaction_data?.ticket_url;

    // Save subscription record
    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await serviceClient.from("super_vip_subscriptions").insert({
      user_id: userId,
      payment_id: String(mpData.id),
      payment_method: "pix",
      status: "pending",
      price: 29.90,
      plan_name: "Super VIP",
    });

    return new Response(JSON.stringify({
      payment_id: mpData.id,
      qr_code: qrCode,
      qr_code_base64: qrCodeBase64,
      ticket_url: ticketUrl,
      status: mpData.status,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("create-pix-payment error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro interno" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
