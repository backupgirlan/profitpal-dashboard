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

    // Check Super VIP or Admin
    const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", userId).single();
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });

    if (!profile?.is_super_vip && !isAdmin) {
      return new Response(JSON.stringify({ error: "Acesso restrito a Super VIP" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Gather ALL user data
    const [
      { data: trades },
      { data: checkins },
      { data: diary },
      { data: deposits },
      { data: streakData },
      { data: previousAnalyses },
    ] = await Promise.all([
      supabase.from("trades").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(200),
      supabase.from("emotional_checkins").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(30),
      supabase.from("trader_diary").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(30),
      supabase.from("deposits").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
      supabase.from("streaks").select("*").eq("user_id", userId).single(),
      supabase.from("account_analyses").select("score, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(3),
    ]);

    // Calculate metrics
    const totalTrades = trades?.length || 0;
    const wins = trades?.filter((t: any) => t.result === "win").length || 0;
    const losses = trades?.filter((t: any) => t.result === "loss").length || 0;
    const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
    const totalProfit = trades?.reduce((s: number, t: any) => s + (t.profit || 0), 0) || 0;
    const outOfPlan = trades?.filter((t: any) => t.followed_plan === false).length || 0;
    const sorosTrades = trades?.filter((t: any) => t.entry_type === "soros").length || 0;
    const martingaleTrades = trades?.filter((t: any) => t.entry_type === "martingale").length || 0;

    // Consecutive losses analysis
    let maxConsecutiveLosses = 0;
    let currentConsecutive = 0;
    trades?.forEach((t: any) => {
      if (t.result === "loss") { currentConsecutive++; maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentConsecutive); }
      else currentConsecutive = 0;
    });

    // Trading hours analysis
    const hourMap: Record<number, { wins: number; losses: number }> = {};
    trades?.forEach((t: any) => {
      const h = new Date(t.created_at).getHours();
      if (!hourMap[h]) hourMap[h] = { wins: 0, losses: 0 };
      if (t.result === "win") hourMap[h].wins++;
      else hourMap[h].losses++;
    });

    // Best/worst hours
    let bestHour = -1, bestRate = 0, worstHour = -1, worstRate = 100;
    Object.entries(hourMap).forEach(([h, v]) => {
      const total = v.wins + v.losses;
      if (total < 3) return;
      const rate = (v.wins / total) * 100;
      if (rate > bestRate) { bestRate = rate; bestHour = parseInt(h); }
      if (rate < worstRate) { worstRate = rate; worstHour = parseInt(h); }
    });

    // Emotional patterns
    const riskyCheckins = checkins?.filter((c: any) => c.is_risky).length || 0;
    const proceededWhenRisky = checkins?.filter((c: any) => c.is_risky && c.proceeded).length || 0;
    const badSleep = checkins?.filter((c: any) => !c.slept_well).length || 0;
    const recoveringLoss = checkins?.filter((c: any) => c.recovering_loss).length || 0;

    // Diary patterns
    const diaryNotFollowed = diary?.filter((d: any) => !d.followed_plan).length || 0;

    // Weekly/daily profit
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const monthAgo = new Date(now.getTime() - 30 * 86400000);
    const todayProfit = trades?.filter((t: any) => t.trade_date === todayStr).reduce((s: number, t: any) => s + (t.profit || 0), 0) || 0;
    const weekProfit = trades?.filter((t: any) => new Date(t.trade_date || t.created_at) >= weekAgo).reduce((s: number, t: any) => s + (t.profit || 0), 0) || 0;
    const monthProfit = trades?.filter((t: any) => new Date(t.trade_date || t.created_at) >= monthAgo).reduce((s: number, t: any) => s + (t.profit || 0), 0) || 0;

    // Get settings and prompts
    const { data: settingsData } = await supabase.from("horus_settings").select("setting_key, setting_value");
    const settings: Record<string, string> = {};
    settingsData?.forEach((s: any) => { settings[s.setting_key] = s.setting_value; });

    const { data: promptsData } = await supabase.from("horus_prompts").select("prompt_key, prompt_value");
    const promptMap: Record<string, string> = {};
    promptsData?.forEach((p: any) => { promptMap[p.prompt_key] = p.prompt_value; });

    const systemPrompt = promptMap["account_analysis"] || `Você é a Horus IA, analista de performance e comportamento de traders de opções binárias.
Analise TODOS os dados da conta do trader e retorne uma análise completa e profunda.

REGRAS:
- Seja objetivo, profissional e preciso
- Use os dados reais fornecidos
- Não faça promessas de lucro
- Não dê diagnóstico clínico
- Foque em padrões comportamentais, disciplina, gestão e consistência
- Responda via tool call structured output`;

    const userContext = `DADOS COMPLETOS DA CONTA DO TRADER:

📊 BANCA E FINANÇAS:
- Banca atual: R$ ${profile.balance || 0}
- Lucro total: R$ ${profile.total_profit || 0}
- Lucro hoje: R$ ${todayProfit}
- Lucro semana: R$ ${weekProfit}
- Lucro mês: R$ ${monthProfit}
- Depósitos totais: ${deposits?.length || 0}

📈 OPERAÇÕES:
- Total de operações: ${totalTrades}
- Wins: ${wins} | Losses: ${losses}
- Win Rate: ${winRate}%
- Operações fora do plano: ${outOfPlan} (${totalTrades > 0 ? Math.round((outOfPlan / totalTrades) * 100) : 0}%)
- Máximo de losses consecutivos: ${maxConsecutiveLosses}
- Losses consecutivos atuais: ${profile.consecutive_losses || 0}
- Operações Soros: ${sorosTrades} | Martingale: ${martingaleTrades}

⚙️ GESTÃO:
- Stop Loss: ${profile.stop_loss || 0} | Stop Win: ${profile.stop_win || 0}
- Entrada: ${profile.entry_percentage || 2}%
- Modo gestão: ${profile.active_management_mode || "padrão"}
- Soros ativo: ${profile.soros_enabled ? "Sim (nível " + profile.soros_level + ")" : "Não"}

🧠 DISCIPLINA E EMOCIONAL:
- Score de disciplina: ${profile.discipline_score || 0}/100
- Pausa forçada: ${profile.forced_pause_until ? "Sim" : "Não"}
- Streak atual: ${streakData?.streak_atual || 0} dias
- Maior streak: ${streakData?.maior_streak || 0} dias
- Checkins emocionais de risco: ${riskyCheckins}/${checkins?.length || 0}
- Operou em estado de risco: ${proceededWhenRisky} vezes
- Noites mal dormidas: ${badSleep}
- Tentando recuperar loss: ${recoveringLoss} vezes
- Dias sem seguir plano (diário): ${diaryNotFollowed}/${diary?.length || 0}

⏰ HORÁRIOS:
- Melhor horário: ${bestHour >= 0 ? bestHour + "h (" + Math.round(bestRate) + "% WR)" : "dados insuficientes"}
- Pior horário: ${worstHour >= 0 ? worstHour + "h (" + Math.round(worstRate) + "% WR)" : "dados insuficientes"}

📝 DIÁRIO EMOCIONAL RECENTE:
${diary?.slice(0, 5).map((d: any) => `- ${d.entry_date}: Estado=${d.emotional_state || "N/A"}, Plano=${d.followed_plan ? "Sim" : "Não"}, Erros="${d.mistakes || "N/A"}", Lições="${d.lessons || "N/A"}"`).join("\n") || "Sem registros"}

🔄 ANÁLISES ANTERIORES:
${previousAnalyses?.map((a: any) => `- Score: ${a.score}/100 em ${new Date(a.created_at).toLocaleDateString("pt-BR")}`).join("\n") || "Primeira análise"}

Gere a análise completa da conta.`;

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
            name: "account_analysis",
            description: "Return comprehensive account analysis",
            parameters: {
              type: "object",
              properties: {
                score: { type: "integer", description: "Overall account score 0-100" },
                risk_level: { type: "string", enum: ["baixo", "medio", "alto", "critico"] },
                summary: { type: "string", description: "General summary of account behavior" },
                strengths: { type: "array", items: { type: "string" }, description: "What the trader does well" },
                weaknesses: { type: "array", items: { type: "string" }, description: "Main errors and problems" },
                patterns: { type: "array", items: { type: "string" }, description: "Detected behavioral patterns" },
                improvements: { type: "array", items: { type: "string" }, description: "Actionable improvement plan" },
                insights: { type: "array", items: { type: "string" }, description: "Key insights about the account" },
                final_phrase: { type: "string", description: "Strong concluding phrase" },
              },
              required: ["score", "risk_level", "summary", "strengths", "weaknesses", "patterns", "improvements", "insights", "final_phrase"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "account_analysis" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) return new Response(JSON.stringify({ error: "IA temporariamente indisponível. Tente em instantes." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResponse.status === 402) return new Response(JSON.stringify({ error: "Créditos de IA insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
        result = jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 50, risk_level: "medio", summary: content, strengths: [], weaknesses: [], patterns: [], improvements: [], insights: [], final_phrase: "Análise inconclusiva." };
      } catch {
        result = { score: 50, risk_level: "medio", summary: "Não foi possível gerar a análise.", strengths: [], weaknesses: [], patterns: [], improvements: [], insights: [], final_phrase: "Tente novamente." };
      }
    }

    // Save analysis
    await supabase.from("account_analyses").insert({
      user_id: userId,
      score: result.score,
      risk_level: result.risk_level,
      summary: result.summary,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      patterns: result.patterns,
      improvements: result.improvements,
      insights: result.insights,
      final_phrase: result.final_phrase,
      full_response: result,
    });

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("horus-account-analysis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro interno" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
