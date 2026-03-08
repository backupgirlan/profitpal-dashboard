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
    const userId = user.id;

    const { emotional_state, mistakes, lessons } = await req.json();

    // Get trader context
    const [{ data: profile }, { data: trades }, { data: recentDiary }, { data: checkins }] = await Promise.all([
      supabase.from("profiles").select("balance, total_profit, discipline_score, consecutive_losses, soros_enabled, soros_level, active_management_mode, stop_loss, stop_win, entry_percentage").eq("user_id", userId).single(),
      supabase.from("trades").select("result, followed_plan, profit, pair_name, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(30),
      supabase.from("trader_diary").select("emotional_state, mistakes, lessons, entry_date").eq("user_id", userId).order("entry_date", { ascending: false }).limit(7),
      supabase.from("emotional_checkins").select("emotional_state, is_risky, slept_well, recovering_loss").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
    ]);

    const totalTrades = trades?.length || 0;
    const wins = trades?.filter((t: any) => t.result === "win").length || 0;
    const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
    const outOfPlan = trades?.filter((t: any) => !t.followed_plan).length || 0;

    const emotionLabels: Record<string, string> = {
      calmo: "Calmo", concentrado: "Concentrado", ansioso: "Ansioso", impulsivo: "Impulsivo",
    };

    const systemPrompt = `Você é a Horus IA, mentora emocional e analista comportamental de traders de opções binárias.
O trader acabou de registrar seu diário emocional do dia. Analise o registro junto com os dados da conta e dê um feedback personalizado.

REGRAS:
- Responda em JSON com as chaves: mensagem (string, 2-4 frases), alerta (string ou null se não houver risco), dica (string, uma dica prática), emoji (string, um emoji que represente o momento)
- Seja direto, empático mas honesto
- Se detectar padrões de risco (ansiedade + losses, impulsividade + operações fora do plano), alerte
- Relacione o estado emocional com a performance real
- Não faça promessas de lucro
- Fale como um mentor experiente`;

    const userContext = `REGISTRO DE HOJE:
- Estado emocional: ${emotionLabels[emotional_state] || emotional_state}
- Erros relatados: ${mistakes || "Nenhum informado"}
- Lições aprendidas: ${lessons || "Nenhuma informada"}

DADOS DA CONTA:
- Banca: R$ ${profile?.balance || 0}
- Lucro total: R$ ${profile?.total_profit || 0}
- Score disciplina: ${profile?.discipline_score || 0}/100
- Losses consecutivos: ${profile?.consecutive_losses || 0}
- Win Rate (últimas 30): ${winRate}% (${wins}W/${totalTrades - wins}L)
- Operações fora do plano: ${outOfPlan}
- Gestão: ${profile?.active_management_mode || "padrão"}

DIÁRIO RECENTE (últimos 7 dias):
${recentDiary?.map((d: any) => `- ${d.entry_date}: ${d.emotional_state || "?"} | Erros: ${d.mistakes || "-"} | Lições: ${d.lessons || "-"}`).join("\n") || "Sem histórico"}

CHECKINS EMOCIONAIS RECENTES:
${checkins?.map((c: any) => `- ${c.emotional_state} (risco=${c.is_risky ? "S" : "N"}, dormiu=${c.slept_well ? "S" : "N"}, recuperando=${c.recovering_loss ? "S" : "N"})`).join("\n") || "Sem checkins"}

Analise e gere o feedback JSON.`;

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
          { role: "user", content: userContext },
        ],
        tools: [{
          type: "function",
          function: {
            name: "diary_feedback",
            description: "Return diary emotional feedback",
            parameters: {
              type: "object",
              properties: {
                mensagem: { type: "string" },
                alerta: { type: "string", description: "Risk alert or null" },
                dica: { type: "string" },
                emoji: { type: "string" },
              },
              required: ["mensagem", "dica", "emoji"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "diary_feedback" } },
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI error:", aiResponse.status, await aiResponse.text());
      return new Response(JSON.stringify({ error: "Horus IA temporariamente indisponível." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await aiResponse.json();
    let result;
    try {
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      result = JSON.parse(toolCall.function.arguments);
    } catch {
      try {
        const content = aiData.choices?.[0]?.message?.content || "";
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        result = jsonMatch ? JSON.parse(jsonMatch[0]) : { mensagem: "Continue registrando seu diário.", alerta: null, dica: "Mantenha a disciplina.", emoji: "📝" };
      } catch {
        result = { mensagem: "Continue registrando seu diário.", alerta: null, dica: "Mantenha a disciplina.", emoji: "📝" };
      }
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("horus-diary-feedback error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro interno" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
