import { useState, useEffect } from "react";

const IAPreview = ({ segment, name }: { segment?: string; name: string }) => {
  const [msgIdx, setMsgIdx] = useState(0);
  const isWhatsApp = name.toLowerCase().includes("whatsapp");
  const isDashboard = name.toLowerCase().includes("dashboard") || name.toLowerCase().includes("análise") || name.toLowerCase().includes("monitoramento");
  const isCRM = name.toLowerCase().includes("crm") || name.toLowerCase().includes("vendas") || name.toLowerCase().includes("orçamento");

  const messages = [
    { role: "user", text: "Olá, quero saber sobre os serviços" },
    { role: "ai", text: "Olá! 👋 Sou a IA da empresa. Posso ajudá-lo com informações sobre nossos serviços, preços e agendamentos." },
    { role: "user", text: "Qual o preço do plano básico?" },
    { role: "ai", text: "O Plano Básico custa R$ 99/mês e inclui:\n✅ Atendimento 24/7\n✅ Relatórios semanais\n✅ Suporte prioritário" },
    { role: "user", text: "Posso agendar uma demonstração?" },
    { role: "ai", text: "Claro! 📅 Posso agendar para você agora. Os horários disponíveis são:\n• Seg 14h\n• Ter 10h\n• Qua 15h" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIdx(prev => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const visibleMessages = messages.slice(0, msgIdx + 1);

  if (isDashboard) {
    return (
      <div className="w-full h-full pt-7 flex overflow-hidden">
        {/* AI Dashboard */}
        <div className="w-[20%] h-full flex flex-col gap-0.5 p-1 border-r border-border/20" style={{ background: "hsla(222,47%,5%,0.9)" }}>
          <div className="text-[3px] font-bold mb-1 text-neon-cyan/80">🤖 IA Panel</div>
          {["📊 Overview", "📈 Analytics", "🔔 Alertas", "📋 Relatórios", "⚙️ Config"].map((item, i) => (
            <div key={i} className="text-[2.5px] px-0.5 py-0.5 rounded" style={{ background: i === 0 ? "hsla(180,100%,50%,0.1)" : "transparent" }}>{item}</div>
          ))}
        </div>
        <div className="flex-1 p-1.5 space-y-1">
          {/* KPIs with AI insights */}
          <div className="grid grid-cols-3 gap-0.5">
            {[
              { label: "Vendas Hoje", val: "R$ 8.4K", change: "+18%", insight: "🤖 Acima da média" },
              { label: "Conversões", val: "342", change: "+24%", insight: "🤖 Tendência alta" },
              { label: "Score IA", val: "94/100", change: "↑", insight: "🤖 Excelente" },
            ].map((kpi, i) => (
              <div key={i} className="p-1 rounded border border-neon-cyan/10 animate-pulse" style={{ animationDelay: `${i * 200}ms`, animationDuration: "3s" }}>
                <div className="text-[2.5px] text-muted-foreground/40">{kpi.label}</div>
                <div className="text-[5px] font-bold text-foreground/80">{kpi.val}</div>
                <div className="text-[2.5px] text-[hsla(142,71%,45%,0.8)]">{kpi.change}</div>
                <div className="text-[2px] mt-0.5 px-0.5 py-[1px] rounded-full" style={{ background: "hsla(180,100%,50%,0.08)", color: "hsla(180,100%,50%,0.7)" }}>{kpi.insight}</div>
              </div>
            ))}
          </div>
          {/* Real-time chart */}
          <div className="p-1 rounded border border-neon-cyan/10">
            <div className="flex items-center justify-between mb-0.5">
              <div className="text-[3px] font-medium text-foreground/60">📈 Análise em Tempo Real</div>
              <div className="flex items-center gap-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsla(142,71%,45%,0.5)] animate-ping" style={{ animationDuration: "2s" }} />
                <div className="text-[2.5px] text-[hsla(142,71%,45%,0.6)]">AO VIVO</div>
              </div>
            </div>
            <div className="h-8 flex items-end gap-[1px]">
              {Array.from({ length: 20 }).map((_, i) => {
                const h = 30 + Math.sin(i * 0.5 + msgIdx) * 25 + Math.cos(i * 0.3) * 15;
                return (
                  <div key={i} className="flex-1 rounded-t transition-all duration-500" style={{
                    height: `${h}%`,
                    background: `linear-gradient(to top, hsla(180,100%,50%,0.4), hsla(263,70%,50%,0.2))`,
                  }} />
                );
              })}
            </div>
          </div>
          {/* AI Insights */}
          <div className="p-1 rounded border border-neon-purple/10" style={{ background: "hsla(263,70%,50%,0.03)" }}>
            <div className="text-[3px] font-bold text-neon-purple/70 mb-0.5">🧠 Insights da IA</div>
            {[
              "📌 Aumento de 18% nas vendas detectado",
              "⚠️ Estoque baixo: 3 itens para repor",
              "💡 Sugestão: Ativar campanha de e-mail",
            ].map((insight, i) => (
              <div key={i} className="text-[2.5px] text-foreground/50 py-0.5 border-b border-border/5 animate-pulse" style={{ animationDelay: `${i * 400}ms`, animationDuration: "3s" }}>
                {insight}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Chat-based AI preview
  return (
    <div className="w-full h-full pt-7 flex flex-col overflow-hidden" style={{ background: isWhatsApp ? "hsla(142,71%,45%,0.02)" : "hsla(222,47%,5%,0.5)" }}>
      {/* Chat header */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border/20" style={{ background: isWhatsApp ? "hsla(142,71%,45%,0.08)" : "hsla(263,70%,50%,0.08)" }}>
        <div className="w-4 h-4 rounded-full flex items-center justify-center text-[6px]" style={{ background: isWhatsApp ? "hsla(142,71%,45%,0.2)" : "hsla(263,70%,50%,0.2)" }}>
          🤖
        </div>
        <div>
          <div className="text-[4px] font-bold text-foreground/80">{isWhatsApp ? "Assistente WhatsApp" : isCRM ? "Assistente de Vendas" : "Atendimento IA"}</div>
          <div className="flex items-center gap-0.5">
            <div className="w-1 h-1 rounded-full bg-[hsla(142,71%,45%,0.6)] animate-pulse" />
            <div className="text-[2.5px] text-[hsla(142,71%,45%,0.6)]">Online agora</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-1.5 space-y-1 overflow-hidden">
        {visibleMessages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div
              className={`max-w-[80%] px-1.5 py-1 rounded-lg text-[3px] leading-relaxed ${
                msg.role === "user"
                  ? "rounded-br-none"
                  : "rounded-bl-none"
              }`}
              style={{
                background: msg.role === "user"
                  ? (isWhatsApp ? "hsla(142,71%,45%,0.15)" : "hsla(199,89%,48%,0.15)")
                  : "hsla(263,70%,50%,0.1)",
              }}
            >
              <div className="whitespace-pre-line text-foreground/70">{msg.text}</div>
              <div className="text-[2px] text-muted-foreground/30 mt-0.5 text-right">
                {msg.role === "ai" && "🤖 "}{`${9 + Math.floor(i / 2)}:${String(i * 5 + 10).padStart(2, "0")}`}
              </div>
            </div>
          </div>
        ))}
        {/* Typing indicator */}
        <div className="flex justify-start">
          <div className="px-1.5 py-1 rounded-lg rounded-bl-none" style={{ background: "hsla(263,70%,50%,0.1)" }}>
            <div className="flex gap-0.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1 h-1 rounded-full bg-foreground/20 animate-bounce" style={{ animationDelay: `${i * 200}ms` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="flex items-center gap-1 px-1.5 py-1 border-t border-border/20">
        <div className="text-[5px]">😊</div>
        <div className="flex-1 h-3 rounded-full border border-border/20 flex items-center px-1.5">
          <div className="text-[2.5px] text-muted-foreground/30">Digite sua mensagem...</div>
        </div>
        <div className="w-3 h-3 rounded-full flex items-center justify-center text-[5px]" style={{ background: isWhatsApp ? "hsla(142,71%,45%,0.3)" : "hsla(199,89%,48%,0.3)" }}>📤</div>
      </div>
    </div>
  );
};

export default IAPreview;
