import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

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

const FAQSection = () => {
  return (
    <section className="relative py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <ScrollReveal variant="blur-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Perguntas <span className="gradient-neon-text text-glow">Frequentes</span>
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={200}>
          <div className="glass rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 animate-shimmer pointer-events-none" />
            <Accordion type="single" collapsible className="space-y-2 relative z-10">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border-border/50 px-4 rounded-xl hover:bg-muted/30 transition-all duration-300"
                >
                  <AccordionTrigger className="text-sm font-medium text-left hover:no-underline hover:text-primary transition-colors">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default FAQSection;
