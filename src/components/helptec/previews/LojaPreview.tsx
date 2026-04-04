import { useState } from "react";

const colorSchemes = [
  { primary: "hsla(263,70%,50%,0.5)", bg: "hsla(263,70%,50%,0.08)", accent: "hsla(180,100%,50%,0.3)" },
  { primary: "hsla(199,89%,48%,0.5)", bg: "hsla(199,89%,48%,0.08)", accent: "hsla(263,70%,50%,0.3)" },
  { primary: "hsla(0,84%,60%,0.5)", bg: "hsla(0,84%,60%,0.08)", accent: "hsla(30,100%,50%,0.3)" },
  { primary: "hsla(142,71%,45%,0.5)", bg: "hsla(142,71%,45%,0.08)", accent: "hsla(199,89%,48%,0.3)" },
];

const LojaPreview = ({ segment, name }: { segment?: string; name: string }) => {
  const [colorIdx] = useState(() => Math.abs(name.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % colorSchemes.length);
  const c = colorSchemes[colorIdx];

  const isModa = name.toLowerCase().includes("roupa") || name.toLowerCase().includes("moda") || name.toLowerCase().includes("feminina") || name.toLowerCase().includes("masculina");
  const isTech = name.toLowerCase().includes("celular") || name.toLowerCase().includes("eletrônico");

  const products = isModa
    ? [
        { name: "Vestido Elegante", price: "R$ 189,90", oldPrice: "R$ 249,90", emoji: "👗", badge: "NOVO" },
        { name: "Blusa Premium", price: "R$ 89,90", oldPrice: "R$ 129,90", emoji: "👚", badge: "-30%" },
        { name: "Calça Jeans", price: "R$ 159,90", oldPrice: "", emoji: "👖", badge: "" },
        { name: "Bolsa Couro", price: "R$ 299,90", oldPrice: "R$ 399,90", emoji: "👜", badge: "SALE" },
        { name: "Sapato Social", price: "R$ 219,90", oldPrice: "", emoji: "👠", badge: "NOVO" },
        { name: "Cinto Premium", price: "R$ 79,90", oldPrice: "R$ 99,90", emoji: "🪢", badge: "" },
      ]
    : isTech
    ? [
        { name: "iPhone 15 Pro", price: "R$ 7.999", oldPrice: "R$ 8.999", emoji: "📱", badge: "-11%" },
        { name: "Galaxy S24", price: "R$ 4.999", oldPrice: "R$ 5.999", emoji: "📱", badge: "SALE" },
        { name: "AirPods Pro", price: "R$ 1.899", oldPrice: "", emoji: "🎧", badge: "NOVO" },
        { name: "MacBook Air", price: "R$ 9.999", oldPrice: "R$ 12.999", emoji: "💻", badge: "-23%" },
        { name: "iPad Air", price: "R$ 5.499", oldPrice: "", emoji: "📟", badge: "" },
        { name: "Apple Watch", price: "R$ 3.299", oldPrice: "R$ 3.999", emoji: "⌚", badge: "SALE" },
      ]
    : [
        { name: "Produto A", price: "R$ 49,90", oldPrice: "R$ 69,90", emoji: "📦", badge: "-28%" },
        { name: "Produto B", price: "R$ 89,90", oldPrice: "", emoji: "🎁", badge: "NOVO" },
        { name: "Produto C", price: "R$ 129,90", oldPrice: "R$ 159,90", emoji: "✨", badge: "SALE" },
        { name: "Produto D", price: "R$ 199,90", oldPrice: "", emoji: "🏷️", badge: "" },
        { name: "Produto E", price: "R$ 59,90", oldPrice: "R$ 79,90", emoji: "💎", badge: "-25%" },
        { name: "Produto F", price: "R$ 149,90", oldPrice: "", emoji: "🎀", badge: "NOVO" },
      ];

  return (
    <div className="w-full h-full p-2 pt-7 overflow-hidden animate-preview-scroll" style={{ minHeight: "280%" }}>
      <div className="space-y-1.5">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="text-[5px] font-bold" style={{ color: c.primary.replace("0.5", "0.9") }}>🛍️ STORE</div>
          <div className="flex items-center gap-1">
            <div className="w-12 h-2.5 rounded-full border border-border/20 flex items-center px-1">
              <div className="text-[2.5px] text-muted-foreground/30">🔍 Buscar...</div>
            </div>
            <div className="relative">
              <div className="text-[6px]">🛒</div>
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full flex items-center justify-center text-[2px] font-bold" style={{ background: c.primary }}>3</div>
            </div>
            <div className="text-[6px]">👤</div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-0.5 overflow-hidden">
          {(isModa ? ["Vestidos", "Blusas", "Calças", "Acessórios", "Promoção"] : isTech ? ["Smartphones", "Notebooks", "Fones", "Tablets", "Promoção"] : ["Cat. 1", "Cat. 2", "Cat. 3", "Cat. 4", "Promoção"]).map((cat, i) => (
            <div key={i} className="shrink-0 px-1.5 py-0.5 rounded-full text-[3px] border border-border/20" style={{ background: i === 0 ? c.bg : "transparent" }}>
              {cat}
            </div>
          ))}
        </div>

        {/* Banner promo */}
        <div className="h-8 rounded-lg relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.accent})` }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-[3px] text-foreground/50">🔥 BLACK FRIDAY</div>
              <div className="text-[6px] font-bold text-foreground/90">ATÉ 50% OFF</div>
              <div className="w-10 h-2 rounded-full mx-auto mt-0.5 text-[2.5px] flex items-center justify-center" style={{ background: "hsla(0,0%,100%,0.2)" }}>COMPRAR</div>
            </div>
          </div>
        </div>

        {/* Products grid */}
        <div className="text-[3px] font-bold text-foreground/70">⭐ Destaques</div>
        <div className="grid grid-cols-2 gap-1">
          {products.map((p, i) => (
            <div key={i} className="rounded-lg border border-border/15 overflow-hidden animate-pulse group" style={{ animationDelay: `${i * 150}ms`, animationDuration: "3s" }}>
              {/* Product image placeholder */}
              <div className="h-10 relative" style={{ background: `linear-gradient(135deg, ${c.bg}, ${c.accent.replace("0.3", "0.1")})` }}>
                <div className="absolute inset-0 flex items-center justify-center text-[12px]">{p.emoji}</div>
                {p.badge && (
                  <div className="absolute top-0.5 left-0.5 px-1 py-[1px] rounded text-[2.5px] font-bold" style={{ background: p.badge.includes("%") ? "hsla(0,84%,60%,0.8)" : c.primary }}>
                    {p.badge}
                  </div>
                )}
                <div className="absolute top-0.5 right-0.5 text-[4px] opacity-30 hover:opacity-100">❤️</div>
              </div>
              {/* Product info */}
              <div className="p-1">
                <div className="text-[3px] text-foreground/70 font-medium">{p.name}</div>
                <div className="flex items-center gap-0.5 mt-0.5">
                  <div className="text-[3.5px] font-bold" style={{ color: c.primary.replace("0.5", "0.9") }}>{p.price}</div>
                  {p.oldPrice && (
                    <div className="text-[2.5px] text-muted-foreground/30 line-through">{p.oldPrice}</div>
                  )}
                </div>
                <div className="text-[2px] text-muted-foreground/30 mt-0.5">⭐⭐⭐⭐⭐ (128)</div>
                <div className="w-full h-2 rounded mt-0.5 text-[2.5px] flex items-center justify-center font-bold" style={{ background: c.bg }}>
                  COMPRAR
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex justify-around py-1.5 rounded border border-border/10">
          {[
            { icon: "🚚", text: "Frete Grátis" },
            { icon: "🔒", text: "Compra Segura" },
            { icon: "↩️", text: "Troca Fácil" },
            { icon: "💳", text: "12x s/ juros" },
          ].map((b, i) => (
            <div key={i} className="text-center">
              <div className="text-[5px]">{b.icon}</div>
              <div className="text-[2.5px] text-muted-foreground/40">{b.text}</div>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="p-1.5 rounded-lg text-center" style={{ background: c.bg }}>
          <div className="text-[3px] font-bold text-foreground/70">📧 Ganhe 10% de desconto</div>
          <div className="text-[2.5px] text-muted-foreground/40">Cadastre-se e receba ofertas exclusivas</div>
          <div className="flex gap-0.5 mt-1">
            <div className="flex-1 h-2.5 rounded border border-border/20 flex items-center px-1">
              <div className="text-[2.5px] text-muted-foreground/30">Seu e-mail</div>
            </div>
            <div className="w-8 h-2.5 rounded text-[2.5px] flex items-center justify-center font-bold" style={{ background: c.primary }}>ENVIAR</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LojaPreview;
