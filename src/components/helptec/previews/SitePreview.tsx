import { useState, useEffect } from "react";

const colorSchemes = [
  { primary: "hsla(199,89%,48%,0.7)", secondary: "hsla(199,89%,48%,0.3)", accent: "hsla(180,100%,50%,0.4)" },
  { primary: "hsla(263,70%,50%,0.7)", secondary: "hsla(263,70%,50%,0.3)", accent: "hsla(199,89%,48%,0.4)" },
  { primary: "hsla(142,71%,45%,0.7)", secondary: "hsla(142,71%,45%,0.3)", accent: "hsla(180,100%,50%,0.4)" },
  { primary: "hsla(0,84%,60%,0.7)", secondary: "hsla(0,84%,60%,0.3)", accent: "hsla(263,70%,50%,0.4)" },
  { primary: "hsla(30,100%,50%,0.7)", secondary: "hsla(30,100%,50%,0.3)", accent: "hsla(0,84%,60%,0.4)" },
];

const segmentLayouts: Record<string, (colors: typeof colorSchemes[0]) => React.ReactNode> = {
  Supermercado: (c) => (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <div className="w-10 h-4 rounded" style={{ background: c.primary }} />
        <div className="flex-1 h-4 rounded-full border border-foreground/20 bg-foreground/5 px-1.5 flex items-center">
          <div className="w-2 h-2 rounded-full bg-foreground/30" />
          <div className="text-[4px] text-foreground/40 ml-1">Buscar produtos...</div>
        </div>
        <div className="w-6 h-4 rounded text-[6px] flex items-center justify-center" style={{ background: c.secondary }}>🛒</div>
      </div>
      <div className="h-14 rounded-lg relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.accent})` }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[7px] font-bold text-foreground">OFERTAS DA SEMANA</div>
          <div className="text-[5px] text-foreground/70">Até 50% de desconto</div>
          <div className="mt-1 w-12 h-3 rounded text-[4px] flex items-center justify-center font-bold text-foreground" style={{ background: c.primary }}>VER MAIS</div>
        </div>
      </div>
      <div className="flex gap-1 overflow-hidden">
        {["🥩 Carnes", "🥬 Hortifruti", "🧴 Limpeza", "🥛 Laticínios"].map((cat, i) => (
          <div key={i} className="shrink-0 px-2 py-1 rounded-full text-[4px] text-foreground/80 border border-foreground/20" style={{ background: i === 0 ? c.secondary : "transparent" }}>
            {cat}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { name: "Arroz 5kg", price: "R$ 24,90", emoji: "🍚" },
          { name: "Feijão 1kg", price: "R$ 8,49", emoji: "🫘" },
          { name: "Leite 1L", price: "R$ 5,99", emoji: "🥛" },
          { name: "Frango Kg", price: "R$ 12,90", emoji: "🍗" },
          { name: "Café 500g", price: "R$ 15,90", emoji: "☕" },
          { name: "Açúcar 1kg", price: "R$ 4,49", emoji: "🧂" },
        ].map((p, i) => (
          <div key={i} className="rounded border border-foreground/15 p-1 flex flex-col items-center" style={{ background: c.secondary, animationDelay: `${i * 200}ms` }}>
            <div className="text-[10px]">{p.emoji}</div>
            <div className="text-[4px] text-foreground/80 text-center">{p.name}</div>
            <div className="text-[5px] font-bold" style={{ color: c.primary.replace("0.7", "1") }}>{p.price}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 p-1 rounded" style={{ background: "hsla(142,71%,45%,0.2)" }}>
        <div className="text-[7px]">💬</div>
        <div className="text-[4px] text-foreground/60 flex-1">Peça pelo WhatsApp</div>
        <div className="w-8 h-3 rounded text-[3px] flex items-center justify-center text-foreground/80" style={{ background: "hsla(142,71%,45%,0.4)" }}>Enviar</div>
      </div>
    </div>
  ),

  Beleza: (c) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-[7px] font-bold" style={{ color: c.primary.replace("0.7", "1") }}>✨ STUDIO</div>
        <div className="flex gap-2">
          {["Serviços", "Galeria", "Agendar"].map((l, i) => (
            <div key={i} className="text-[4px] text-foreground/70">{l}</div>
          ))}
        </div>
      </div>
      <div className="h-14 rounded-lg relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${c.secondary}, ${c.accent})` }}>
        <div className="absolute inset-0 flex items-center justify-between px-2">
          <div>
            <div className="text-[7px] font-bold text-foreground">Sua Beleza</div>
            <div className="text-[7px] font-bold" style={{ color: c.primary.replace("0.7", "1") }}>Nossa Arte</div>
            <div className="mt-1.5 w-14 h-3.5 rounded-full text-[4px] flex items-center justify-center font-bold text-foreground" style={{ background: c.primary }}>AGENDAR</div>
          </div>
          <div className="w-12 h-12 rounded-full" style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.accent})` }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { name: "Corte Feminino", price: "R$ 80", icon: "💇‍♀️" },
          { name: "Manicure", price: "R$ 35", icon: "💅" },
          { name: "Coloração", price: "R$ 150", icon: "🎨" },
          { name: "Hidratação", price: "R$ 60", icon: "✨" },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-1 p-1.5 rounded border border-foreground/20" style={{ background: c.secondary, animationDelay: `${i * 300}ms` }}>
            <div className="text-[8px]">{s.icon}</div>
            <div className="flex-1">
              <div className="text-[4px] font-medium text-foreground/80">{s.name}</div>
              <div className="text-[4px] font-bold" style={{ color: c.primary.replace("0.7", "1") }}>{s.price}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex-1 h-8 rounded" style={{ background: `linear-gradient(${45 + i * 30}deg, ${c.secondary}, ${c.accent})` }} />
        ))}
      </div>
    </div>
  ),

  Gastronomia: (c) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-[7px] font-bold" style={{ color: c.primary.replace("0.7", "1") }}>🍽️ SABOR</div>
        <div className="w-14 h-3.5 rounded-full text-[4px] flex items-center justify-center font-bold text-foreground" style={{ background: "hsla(0,84%,60%,0.5)" }}>RESERVAR</div>
      </div>
      <div className="h-14 rounded-lg relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${c.primary}, hsla(30,100%,50%,0.5))` }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[14px]">🍔</div>
          <div className="text-[6px] font-bold text-foreground">Cardápio Digital</div>
          <div className="text-[4px] text-foreground/70">Peça agora online</div>
        </div>
      </div>
      <div className="flex gap-1">
        {["🍕 Pizzas", "🍔 Burgers", "🥗 Saladas", "🍰 Sobremesas"].map((cat, i) => (
          <div key={i} className="flex-1 text-center py-1 rounded text-[4px] text-foreground/80 border border-foreground/20" style={{ background: i === 1 ? c.secondary : "transparent" }}>
            {cat}
          </div>
        ))}
      </div>
      <div className="space-y-1">
        {[
          { name: "X-Burger Especial", desc: "Pão, carne, queijo, bacon", price: "R$ 32,90" },
          { name: "X-Salada Premium", desc: "Pão, carne, salada completa", price: "R$ 28,90" },
          { name: "Combo Família", desc: "4 burgers + batata + refri", price: "R$ 99,90" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 p-1 rounded border border-foreground/15" style={{ background: c.secondary }}>
            <div className="w-7 h-7 rounded" style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.accent})` }} />
            <div className="flex-1">
              <div className="text-[4px] font-medium text-foreground/80">{item.name}</div>
              <div className="text-[3px] text-foreground/50">{item.desc}</div>
            </div>
            <div className="text-[5px] font-bold" style={{ color: c.primary.replace("0.7", "1") }}>{item.price}</div>
          </div>
        ))}
      </div>
      <div className="h-4 rounded-lg flex items-center justify-center text-[5px] font-bold text-foreground" style={{ background: c.primary }}>
        📱 FAZER PEDIDO
      </div>
    </div>
  ),

  Saúde: (c) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-[7px] font-bold" style={{ color: c.primary.replace("0.7", "1") }}>🏥 CLÍNICA</div>
        <div className="text-[4px] text-foreground/70">Agendar Consulta</div>
      </div>
      <div className="h-14 rounded-lg relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${c.secondary}, hsla(180,100%,50%,0.3))` }}>
        <div className="absolute inset-0 flex items-center px-2">
          <div>
            <div className="text-[7px] font-bold text-foreground">Cuidando da</div>
            <div className="text-[7px] font-bold" style={{ color: c.primary.replace("0.7", "1") }}>sua saúde</div>
            <div className="mt-1.5 w-16 h-3.5 rounded-full text-[4px] flex items-center justify-center font-bold text-foreground" style={{ background: c.primary }}>MARCAR CONSULTA</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {["Clínico Geral", "Cardiologia", "Pediatria", "Ortopedia", "Dermatologia", "Oftalmologia"].map((s, i) => (
          <div key={i} className="text-center p-1.5 rounded border border-foreground/20" style={{ background: c.secondary, animationDelay: `${i * 150}ms` }}>
            <div className="text-[7px]">{["🩺", "❤️", "👶", "🦴", "🧴", "👁️"][i]}</div>
            <div className="text-[3.5px] text-foreground/70 mt-0.5">{s}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-1.5">
        <div className="flex-1 p-1.5 rounded border border-foreground/15" style={{ background: c.secondary }}>
          <div className="text-[4px] font-medium text-foreground/80">📍 Localização</div>
          <div className="h-6 mt-1 rounded" style={{ background: c.accent }} />
        </div>
        <div className="flex-1 p-1.5 rounded border border-foreground/15" style={{ background: c.secondary }}>
          <div className="text-[4px] font-medium text-foreground/80">⏰ Horários</div>
          <div className="text-[3.5px] text-foreground/60 mt-1">Seg-Sex: 8h-18h</div>
          <div className="text-[3.5px] text-foreground/60">Sáb: 8h-12h</div>
        </div>
      </div>
    </div>
  ),

  default: (c) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="w-12 h-4 rounded" style={{ background: c.primary }} />
        <div className="flex gap-2">
          {["Home", "Sobre", "Serviços", "Contato"].map((l, i) => (
            <div key={i} className="text-[5px] text-foreground/70">{l}</div>
          ))}
        </div>
      </div>
      <div className="h-16 rounded-lg relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.accent})` }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[8px] font-bold text-foreground">Seu Negócio</div>
          <div className="text-[8px] font-bold" style={{ color: c.primary.replace("0.7", "1") }}>Online</div>
          <div className="flex gap-1 mt-1.5">
            <div className="w-14 h-3.5 rounded-full text-[4px] flex items-center justify-center font-bold text-foreground" style={{ background: c.primary }}>SAIBA MAIS</div>
            <div className="w-14 h-3.5 rounded-full text-[4px] flex items-center justify-center text-foreground/80 border border-foreground/30">CONTATO</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { icon: "⚡", title: "Rápido" },
          { icon: "🔒", title: "Seguro" },
          { icon: "📱", title: "Responsivo" },
        ].map((f, i) => (
          <div key={i} className="text-center p-1.5 rounded border border-foreground/20 animate-pulse" style={{ animationDelay: `${i * 200}ms`, animationDuration: "3s", background: c.secondary }}>
            <div className="text-[8px]">{f.icon}</div>
            <div className="text-[4px] text-foreground/80 font-medium">{f.title}</div>
          </div>
        ))}
      </div>
      <div className="space-y-1">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-1.5 p-1 rounded border border-foreground/15" style={{ background: c.secondary }}>
            <div className="w-6 h-6 rounded" style={{ background: c.primary }} />
            <div className="flex-1 space-y-0.5">
              <div className="h-1.5 w-3/4 rounded-full bg-foreground/30" />
              <div className="h-1 w-1/2 rounded-full bg-foreground/15" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-4 rounded-lg flex items-center justify-center text-[5px] font-bold text-foreground" style={{ background: c.primary }}>
        💬 FALE CONOSCO
      </div>
    </div>
  ),
};

const segmentMap: Record<string, string> = {
  "Supermercado": "Supermercado",
  "Moda": "default", "Calçados": "default",
  "Beleza": "Beleza",
  "Gastronomia": "Gastronomia",
  "Saúde": "Saúde",
  "Imobiliário": "default", "Automotivo": "default",
  "Fitness": "default", "Tecnologia": "default",
  "Energia": "default", "Educação": "default",
  "Turismo": "default", "Hotelaria": "default",
  "Construção": "default", "Agropecuária": "default",
  "Contabilidade": "default", "Móveis": "default",
};

const SitePreview = ({ segment, name }: { segment?: string; name: string }) => {
  const [colorIdx] = useState(() => Math.abs(name.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % colorSchemes.length);
  const colors = colorSchemes[colorIdx];
  const layoutKey = segmentMap[segment || ""] || "default";
  const Layout = segmentLayouts[layoutKey] || segmentLayouts.default;

  return (
    <div className="w-full p-2 pt-7 overflow-hidden animate-preview-scroll" style={{ minHeight: "200%" }}>
      {Layout(colors)}
    </div>
  );
};

export default SitePreview;
