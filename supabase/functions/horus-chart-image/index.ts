import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

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

    // Check Super VIP
    const { data: profile } = await supabase.from("profiles").select("is_super_vip").eq("user_id", userId).single();
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });

    if (!profile?.is_super_vip && !isAdmin) {
      return new Response(JSON.stringify({ error: "Acesso restrito a Super VIP" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Parse form data
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

    // Check daily limit
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

    // Upload image to storage
    const fileExt = file.name.split(".").pop() || "png";
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await serviceClient.storage.from("chart-images").upload(fileName, uint8, { contentType: file.type });

    // Convert to base64 for AI
    const base64Image = base64Encode(uint8);
    const mimeType = file.type;

    // Get prompt from DB
    const { data: prompts } = await supabase.from("horus_prompts").select("prompt_key, prompt_value");
    const promptMap: Record<string, string> = {};
    prompts?.forEach((p: any) => { promptMap[p.prompt_key] = p.prompt_value; });

    const candleMinutes = timeframe === "M5" ? 5 : 15;
    const imagePrompt = promptMap["image_analysis"] || `Você é a Horus IA, analista probabilístico de gráficos de opções binárias no timeframe ${timeframe}.

REGRA CRÍTICA DE TEMPO (AXIS):
- ANTES de gerar qualquer resultado, localize o relógio/régua de tempo no printscreen.
- Se o horário visível no gráfico for, por exemplo, 14:35, sua "entrada_estimada" NUNCA pode ser anterior a 14:35.
- Cada candle dura ${candleMinutes} minutos. Projete a entrada para o PRÓXIMO fechamento de candle disponível no futuro imediato.
- Exemplo: gráfico mostra 14:35 em M5 → entrada mínima = 14:40, saída = 14:45.

REGRAS DE LEITURA VISUAL:
- Localize a régua lateral (preço) e a régua inferior (tempo) para calibrar sua análise.
- Confirme o timeframe lendo o texto "${timeframe}" no gráfico. Se não for ${timeframe}, reduza a confiança.
- Diferencie candles de alta/baixa pelo contraste de cores, considerando temas escuros com cores neon.
- Se a imagem estiver borrada, cortada ou sem réguas visíveis, retorne confiança abaixo de 40.

REGRAS DE RESPOSTA:
- Responda SEMPRE usando a tool chart_analysis
- cenario: "compra" ou "venda"
- entrada_estimada: horário estimado de entrada (formato HH:MM) — SEMPRE no futuro em relação ao gráfico
- saida_estimada: horário estimado de saída (formato HH:MM)
- confianca: número de 0 a 100
- Análise probabilística apenas, sem garantias`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Configuração de IA indisponível" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const model = settings["ia_model"] || "google/gemini-2.5-flash";
    const minConfidence = parseInt(settings["min_confidence"] || "60");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: imagePrompt },
          {
            role: "user",
            content: [
              { type: "text", text: `Analise este gráfico ${timeframe}. Leia o horário visível no gráfico e projete a entrada para o PRÓXIMO candle futuro. Responda usando a tool chart_analysis.` },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } },
            ],
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "chart_analysis",
            description: "Return structured chart analysis",
            parameters: {
              type: "object",
              properties: {
                cenario: { type: "string", enum: ["compra", "venda"] },
                entrada_estimada: { type: "string", description: "Entry time HH:MM" },
                saida_estimada: { type: "string", description: "Exit time HH:MM" },
                confianca: { type: "number", description: "Confidence 0-100" },
              },
              required: ["cenario", "entrada_estimada", "saida_estimada", "confianca"],
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

    // Save to history
    const { data: publicUrl } = serviceClient.storage.from("chart-images").getPublicUrl(fileName);
    await supabase.from("horus_print_analyses").insert({
      user_id: userId,
      timeframe,
      scenario: result.cenario,
      entry_time: result.entrada_estimada,
      exit_time: result.saida_estimada,
      confidence: result.confianca,
      image_url: publicUrl?.publicUrl || null,
      raw_response: JSON.stringify(result),
    });

    // Update usage
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
