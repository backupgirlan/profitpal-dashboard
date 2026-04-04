import { Bot, MessageSquare, TrendingUp, Phone, HeadphonesIcon, BarChart3, Users, Globe } from "lucide-react";

const aiItems = [
  { icon: Bot, title: "Chatbots Inteligentes", desc: "Atendimento automático 24/7" },
  { icon: MessageSquare, title: "Atendimento Automático", desc: "Respostas instantâneas para clientes" },
  { icon: TrendingUp, title: "IA para Vendas", desc: "Aumente conversões com IA" },
  { icon: Phone, title: "IA para WhatsApp", desc: "Automação inteligente no WhatsApp" },
  { icon: HeadphonesIcon, title: "IA para Suporte", desc: "Suporte técnico automatizado" },
  { icon: BarChart3, title: "Análise de Dados", desc: "Insights inteligentes em tempo real" },
  { icon: Users, title: "Gestão de Clientes", desc: "CRM inteligente com IA" },
  { icon: Globe, title: "IA Integrada", desc: "IA em sites e sistemas sob medida" },
];

const AISection = () => {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/5 via-neon-cyan/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-neon-purple/8 rounded-full blur-[120px]" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-neon-cyan/8 rounded-full blur-[100px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Bot className="w-4 h-4 text-neon-cyan" />
            <span className="text-xs text-neon-cyan font-medium">Inteligência Artificial</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Soluções com <span className="gradient-neon-text">Inteligência Artificial</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Implantamos IA no seu negócio para automatizar, vender mais e atender melhor
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {aiItems.map((item, i) => (
            <div
              key={item.title}
              className="group glass rounded-xl p-6 text-center hover:box-glow-purple transition-all duration-500 hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 flex items-center justify-center mx-auto mb-4 group-hover:from-neon-purple/40 group-hover:to-neon-cyan/40 transition-all">
                <item.icon className="w-6 h-6 text-neon-cyan group-hover:text-foreground transition-colors" />
              </div>
              <h3 className="font-display font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA within AI section */}
        <div className="mt-12 text-center">
          <div className="glass-strong rounded-2xl p-8 max-w-2xl mx-auto box-glow-purple">
            <h3 className="font-display font-bold text-xl mb-3">
              Quer IA no seu negócio?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Fale com nossa equipe e descubra como a inteligência artificial pode transformar sua empresa.
            </p>
            <button
              onClick={() => {
                const link = document.createElement("a");
                link.href = "https://wa.me/5575999401616?text=Olá! Tenho interesse em soluções com IA.";
                link.target = "_blank";
                link.click();
              }}
              className="gradient-neon text-primary-foreground font-semibold px-8 py-3 rounded-xl text-sm hover:scale-105 transition-transform"
            >
              Falar com Especialista
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AISection;
