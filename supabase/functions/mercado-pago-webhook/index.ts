import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();

    // Only handle payment notifications
    if (body.type !== "payment" && body.action !== "payment.updated") {
      return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      return new Response(JSON.stringify({ error: "No payment ID" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    if (!MERCADO_PAGO_ACCESS_TOKEN) {
      console.error("MERCADO_PAGO_ACCESS_TOKEN not set");
      return new Response(JSON.stringify({ error: "Config error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch payment details from Mercado Pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}` },
    });

    if (!mpResponse.ok) {
      const errText = await mpResponse.text();
      console.error("MP fetch error:", mpResponse.status, errText);
      return new Response(JSON.stringify({ error: "Failed to fetch payment" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const payment = await mpResponse.json();
    const userId = payment.external_reference;
    const status = payment.status; // approved, pending, rejected, etc.

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Update subscription status
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    if (status === "approved") {
      // Update subscription
      await supabase.from("super_vip_subscriptions")
        .update({ status: "active", activated_at: now, expires_at: expiresAt })
        .eq("payment_id", String(paymentId));

      // Upgrade user to Super VIP
      await supabase.from("profiles")
        .update({ is_super_vip: true, super_vip_expires_at: expiresAt })
        .eq("user_id", userId);

      console.log(`User ${userId} upgraded to Super VIP`);
    } else {
      // Update subscription status
      await supabase.from("super_vip_subscriptions")
        .update({ status })
        .eq("payment_id", String(paymentId));
    }

    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("webhook error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
