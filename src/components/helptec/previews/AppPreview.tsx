import { useState } from "react";

const colorSchemes = [
  { primary: "hsla(263,70%,50%,0.5)", bg: "hsla(263,70%,50%,0.08)", accent: "hsla(180,100%,50%,0.3)" },
  { primary: "hsla(199,89%,48%,0.5)", bg: "hsla(199,89%,48%,0.08)", accent: "hsla(263,70%,50%,0.3)" },
  { primary: "hsla(142,71%,45%,0.5)", bg: "hsla(142,71%,45%,0.08)", accent: "hsla(199,89%,48%,0.3)" },
  { primary: "hsla(0,84%,60%,0.5)", bg: "hsla(0,84%,60%,0.08)", accent: "hsla(263,70%,50%,0.3)" },
];

const AppPreview = ({ segment, name }: { segment?: string; name: string }) => {
  const [colorIdx] = useState(() => Math.abs(name.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % colorSchemes.length);
  const c = colorSchemes[colorIdx];

  const isDelivery = name.toLowerCase().includes("delivery") || name.toLowerCase().includes("restaurante");
  const isFinance = name.toLowerCase().includes("finanç");
  const isAgenda = name.toLowerCase().includes("agendamento") || name.toLowerCase().includes("salão") || name.toLowerCase().includes("barbearia");

  return (
    <div className="w-full h-full flex items-center justify-center pt-6 pb-1">
      {/* Phone frame */}
      <div className="w-[55%] h-[95%] rounded-[10px] border-2 border-border/30 overflow-hidden relative" style={{ background: "hsla(222,47%,6%,0.9)" }}>
        {/* Status bar */}
        <div className="flex items-center justify-between px-1.5 py-0.5" style={{ background: "hsla(222,47%,4%,0.9)" }}>
          <div className="text-[3px] text-foreground/40">9:41</div>
          <div className="w-6 h-1 rounded-full bg-foreground/10" />
          <div className="flex gap-0.5">
            <div className="text-[3px] text-foreground/40">📶</div>
            <div className="text-[3px] text-foreground/40">🔋</div>
          </div>
        </div>

        {/* App content */}
        <div className="p-1.5 space-y-1 overflow-hidden animate-preview-scroll" style={{ minHeight: "220%" }}>
          {isDelivery ? (
            <>
              {/* Delivery app */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[3px] text-muted-foreground/50">Entregar em</div>
                  <div className="text-[4px] font-bold text-foreground/80">📍 Rua das Flores, 123</div>
                </div>
                <div className="w-4 h-4 rounded-full" style={{ background: c.bg }} />
              </div>
              <div className="h-4 rounded-lg flex items-center px-1.5 border border-border/20">
                <div className="text-[3px] text-muted-foreground/40">🔍 O que você procura?</div>
              </div>
              <div className="flex gap-1 overflow-hidden">
                {["🍕 Pizza", "🍔 Burger", "🍣 Japonês", "🥗 Saudável"].map((c2, i) => (
                  <div key={i} className="shrink-0 px-1.5 py-1 rounded-lg text-[3px] border border-border/20 text-center animate-pulse" style={{ animationDelay: `${i * 200}ms` }}>
                    {c2}
                  </div>
                ))}
              </div>
              <div className="text-[3px] font-bold text-foreground/70">🔥 Populares perto de você</div>
              {[
                { name: "Burger King", time: "25-35 min", rating: "4.5", price: "R$ 8,90" },
                { name: "Pizza Hut", time: "30-45 min", rating: "4.3", price: "R$ 12,90" },
                { name: "Sushi Express", time: "40-55 min", rating: "4.7", price: "R$ 15,00" },
              ].map((r, i) => (
                <div key={i} className="flex gap-1 p-0.5 rounded border border-border/15 animate-pulse" style={{ animationDelay: `${i * 250}ms`, animationDuration: "3s" }}>
                  <div className="w-6 h-6 rounded" style={{ background: `linear-gradient(135deg, ${c.bg}, ${c.accent})` }} />
                  <div className="flex-1">
                    <div className="text-[3px] font-bold text-foreground/70">{r.name}</div>
                    <div className="text-[2.5px] text-muted-foreground/40">⭐ {r.rating} • {r.time}</div>
                    <div className="text-[2.5px]" style={{ color: c.primary.replace("0.5", "0.8") }}>Pedido mín. {r.price}</div>
                  </div>
                </div>
              ))}
            </>
          ) : isFinance ? (
            <>
              {/* Finance app */}
              <div className="text-[3px] text-muted-foreground/50">Saldo disponível</div>
              <div className="text-[7px] font-bold text-foreground/90">R$ 12.458,32</div>
              <div className="flex gap-1">
                {[
                  { icon: "📤", label: "Enviar" },
                  { icon: "📥", label: "Receber" },
                  { icon: "💳", label: "Cartão" },
                  { icon: "📊", label: "Invest." },
                ].map((a, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5 p-1 rounded-lg border border-border/15">
                    <div className="text-[6px]">{a.icon}</div>
                    <div className="text-[2.5px] text-foreground/50">{a.label}</div>
                  </div>
                ))}
              </div>
              <div className="p-1 rounded-lg border border-border/15">
                <div className="text-[3px] font-medium text-foreground/60 mb-0.5">Gastos do mês</div>
                <div className="flex items-end gap-[1px] h-6">
                  {[40, 65, 30, 80, 55, 70, 45].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t animate-pulse" style={{ height: `${h}%`, background: c.primary, animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>
              </div>
              <div className="text-[3px] font-bold text-foreground/70">Últimas transações</div>
              {[
                { name: "Supermercado", val: "-R$ 234,50", icon: "🛒" },
                { name: "Salário", val: "+R$ 5.000", icon: "💰" },
                { name: "Netflix", val: "-R$ 39,90", icon: "🎬" },
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-1 py-0.5 border-b border-border/10 animate-pulse" style={{ animationDelay: `${i * 200}ms`, animationDuration: "3s" }}>
                  <div className="text-[5px]">{t.icon}</div>
                  <div className="flex-1 text-[3px] text-foreground/60">{t.name}</div>
                  <div className="text-[3px] font-bold" style={{ color: t.val.startsWith("+") ? "hsla(142,71%,45%,0.8)" : "hsla(0,84%,60%,0.8)" }}>{t.val}</div>
                </div>
              ))}
            </>
          ) : isAgenda ? (
            <>
              {/* Scheduling app */}
              <div className="text-[5px] font-bold text-foreground/80">📅 Agendamento</div>
              <div className="grid grid-cols-7 gap-[1px] p-0.5 rounded border border-border/15">
                {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                  <div key={i} className="text-center text-[2.5px] text-muted-foreground/40 font-bold">{d}</div>
                ))}
                {Array.from({ length: 28 }).map((_, i) => (
                  <div key={i} className="text-center text-[2.5px] py-0.5 rounded" style={{
                    background: i === 14 ? c.primary : i === 15 || i === 16 ? c.bg : "transparent",
                    color: i === 14 ? "white" : undefined,
                  }}>
                    {i + 1}
                  </div>
                ))}
              </div>
              <div className="text-[3px] font-bold text-foreground/70">Horários disponíveis</div>
              <div className="grid grid-cols-3 gap-0.5">
                {["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"].map((h, i) => (
                  <div key={i} className="text-center py-1 rounded border border-border/15 text-[3px] animate-pulse" style={{
                    background: i === 2 ? c.bg : "transparent",
                    animationDelay: `${i * 100}ms`,
                    animationDuration: "3s",
                  }}>
                    {h}
                  </div>
                ))}
              </div>
              <div className="text-[3px] font-bold text-foreground/70">Profissional</div>
              {["Ana Silva", "Carlos Lima"].map((p, i) => (
                <div key={i} className="flex items-center gap-1 p-0.5 rounded border border-border/15">
                  <div className="w-4 h-4 rounded-full" style={{ background: c.bg }} />
                  <div className="flex-1">
                    <div className="text-[3px] font-medium text-foreground/70">{p}</div>
                    <div className="text-[2.5px] text-muted-foreground/40">⭐ 4.9 • 120 atendimentos</div>
                  </div>
                </div>
              ))}
              <div className="h-3.5 rounded-lg flex items-center justify-center text-[3px] font-bold" style={{ background: c.primary }}>CONFIRMAR AGENDAMENTO</div>
            </>
          ) : (
            <>
              {/* Generic app */}
              <div className="text-[5px] font-bold text-foreground/80">👋 Olá, usuário</div>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { icon: "📊", label: "Dashboard", val: "12 novos" },
                  { icon: "📱", label: "Atividades", val: "5 pendentes" },
                  { icon: "👥", label: "Clientes", val: "248 ativos" },
                  { icon: "⚙️", label: "Config", val: "Atualizado" },
                ].map((item, i) => (
                  <div key={i} className="p-1 rounded-lg border border-border/15 animate-pulse" style={{ animationDelay: `${i * 200}ms`, animationDuration: "3s" }}>
                    <div className="text-[6px] mb-0.5">{item.icon}</div>
                    <div className="text-[3px] font-bold text-foreground/70">{item.label}</div>
                    <div className="text-[2.5px] text-muted-foreground/40">{item.val}</div>
                  </div>
                ))}
              </div>
              <div className="p-1 rounded-lg border border-border/15">
                <div className="text-[3px] font-bold text-foreground/60 mb-0.5">Atividade Recente</div>
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-0.5 py-0.5 border-b border-border/5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.bg }} />
                    <div className="flex-1">
                      <div className="h-1 w-3/4 rounded-full bg-foreground/10" />
                    </div>
                    <div className="text-[2.5px] text-muted-foreground/30">2h</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bottom nav */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around py-1 border-t border-border/20" style={{ background: "hsla(222,47%,5%,0.95)" }}>
          {["🏠", "🔍", "➕", "💬", "👤"].map((icon, i) => (
            <div key={i} className="text-[6px]" style={{ opacity: i === 0 ? 1 : 0.4 }}>{icon}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppPreview;
