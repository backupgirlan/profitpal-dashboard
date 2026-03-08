import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body));

    // Handle both notification formats from Mercado Pago
    if (body.type !== "payment" && body.action !== "payment.updated" && body.action !== "payment.created") {
      console.log("Ignoring non-payment event:", body.type, body.action);
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

    // Fetch payment details from Mercado Pago API
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
    const status = payment.status; // approved, pending, rejected, cancelled, refunded, etc.

    console.log(`Payment ${paymentId} for user ${userId}: status=${status}`);

    if (!userId) {
      console.error("No external_reference (userId) in payment");
      return new Response(JSON.stringify({ error: "No user reference" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    if (status === "approved") {
      // 1. Update subscription to active
      const { error: subError } = await supabase.from("super_vip_subscriptions")
        .update({ status: "active", activated_at: now, expires_at: expiresAt })
        .eq("payment_id", String(paymentId));

      if (subError) console.error("Error updating subscription:", subError);

      // 2. Upgrade user profile to Super VIP
      const { error: profileError } = await supabase.from("profiles")
        .update({ is_super_vip: true, super_vip_expires_at: expiresAt })
        .eq("user_id", userId);

      if (profileError) console.error("Error updating profile:", profileError);

      console.log(`✅ User ${userId} upgraded to Super VIP until ${expiresAt}`);
    } else if (status === "rejected" || status === "cancelled" || status === "refunded") {
      // Update subscription status
      const { error: subError } = await supabase.from("super_vip_subscriptions")
        .update({ status })
        .eq("payment_id", String(paymentId));

      if (subError) console.error("Error updating subscription:", subError);

      // If refunded, revoke Super VIP
      if (status === "refunded") {
        await supabase.from("profiles")
          .update({ is_super_vip: false, super_vip_expires_at: null })
          .eq("user_id", userId);

        console.log(`❌ User ${userId} Super VIP revoked (refund)`);
      }
    } else {
      // pending, in_process, etc.
      await supabase.from("super_vip_subscriptions")
        .update({ status })
        .eq("payment_id", String(paymentId));
    }

    return new Response(JSON.stringify({ received: true, status }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("webhook error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
