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

    const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", userId).single();
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });

    if (!profile?.is_super_vip && !isAdmin) {
      return new Response(JSON.stringify({ error: "Acesso restrito a Super VIP" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { message, useContext, tone } = await req.json();
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Mensagem vazia" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Check daily limit
    const today = new Date().toISOString().split("T")[0];
    let { data: usage } = await supabase.from("ai_usage").select("*").eq("user_id", userId).eq("usage_date", today).single();

    const { data: settingsData } = await supabase.from("horus_settings").select("setting_key, setting_value");
    const settings: Record<string, string> = {};
    settingsData?.forEach((s: any) => { settings[s.setting_key] = s.setting_value; });

    const dailyDialogLimit = parseInt(settings["daily_dialog_limit"] || "20");
    const unlimited = settings["unlimited_access"] === "true";

    if (!unlimited && usage && usage.dialog_used_today >= dailyDialogLimit) {
      return new Response(JSON.stringify({ error: "Seu limite diário do Diálogo do Trader foi atingido. Tente novamente amanhã." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Save user message
    await supabase.from("trader_dialog_messages").insert({ user_id: userId, role: "user", content: message.trim() });

    // Get conversation history (last 20 messages)
    const { data: history } = await supabase.from("trader_dialog_messages").select("role, content").eq("user_id", userId).order("created_at", { ascending: false }).limit(20);
    const conversationHistory = (history || []).reverse().map((m: any) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content }));

    // Build context
    let contextBlock = "";
    if (useContext) {
      const [{ data: trades }, { data: checkins }] = await Promise.all([
        supabase.from("trades").select("result, profit, followed_plan, entry_type, trade_date").eq("user_id", userId).order("created_at", { ascending: false }).limit(30),
        supabase.from("emotional_checkins").select("emotional_state, is_risky, recovering_loss, slept_well").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
      ]);

      const totalT = trades?.length || 0;
      const w = trades?.filter((t: any) => t.result === "win").length || 0;
      const wr = totalT > 0 ? Math.round((w / totalT) * 100) : 0;
      const outPlan = trades?.filter((t: any) => !t.followed_plan).length || 0;

      contextBlock = `\n\nCONTEXTO DA CONTA DO TRADER (use para personalizar respostas):
- Banca: R$ ${profile.balance || 0} | Lucro total: R$ ${profile.total_profit || 0}
- Win rate: ${wr}% (${totalT} ops) | Fora do plano: ${outPlan}
- Disciplina: ${profile.discipline_score || 0}/100 | Losses consecutivos: ${profile.consecutive_losses || 0}
- Gestão: ${profile.active_management_mode || "padrão"} | Soros: ${profile.soros_enabled ? "Sim" : "Não"}
- Último estado emocional: ${checkins?.[0]?.emotional_state || "N/A"}
- Recuperando loss: ${checkins?.[0]?.recovering_loss ? "Sim" : "Não"}`;
    }

    const toneMap: Record<string, string> = {
      acolhedor: "Seja empático, acolhedor e encorajador.",
      equilibrado: "Seja equilibrado, objetivo e profissional.",
      firme: "Seja direto e firme, sem rodeios.",
      verdade_dura: "Seja brutalmente honesto. Não suavize nada. Fale a verdade mesmo que doa.",
    };

    const { data: promptsData } = await supabase.from("horus_prompts").select("prompt_key, prompt_value");
    const promptMap: Record<string, string> = {};
    promptsData?.forEach((p: any) => { promptMap[p.prompt_key] = p.prompt_value; });

    const systemPrompt = promptMap["dialog_system"] || `Você é a Horus IA, assistente de performance e comportamento do trader de opções binárias.

${toneMap[tone] || toneMap.equilibrado}

PAPEL:
- Assistente de performance e comportamento do trader
- Analista comportamental
- Mentor de disciplina
- Orientador emocional do trader (NÃO psicólogo clínico)

TEMAS PERMITIDOS:
- Emocional no trading, medo, ganância, impulsividade
- Gerenciamento de banca
- Disciplina e consistência
- Overtrading e controle
- Rotina do trader
- Comportamento após win/loss
- Organização financeira ligada ao trading
- Mercado financeiro (visão comportamental)
- Sinais e estratégia (visão comportamental)

REGRAS:
- Responda de forma clara, útil e profissional
- Não faça promessas de lucro
- Não dê diagnóstico clínico
- Não se apresente como terapeuta ou consultor financeiro licenciado
- Foque em autoconhecimento operacional, disciplina, controle emocional e gestão
- Respostas curtas e objetivas (máximo 3 parágrafos)
- Use markdown para formatação${contextBlock}`;

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
          ...conversationHistory,
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) return new Response(JSON.stringify({ error: "IA temporariamente indisponível. Tente em instantes." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResponse.status === 402) return new Response(JSON.stringify({ error: "Créditos de IA insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      console.error("AI error:", aiResponse.status, await aiResponse.text());
      return new Response(JSON.stringify({ error: "Horus IA temporariamente indisponível." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await aiResponse.json();
    const reply = aiData.choices?.[0]?.message?.content || "Não foi possível gerar resposta.";

    // Save assistant message
    await supabase.from("trader_dialog_messages").insert({ user_id: userId, role: "assistant", content: reply });

    // Update usage
    if (usage) {
      await supabase.from("ai_usage").update({ dialog_used_today: (usage.dialog_used_today || 0) + 1, last_request_at: new Date().toISOString() }).eq("id", usage.id);
    } else {
      await supabase.from("ai_usage").insert({ user_id: userId, dialog_used_today: 1, usage_date: today, last_request_at: new Date().toISOString() });
    }

    return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("horus-trader-dialog error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro interno" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
