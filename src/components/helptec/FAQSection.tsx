import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollReveal } from "@/hooks/useScrollAnimation";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  { q: "Quanto tempo leva para criar um site?", a: "Depende da complexidade. Sites simples ficam prontos em 3-7 dias. Sistemas e plataformas completas levam de 15 a 45 dias." },
  { q: "O site funciona no celular?", a: "Sim! Todos os nossos projetos são 100% responsivos, funcionando perfeitamente em celulares, tablets e computadores." },
  { q: "Vocês criam aplicativos?", a: "Sim! Desenvolvemos aplicativos mobile para Android e iOS, integrados com seus sistemas e plataformas." },
  { q: "Fazem integração com IA?", a: "Sim! Integramos inteligência artificial em sites, sistemas e aplicativos. Chatbots, automações, análise de dados e muito mais." },
  { q: "Tem painel administrativo?", a: "Sim! Todos os projetos profissionais incluem um painel administrativo completo para você gerenciar seu conteúdo." },
  { q: "Posso editar o site depois?", a: "Sim! Através do painel administrativo você pode editar conteúdos, imagens, produtos e muito mais sem precisar de conhecimento técnico." },
  { q: "Tem suporte após a entrega?", a: "Sim! Oferecemos suporte contínuo e manutenção para garantir que tudo funcione perfeitamente." },
  { q: "Vocês fazem loja virtual?", a: "Sim! Criamos e-commerces completos com carrinho, pagamentos, gestão de estoque e integração com correios." },
];

const INITIAL_VISIBLE = 4;

const FAQSection = () => {
  const [showAll, setShowAll] = useState(false);
  const visibleFaqs = showAll ? faqs : faqs.slice(0, INITIAL_VISIBLE);

  return (
    <section className="relative py-14 sm:py-20 px-3 sm:px-4">
      <div className="max-w-3xl mx-auto">
        <ScrollReveal variant="blur-in">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3 sm:mb-4">
              Perguntas <span className="gradient-neon-text text-glow">Frequentes</span>
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={200}>
          <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute inset-0 animate-shimmer pointer-events-none" />
            <Accordion type="single" collapsible className="space-y-1 sm:space-y-2 relative z-10">
              {visibleFaqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border-border/50 px-3 sm:px-4 rounded-xl hover:bg-muted/30 transition-all duration-300"
                >
                  <AccordionTrigger className="text-xs sm:text-sm font-medium text-left hover:no-underline hover:text-primary transition-colors py-3 sm:py-4">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {faqs.length > INITIAL_VISIBLE && (
              <div className="flex justify-center mt-4 relative z-10">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="group px-5 sm:px-6 py-2 rounded-full glass text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105 hover:box-glow flex items-center gap-1.5"
                >
                  {showAll ? "Ver menos" : `Ver mais (${faqs.length - INITIAL_VISIBLE})`}
                  {showAll ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
                  )}
                </button>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default FAQSection;