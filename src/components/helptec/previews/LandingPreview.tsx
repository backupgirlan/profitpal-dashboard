import { useState } from "react";

const colorSchemes = [
  { primary: "hsla(199,89%,48%,0.5)", secondary: "hsla(199,89%,48%,0.12)", accent: "hsla(263,70%,50%,0.3)" },
  { primary: "hsla(263,70%,50%,0.5)", secondary: "hsla(263,70%,50%,0.12)", accent: "hsla(180,100%,50%,0.3)" },
  { primary: "hsla(0,84%,60%,0.5)", secondary: "hsla(0,84%,60%,0.12)", accent: "hsla(30,100%,50%,0.3)" },
  { primary: "hsla(142,71%,45%,0.5)", secondary: "hsla(142,71%,45%,0.12)", accent: "hsla(199,89%,48%,0.3)" },
];

const LandingPreview = ({ segment, name }: { segment?: string; name: string }) => {
  const [colorIdx] = useState(() => Math.abs(name.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % colorSchemes.length);
  const c = colorSchemes[colorIdx];

  const isCourse = name.toLowerCase().includes("curso");
  const isProduct = name.toLowerCase().includes("produto");

  return (
    <div className="w-full h-full p-2 pt-7 overflow-hidden animate-preview-scroll" style={{ minHeight: "350%" }}>
      <div className="space-y-2">
        {/* Nav */}
        <div className="flex items-center justify-between">
          <div className="w-8 h-2.5 rounded" style={{ background: c.primary }} />
          <div className="flex gap-1">
            {["Benefícios", "Depoimentos", "FAQ"].map((l, i) => (
              <div key={i} className="text-[3px] text-muted-foreground/50">{l}</div>
            ))}
          </div>
          <div className="w-10 h-2.5 rounded-full text-[3px] flex items-center justify-center font-bold" style={{ background: c.primary }}>
            {isCourse ? "INSCREVER" : "COMPRAR"}
          </div>
        </div>

        {/* Hero */}
        <div className="py-3 text-center" style={{ background: `linear-gradient(180deg, ${c.secondary}, transparent)` }}>
          <div className="text-[3px] px-2 py-0.5 rounded-full mx-auto w-fit mb-1 border border-border/20" style={{ background: c.secondary }}>
            🔥 {isCourse ? "Últimas Vagas" : isProduct ? "Oferta Limitada" : "Não Perca"}
          </div>
          <div className="text-[6px] font-bold text-foreground/90 leading-tight px-2">
            {isCourse ? "Aprenda do Zero ao Avançado" : isProduct ? "O Produto que Vai Mudar Tudo" : "Transforme Seu Negócio Hoje"}
          </div>
          <div className="text-[3px] text-muted-foreground/50 mt-1 px-3">
            {isCourse ? "Mais de 2.000 alunos já transformaram suas carreiras" : "Resultados comprovados por centenas de clientes"}
          </div>
          <div className="flex justify-center gap-1 mt-1.5">
            <div className="px-3 py-1 rounded-full text-[3px] font-bold" style={{ background: c.primary }}>
              {isCourse ? "GARANTIR VAGA" : "QUERO AGORA"}
            </div>
            <div className="px-3 py-1 rounded-full text-[3px] border border-border/20">
              VER MAIS ▼
            </div>
          </div>
        </div>

        {/* Social proof numbers */}
        <div className="grid grid-cols-3 gap-1">
          {[
            { val: isCourse ? "2.000+" : "500+", label: isCourse ? "Alunos" : "Clientes" },
            { val: "4.9/5", label: "Avaliação" },
            { val: "98%", label: "Satisfação" },
          ].map((stat, i) => (
            <div key={i} className="text-center py-1.5 rounded border border-border/15 animate-pulse" style={{ animationDelay: `${i * 200}ms`, animationDuration: "3s" }}>
              <div className="text-[5px] font-bold" style={{ color: c.primary.replace("0.5", "0.9") }}>{stat.val}</div>
              <div className="text-[2.5px] text-muted-foreground/40">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="py-1">
          <div className="text-[4px] font-bold text-center text-foreground/80 mb-1">Por que escolher?</div>
          <div className="grid grid-cols-2 gap-1">
            {[
              { icon: "✅", text: "Resultados comprovados" },
              { icon: "⚡", text: "Acesso imediato" },
              { icon: "🎯", text: "Suporte exclusivo" },
              { icon: "🏆", text: "Certificado incluso" },
              { icon: "📱", text: "Acesse de qualquer lugar" },
              { icon: "💰", text: "Garantia de 7 dias" },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-0.5 p-1 rounded border border-border/10 animate-pulse" style={{ animationDelay: `${i * 150}ms`, animationDuration: "3s" }}>
                <div className="text-[5px]">{b.icon}</div>
                <div className="text-[3px] text-foreground/60">{b.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="py-1">
          <div className="text-[4px] font-bold text-center text-foreground/80 mb-1">Depoimentos Reais</div>
          {[
            { name: "Maria S.", text: "Melhor investimento que fiz!", stars: "⭐⭐⭐⭐⭐" },
            { name: "João P.", text: "Resultados incríveis em 30 dias!", stars: "⭐⭐⭐⭐⭐" },
          ].map((t, i) => (
            <div key={i} className="p-1 rounded border border-border/15 mb-0.5" style={{ background: c.secondary }}>
              <div className="text-[2.5px]">{t.stars}</div>
              <div className="text-[3px] text-foreground/60 italic mt-0.5">"{t.text}"</div>
              <div className="text-[2.5px] text-muted-foreground/40 mt-0.5">— {t.name}</div>
            </div>
          ))}
        </div>

        {/* Countdown + CTA */}
        <div className="py-2 rounded-lg text-center" style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.accent})` }}>
          <div className="text-[3px] text-foreground/60 mb-0.5">⏰ Oferta expira em</div>
          <div className="flex justify-center gap-1 mb-1">
            {["02", "14", "37"].map((t, i) => (
              <div key={i} className="w-5 h-5 rounded flex items-center justify-center text-[5px] font-bold text-foreground/90 animate-pulse" style={{ background: "hsla(222,47%,5%,0.4)" }}>
                {t}
              </div>
            ))}
          </div>
          <div className="px-4 py-1 mx-auto w-fit rounded-full text-[4px] font-bold animate-pulse" style={{ background: "hsla(0,0%,100%,0.2)" }}>
            {isCourse ? "🎓 INSCREVER AGORA" : "🚀 COMPRAR AGORA"}
          </div>
          <div className="text-[2.5px] text-foreground/40 mt-0.5">De R$ 497 por apenas R$ 97</div>
        </div>

        {/* FAQ */}
        <div className="py-1">
          <div className="text-[4px] font-bold text-center text-foreground/80 mb-1">Perguntas Frequentes</div>
          {["Quanto tempo tenho de acesso?", "Posso pedir reembolso?", "Tem certificado?"].map((q, i) => (
            <div key={i} className="flex items-center justify-between p-1 border-b border-border/10">
              <div className="text-[3px] text-foreground/60">{q}</div>
              <div className="text-[4px] text-muted-foreground/30">▼</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPreview;
