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

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Token inválido" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: profile } = await supabase.from("profiles").select("is_super_vip, balance, total_profit, discipline_score, consecutive_losses").eq("user_id", user.id).single();
    const isAdmin = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!profile?.is_super_vip && !isAdmin.data) {
      return new Response(JSON.stringify({ error: "Acesso restrito a Super VIP" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { balance, winRate, avgProfit, opsPerDay, days, conservative, moderate, aggressive, language } = await req.json();

    const isEn = language === 'en';

    const systemPrompt = isEn
      ? `You are Horus AI, a premium trading performance analyst. Analyze the trader's bank simulation data and provide a sophisticated, professional insight. Be concise (2-3 sentences max). Focus on behavior, discipline, and risk management. Never give specific financial advice. Respond in English.`
      : `Você é a Horus IA, uma analista premium de performance de trading. Analise os dados da simulação de banca do trader e forneça um insight sofisticado e profissional. Seja conciso (2-3 frases no máximo). Foque em comportamento, disciplina e gestão de risco. Nunca dê conselho financeiro específico. Responda em português.`;

    const userPrompt = isEn
      ? `Trader simulation data:
- Current balance: $${balance}
- Win rate: ${winRate}%
- Average profit per win: $${avgProfit}
- Operations per day: ${opsPerDay}
- Projection period: ${days} days
- Conservative scenario (WR ${winRate - 10}%): final $${conservative}
- Moderate scenario (WR ${winRate}%): final $${moderate}
- Aggressive scenario (WR ${winRate + 10}%): final $${aggressive}
- Discipline score: ${profile.discipline_score || 'N/A'}
- Consecutive losses: ${profile.consecutive_losses || 0}

Provide a premium analyst insight about what most impacts this trader's projected growth.`
      : `Dados da simulação do trader:
- Banca atual: R$ ${balance}
- Win rate: ${winRate}%
- Lucro médio por win: R$ ${avgProfit}
- Operações por dia: ${opsPerDay}
- Período de projeção: ${days} dias
- Cenário conservador (WR ${winRate - 10}%): final R$ ${conservative}
- Cenário moderado (WR ${winRate}%): final R$ ${moderate}
- Cenário agressivo (WR ${winRate + 10}%): final R$ ${aggressive}
- Score de disciplina: ${profile.discipline_score || 'N/A'}
- Losses consecutivos: ${profile.consecutive_losses || 0}

Forneça um insight de analista premium sobre o que mais impacta o crescimento projetado deste trader.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "IA indisponível" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await aiResponse.json();
    const insight = aiData.choices?.[0]?.message?.content || (isEn ? "Unable to generate analysis at this time." : "Não foi possível gerar a análise neste momento.");

    return new Response(JSON.stringify({ insight }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("simulator analysis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
