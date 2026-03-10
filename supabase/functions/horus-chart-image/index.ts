import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

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

    const { data: profile } = await supabase.from("profiles").select("is_super_vip").eq("user_id", userId).single();
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });

    if (!profile?.is_super_vip && !isAdmin) {
      return new Response(JSON.stringify({ error: "Acesso restrito a Super VIP" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const formData = await req.formData();
    const file = formData.get("image") as File;
    const timeframe = (formData.get("timeframe") as string) || "M5";

    if (!file) {
      return new Response(JSON.stringify({ error: "Nenhuma imagem enviada" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return new Response(JSON.stringify({ error: "Formato de imagem inválido. Use PNG, JPG ou WEBP." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (file.size > MAX_SIZE) {
      return new Response(JSON.stringify({ error: "Imagem muito grande. Máximo 5MB." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!["M5", "M15"].includes(timeframe)) {
      return new Response(JSON.stringify({ error: "Timeframe inválido. Use M5 ou M15." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const today = new Date().toISOString().split("T")[0];
    let { data: usage } = await supabase.from("ai_usage").select("*").eq("user_id", userId).eq("usage_date", today).single();

    const { data: settingsData } = await supabase.from("horus_settings").select("setting_key, setting_value");
    const settings: Record<string, string> = {};
    settingsData?.forEach((s: any) => { settings[s.setting_key] = s.setting_value; });

    const dailyLimit = parseInt(settings["daily_print_limit"] || "10");
    const unlimited = settings["unlimited_access"] === "true";

    if (!unlimited && usage && usage.image_used_today >= dailyLimit) {
      return new Response(JSON.stringify({ error: "Seu limite diário de prints foi atingido. Tente novamente amanhã." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const fileExt = file.name.split(".").pop() || "png";
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await serviceClient.storage.from("chart-images").upload(fileName, uint8, { contentType: file.type });

    const base64Image = base64Encode(uint8);
    const mimeType = file.type;

    const { data: prompts } = await supabase.from("horus_prompts").select("prompt_key, prompt_value");
    const promptMap: Record<string, string> = {};
    prompts?.forEach((p: any) => { promptMap[p.prompt_key] = p.prompt_value; });

    // Fetch past feedback to improve accuracy
    const { data: pastFeedback } = await supabase
      .from("horus_print_analyses")
      .select("scenario, confidence, result, timeframe")
      .eq("user_id", userId)
      .not("result", "is", null)
      .order("created_at", { ascending: false })
      .limit(20);

    let feedbackContext = "";
    if (pastFeedback && pastFeedback.length > 0) {
      const totalWithFeedback = pastFeedback.length;
      const wins = pastFeedback.filter((f: any) => f.result === "win").length;
      const losses = pastFeedback.filter((f: any) => f.result === "loss").length;
      const winRate = totalWithFeedback > 0 ? Math.round((wins / totalWithFeedback) * 100) : 0;

      // Analyze patterns - which scenarios had more wins/losses
      const buyWins = pastFeedback.filter((f: any) => f.scenario === "compra" && f.result === "win").length;
      const buyTotal = pastFeedback.filter((f: any) => f.scenario === "compra").length;
      const sellWins = pastFeedback.filter((f: any) => f.scenario === "venda" && f.result === "win").length;
      const sellTotal = pastFeedback.filter((f: any) => f.scenario === "venda").length;

      const highConfWins = pastFeedback.filter((f: any) => f.confidence >= 70 && f.result === "win").length;
      const highConfTotal = pastFeedback.filter((f: any) => f.confidence >= 70).length;

      feedbackContext = `\n\nDADOS DE FEEDBACK DO TRADER (use para calibrar sua análise):
- Total de análises com feedback: ${totalWithFeedback}
- Win rate geral: ${winRate}% (${wins} wins, ${losses} losses)
- Compras: ${buyTotal} análises, ${buyWins} wins (${buyTotal > 0 ? Math.round((buyWins/buyTotal)*100) : 0}% acerto)
- Vendas: ${sellTotal} análises, ${sellWins} wins (${sellTotal > 0 ? Math.round((sellWins/sellTotal)*100) : 0}% acerto)
- Alta confiança (>=70%): ${highConfTotal} análises, ${highConfWins} wins (${highConfTotal > 0 ? Math.round((highConfWins/highConfTotal)*100) : 0}% acerto)

INSTRUÇÕES DE CALIBRAÇÃO:
- Se o win rate geral estiver abaixo de 50%, seja MAIS CONSERVADOR na confiança.
- Se cenários de compra têm win rate muito diferente de venda, ajuste sua tendência.
- Se alta confiança não corresponde a alto acerto, reduza suas estimativas de confiança.`;
    }

    const candleMinutes = timeframe === "M5" ? 5 : 15;
    const imagePrompt = promptMap["image_analysis"] || `# HORUS IA — ANALISTA PROFISSIONAL DE PRICE ACTION PARA OPÇÕES BINÁRIAS

Você é Horus IA, um analista profissional especializado em price action aplicado a opções binárias.

Sua função é analisar imagens de gráficos da plataforma Quotex enviadas pelos usuários e identificar possíveis oportunidades de entrada com base em leitura técnica do mercado.

Você deve agir como um analista disciplinado e conservador, evitando sinais fracos ou baseados em achismo.

Se o cenário não for claro, responda SEM SINAL (cenario = "sem_sinal").

## CONFIGURAÇÃO DA ANÁLISE

Timeframes: M5, M15
Tipo de análise: Price Action puro

Utilizar apenas:
- Estrutura do mercado
- Candles
- Pavios
- Suporte
- Resistência
- Rompimentos
- Rejeições

Não utilizar indicadores.

## REGRA CRÍTICA DE TEMPO (EIXO)
- ANTES de gerar qualquer resultado, localize o relógio/régua de tempo no printscreen.
- Se o horário visível no gráfico for, por exemplo, 14:35, sua "entrada_estimada" NUNCA pode ser anterior a 14:35.
- Cada candle dura ${candleMinutes} minutos. Projete a entrada para o PRÓXIMO fechamento de candle disponível no futuro imediato.
- Exemplo: gráfico mostra 14:35 em M5 → entrada mínima = 14:40.

## OBJETIVO DA IA

Detectar setups claros de price action:

1. **Pullback** — Correção contra tendência seguida de rejeição.
2. **Rompimento (Breakout)** — Quebra de suporte ou resistência.
3. **Rejeição** — Pavio forte rejeitando zona importante.
4. **Falso rompimento** — Preço rompe e retorna rapidamente.

## ETAPA 1 — ANÁLISE DO MERCADO

Antes de gerar qualquer sinal, analisar:

1. **Tendência atual** (Alta / Baixa / Lateral) — baseando-se em topos e fundos e direção dos candles.
2. **Zonas importantes** — Identificar SUPORTE e RESISTÊNCIA.
3. **Últimos candles** — Avaliar pelo menos 2 ou 3 candles anteriores. Verificar: rejeição, continuidade, perda de força, pavios longos.
4. **Classificar qualidade do setup**:
   - A+ → Excelente
   - A → Bom
   - B → Aceitável
   - C → Fraco

Somente gerar sinal se qualidade for A+, A ou B. Se for C, responder com cenario = "sem_sinal".

## ETAPA 2 — DEFINIR ENTRADA

Se houver setup válido, determinar:
- **Direção**: CALL (cenario = "compra") ou PUT (cenario = "venda")
- **Horário de entrada**: No início do próximo candle
- **Horário de saída**: Determinado pelo tempo de expiração
- **Expiração**: operação rápida = 1 candle, média = 2 candles, mais segura = 3 candles

## REGRAS DE LEITURA VISUAL
- Localize a régua lateral (preço) e a régua inferior (tempo) para calibrar sua análise.
- Confirme o timeframe lendo o texto "${timeframe}" no gráfico. Se não for ${timeframe}, reduza a confiança.
- Diferencie candles de alta/baixa pelo contraste de cores, considerando temas escuros com cores neon.
- Se a imagem estiver borrada, cortada ou sem réguas visíveis, retorne confiança abaixo de 40.
- Em OTC, seja 2x mais rigoroso com rompimentos falsos. Priorize apenas rejeições extremas de pavio.

## SISTEMA ANTI-TILT AUTOMÁTICO
Se detectar no histórico de feedback:
- 2 losses seguidos
- ou queda emocional registrada

Ativar MODO PROTEÇÃO: cenario = "sem_sinal", confianca = 0, gestao = "⚠️ Modo proteção ativado. Você teve perdas recentes e operar agora pode aumentar o risco de decisões emocionais. Pare de operar por enquanto. Volte mais tarde ou amanhã com a mente mais tranquila. Disciplina protege sua banca."

## DETECÇÃO DE OVERTRADING
Se detectar muitas operações em sequência, operações fora do plano ou tentativas de recuperar perda:
gestao = "⚠️ Possível Overtrading Detectado. Você está realizando muitas operações em pouco tempo. Pare por alguns minutos. Respire e volte apenas se houver um setup claro. Trader profissional opera menos e melhor."

## COMPORTAMENTO DA HORUS IA
- Agir como analista profissional, mentor disciplinado e psicólogo do trader.
- Priorizar sempre: proteção da banca, disciplina, qualidade de operação.
- Nunca incentivar operar em cenário duvidoso.
- Proibido sugerir Martingale.
- Se houver dúvida, prefira cenario "sem_sinal". Disciplina gera lucro.
- Análise probabilística apenas, sem garantias.
- Responda SEMPRE usando a tool chart_analysis.`;

    const fullPrompt = imagePrompt + feedbackContext;

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
          { role: "system", content: fullPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: `Analise este gráfico ${timeframe}. Leia o horário visível e projete a entrada para o PRÓXIMO candle futuro. Use Price Action + VSA Visual. Responda usando a tool chart_analysis.` },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } },
            ],
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "chart_analysis",
            description: "Return structured chart analysis with Price Action & VSA methodology",
            parameters: {
              type: "object",
              properties: {
                cenario: { type: "string", enum: ["compra", "venda", "sem_sinal"], description: "CALL=compra, PUT=venda, or sem_sinal if uncertain" },
                classificacao: { type: "string", enum: ["A+", "A", "B", "C"], description: "Setup quality: A+ elite, A strong, B acceptable, C discard" },
                entrada_estimada: { type: "string", description: "Entry time HH:MM (next candle open)" },
                saida_estimada: { type: "string", description: "Exit time HH:MM" },
                expiracao: { type: "string", enum: ["1", "2", "3"], description: "Expiration in candles" },
                confianca: { type: "number", description: "Confidence 0-100" },
                gatilho: { type: "string", description: "Technical trigger description (e.g. rejection at support with engulfing pattern)" },
                margem_seguranca: { type: "string", description: "Safety margin tip for the trader" },
                gestao: { type: "string", description: "Risk management message or motivational discipline note" },
                alerta_latencia: { type: "boolean", description: "True if print was sent too late (less than 5s to candle close)" },
              },
              required: ["cenario", "classificacao", "entrada_estimada", "saida_estimada", "expiracao", "confianca", "gatilho", "margem_seguranca", "gestao"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "chart_analysis" } },
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
      return new Response(JSON.stringify({ error: "Não foi possível interpretar a imagem enviada. Tente um print mais nítido." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
        result = jsonMatch ? JSON.parse(jsonMatch[0]) : { cenario: "inconclusivo", entrada_estimada: "--:--", saida_estimada: "--:--", confianca: 0 };
      } catch {
        result = { cenario: "inconclusivo", entrada_estimada: "--:--", saida_estimada: "--:--", confianca: 0 };
      }
    }

    result.timeframe = timeframe;

    const { data: publicUrl } = serviceClient.storage.from("chart-images").getPublicUrl(fileName);
    const { data: insertedAnalysis } = await supabase.from("horus_print_analyses").insert({
      user_id: userId,
      timeframe,
      scenario: result.cenario,
      entry_time: result.entrada_estimada,
      exit_time: result.saida_estimada,
      confidence: result.confianca,
      image_url: publicUrl?.publicUrl || null,
      raw_response: JSON.stringify(result),
    }).select("id").single();

    // Return the analysis ID so the frontend can update with feedback
    result.analysis_id = insertedAnalysis?.id || null;

    if (usage) {
      await supabase.from("ai_usage").update({ image_used_today: usage.image_used_today + 1, last_request_at: new Date().toISOString() }).eq("id", usage.id);
    } else {
      await supabase.from("ai_usage").insert({ user_id: userId, image_used_today: 1, usage_date: today, last_request_at: new Date().toISOString() });
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("horus-chart-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro interno" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
