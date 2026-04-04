import { useState } from "react";

const colorSchemes = [
  { primary: "hsla(199,89%,48%,0.5)", bg: "hsla(199,89%,48%,0.08)", accent: "hsla(180,100%,50%,0.3)" },
  { primary: "hsla(263,70%,50%,0.5)", bg: "hsla(263,70%,50%,0.08)", accent: "hsla(199,89%,48%,0.3)" },
  { primary: "hsla(142,71%,45%,0.5)", bg: "hsla(142,71%,45%,0.08)", accent: "hsla(199,89%,48%,0.3)" },
];

const SistemaPreview = ({ segment, name }: { segment?: string; name: string }) => {
  const [colorIdx] = useState(() => Math.abs(name.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % colorSchemes.length);
  const c = colorSchemes[colorIdx];

  const menuItems = ["📊 Dashboard", "👥 Clientes", "📦 Produtos", "💰 Financeiro", "📋 Relatórios", "⚙️ Config"];
  const isFinancial = name.toLowerCase().includes("financ") || name.toLowerCase().includes("caixa");
  const isCRM = name.toLowerCase().includes("crm") || name.toLowerCase().includes("cliente");
  const isStock = name.toLowerCase().includes("estoqu");

  return (
    <div className="w-full h-full pt-7 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-[22%] h-full flex flex-col gap-0.5 p-1 border-r border-border/20" style={{ background: "hsla(222,47%,6%,0.8)" }}>
        <div className="text-[4px] font-bold mb-1 px-0.5" style={{ color: c.primary.replace("0.5", "0.9") }}>⚙️ Sistema</div>
        {menuItems.map((item, i) => (
          <div
            key={i}
            className="text-[3px] px-1 py-0.5 rounded transition-all"
            style={{
              background: i === 0 ? c.bg : "transparent",
              color: i === 0 ? c.primary.replace("0.5", "0.9") : undefined,
            }}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 p-1.5 space-y-1.5 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="text-[4px] font-bold text-foreground/70">Dashboard</div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-2.5 rounded-full border border-border/20 flex items-center px-1">
              <div className="text-[2.5px] text-muted-foreground/40">Buscar...</div>
            </div>
            <div className="w-3 h-3 rounded-full" style={{ background: c.bg }} />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-0.5">
          {[
            { label: isFinancial ? "Receita" : isCRM ? "Leads" : "Vendas", value: isFinancial ? "R$ 45.2K" : isCRM ? "1.248" : "R$ 12.5K", change: "+12%", icon: "📈" },
            { label: isFinancial ? "Despesas" : isCRM ? "Conversões" : "Pedidos", value: isFinancial ? "R$ 28.1K" : isCRM ? "342" : "248", change: "+8%", icon: "📊" },
            { label: isStock ? "Itens" : "Clientes", value: isStock ? "3.456" : "1.832", change: "+24%", icon: "👥" },
            { label: "Lucro", value: "R$ 17.1K", change: "+15%", icon: "💰" },
          ].map((kpi, i) => (
            <div key={i} className="p-1 rounded border border-border/15 animate-pulse" style={{ animationDelay: `${i * 200}ms`, animationDuration: "3s" }}>
              <div className="flex items-center justify-between">
                <div className="text-[5px]">{kpi.icon}</div>
                <div className="text-[2.5px] font-bold" style={{ color: "hsla(142,71%,45%,0.8)" }}>{kpi.change}</div>
              </div>
              <div className="text-[5px] font-bold text-foreground/80 mt-0.5">{kpi.value}</div>
              <div className="text-[2.5px] text-muted-foreground/50">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div className="p-1 rounded border border-border/15">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[3px] font-medium text-foreground/60">
              {isFinancial ? "Fluxo de Caixa" : "Vendas Mensais"}
            </div>
            <div className="flex gap-0.5">
              {["7D", "30D", "90D"].map((p, i) => (
                <div key={i} className="text-[2.5px] px-1 py-0.5 rounded" style={{ background: i === 1 ? c.bg : "transparent" }}>{p}</div>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-[1px] h-10">
            {Array.from({ length: 14 }).map((_, i) => {
              const h = 20 + Math.sin(i * 0.8) * 30 + Math.random() * 20;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t animate-pulse"
                  style={{
                    height: `${h}%`,
                    background: `linear-gradient(to top, ${c.primary}, ${c.accent})`,
                    animationDelay: `${i * 100}ms`,
                    animationDuration: "2.5s",
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="rounded border border-border/15 overflow-hidden">
          <div className="flex gap-0.5 p-0.5 border-b border-border/10" style={{ background: c.bg }}>
            {[isCRM ? "Cliente" : "Item", "Valor", "Status", "Data"].map((h, i) => (
              <div key={i} className="flex-1 text-[2.5px] font-bold text-foreground/50">{h}</div>
            ))}
          </div>
          {[
            { name: "João Silva", val: "R$ 1.250", status: "✅ Ativo", date: "Hoje" },
            { name: "Maria Santos", val: "R$ 890", status: "⏳ Pendente", date: "Ontem" },
            { name: "Pedro Costa", val: "R$ 2.100", status: "✅ Ativo", date: "03/04" },
          ].map((row, i) => (
            <div key={i} className="flex gap-0.5 p-0.5 border-b border-border/5 animate-pulse" style={{ animationDelay: `${i * 300}ms`, animationDuration: "3s" }}>
              <div className="flex-1 text-[2.5px] text-foreground/60">{row.name}</div>
              <div className="flex-1 text-[2.5px] text-foreground/60">{row.val}</div>
              <div className="flex-1 text-[2.5px]">{row.status}</div>
              <div className="flex-1 text-[2.5px] text-muted-foreground/40">{row.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SistemaPreview;
