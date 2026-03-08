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

    // Check Super VIP
    const { data: profile } = await supabase.from("profiles").select("is_super_vip, balance, total_profit, discipline_score, consecutive_losses, soros_enabled, soros_level, stop_loss, stop_win, entry_percentage, active_management_mode").eq("user_id", userId).single();
    
    // Also check admin
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    
    if (!profile?.is_super_vip && !isAdmin) {
      return new Response(JSON.stringify({ error: "Acesso restrito a Super VIP" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Check daily limit
    const today = new Date().toISOString().split("T")[0];
    let { data: usage } = await supabase.from("ai_usage").select("*").eq("user_id", userId).eq("usage_date", today).single();

    // Get limits from settings
    const { data: settingsData } = await supabase.from("horus_settings").select("setting_key, setting_value");
    const settings: Record<string, string> = {};
    settingsData?.forEach((s: any) => { settings[s.setting_key] = s.setting_value; });

    const dailyLimit = parseInt(settings["daily_behavioral_limit"] || "10");
    const unlimited = settings["unlimited_access"] === "true";

    if (!unlimited && usage && usage.behavior_used_today >= dailyLimit) {
      return new Response(JSON.stringify({ error: "Seu limite diário da Horus IA foi atingido. Tente novamente amanhã." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get user data for context
    const { tone, focus, query } = await req.json();

    const [{ data: trades }, { data: checkins }, { data: diary }] = await Promise.all([
      supabase.from("trades").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
      supabase.from("emotional_checkins").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
      supabase.from("trader_diary").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
    ]);

    // Build context
    const totalTrades = trades?.length || 0;
    const wins = trades?.filter((t: any) => t.result === "win").length || 0;
    const losses = trades?.filter((t: any) => t.result === "loss").length || 0;
    const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
    const totalProfit = trades?.reduce((s: number, t: any) => s + (t.profit || 0), 0) || 0;
    const outOfPlan = trades?.filter((t: any) => t.followed_plan === false).length || 0;

    // Get prompt from DB
    const { data: prompts } = await supabase.from("horus_prompts").select("prompt_key, prompt_value");
    const promptMap: Record<string, string> = {};
    prompts?.forEach((p: any) => { promptMap[p.prompt_key] = p.prompt_value; });

    const toneMap: Record<string, string> = {
      acolhedor: "Seja empático e acolhedor, mas honesto.",
      equilibrado: "Seja equilibrado, objetivo e profissional.",
      firme: "Seja direto e firme, sem rodeios.",
      verdade_dura: "Seja brutalmente honesto. Não suavize a verdade.",
    };

    const systemPrompt = promptMap["behavior_system"] || `Você é a Horus IA, analista de performance e comportamento de traders de opções binárias. ${toneMap[tone] || toneMap.equilibrado}

REGRAS:
- Responda SEMPRE em JSON válido com as chaves: resumo, padroes_detectados (array), nivel_risco (baixo/medio/alto), recomendacao
- Seja curto, objetivo e profissional
- Não faça promessas de lucro
- Não dê diagnóstico clínico
- Atue como analista de dados comportamentais
- Análise probabilística apenas`;

    const userContext = `DADOS DO TRADER:
- Banca atual: R$ ${profile.balance || 0}
- Lucro total: R$ ${profile.total_profit || 0}
- Score de disciplina: ${profile.discipline_score || 0}/100
- Losses consecutivos: ${profile.consecutive_losses || 0}
- Total de operações recentes: ${totalTrades}
- Win Rate: ${winRate}%
- Wins: ${wins} | Losses: ${losses}
- Operações fora do plano: ${outOfPlan}
- Modo de gestão: ${profile.active_management_mode || "padrão"}
- Stop Loss: ${profile.stop_loss || 0} | Stop Win: ${profile.stop_win || 0}
- Entrada: ${profile.entry_percentage || 2}%
- Soros ativo: ${profile.soros_enabled ? "Sim (nível " + profile.soros_level + ")" : "Não"}

DIÁRIO EMOCIONAL RECENTE:
${diary?.map((d: any) => `- ${d.entry_date}: Estado=${d.emotional_state || "N/A"}, Seguiu plano=${d.followed_plan ? "Sim" : "Não"}, Erros="${d.mistakes || "N/A"}", Lições="${d.lessons || "N/A"}"`).join("\n") || "Sem registros"}

CHECKINS EMOCIONAIS:
${checkins?.map((c: any) => `- Estado=${c.emotional_state}, Dormiu bem=${c.slept_well ? "S" : "N"}, Recuperando loss=${c.recovering_loss ? "S" : "N"}, Brigou=${c.had_argument ? "S" : "N"}, Risco=${c.is_risky ? "S" : "N"}`).join("\n") || "Sem registros"}

${focus ? `FOCO DA ANÁLISE: ${focus}` : ""}
${query ? `PERGUNTA DO TRADER: ${query}` : ""}

Analise os dados e gere a resposta JSON.`;

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Configuração de IA indisponível" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const model = settings["ia_model"] || "google/gemini-2.5-flash";

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContext },
        ],
        tools: [{
          type: "function",
          function: {
            name: "behavioral_analysis",
            description: "Return structured behavioral analysis",
            parameters: {
              type: "object",
              properties: {
                resumo: { type: "string", description: "Short summary of behavior patterns" },
                padroes_detectados: { type: "array", items: { type: "string" }, description: "List of detected patterns" },
                nivel_risco: { type: "string", enum: ["baixo", "medio", "alto"] },
                recomendacao: { type: "string", description: "Actionable recommendation" },
              },
              required: ["resumo", "padroes_detectados", "nivel_risco", "recomendacao"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "behavioral_analysis" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "IA temporariamente indisponível. Tente novamente em instantes." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "A Horus IA está temporariamente indisponível." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await aiResponse.json();
    let result;
    try {
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      result = JSON.parse(toolCall.function.arguments);
    } catch {
      // Fallback: try content
      try {
        const content = aiData.choices?.[0]?.message?.content || "";
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        result = jsonMatch ? JSON.parse(jsonMatch[0]) : { resumo: content, padroes_detectados: [], nivel_risco: "medio", recomendacao: "Análise inconclusiva." };
      } catch {
        result = { resumo: "Não foi possível gerar a análise.", padroes_detectados: [], nivel_risco: "medio", recomendacao: "Tente novamente." };
      }
    }

    // Save to history
    await supabase.from("horus_analyses").insert({
      user_id: userId,
      analysis_type: "behavioral",
      tone: tone || "equilibrado",
      prompt_used: focus || "geral",
      response: JSON.stringify(result),
    });

    // Update usage
    if (usage) {
      await supabase.from("ai_usage").update({ behavior_used_today: usage.behavior_used_today + 1, last_request_at: new Date().toISOString() }).eq("id", usage.id);
    } else {
      await supabase.from("ai_usage").insert({ user_id: userId, behavior_used_today: 1, usage_date: today, last_request_at: new Date().toISOString() });
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("horus-behavior error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro interno" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
