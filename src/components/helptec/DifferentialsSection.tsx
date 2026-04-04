import { useState } from "react";
import {
  Palette, Zap, Smartphone, MessageCircle, Brain, Settings,
  Search, Gauge, Shield, Cloud, RefreshCw, Sliders, Check, ArrowRight
} from "lucide-react";
import { ScrollReveal } from "@/hooks/useScrollAnimation";
import { motion, AnimatePresence } from "framer-motion";

const items = [
  {
    icon: Palette,
    title: "Design moderno e profissional",
    desc: "Interfaces elegantes, responsivas e com identidade visual única que transmitem credibilidade e encantam seus clientes.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Zap,
    title: "Desenvolvimento rápido",
    desc: "Entrega ágil sem comprometer a qualidade. Seu projeto no ar em tempo recorde com tecnologia de ponta.",
    color: "from-yellow-400 to-amber-500",
  },
  {
    icon: Smartphone,
    title: "Responsivo para celular e tablet",
    desc: "Experiência perfeita em qualquer dispositivo. Cada pixel é pensado para mobile, tablet e desktop.",
    color: "from-sky-400 to-blue-500",
  },
  {
    icon: MessageCircle,
    title: "Integração com WhatsApp",
    desc: "Botões de contato, chatbots e automações que conectam seu site diretamente ao WhatsApp do seu negócio.",
    color: "from-green-400 to-emerald-500",
  },
  {
    icon: Brain,
    title: "Integração com inteligência artificial",
    desc: "Chatbots inteligentes, automações avançadas e análises preditivas para transformar seu negócio.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Settings,
    title: "Painel administrativo completo",
    desc: "Gerencie conteúdo, usuários, pedidos e configurações de forma simples e intuitiva, sem precisar de programador.",
    color: "from-slate-400 to-zinc-500",
  },
  {
    icon: Search,
    title: "SEO otimizado",
    desc: "Estrutura técnica perfeita para ranquear no Google. Meta tags, schema markup e performance que geram tráfego orgânico.",
    color: "from-orange-400 to-red-500",
  },
  {
    icon: Gauge,
    title: "Velocidade e performance",
    desc: "Carregamento ultrarrápido com código otimizado, lazy loading e CDN global. Nota máxima no PageSpeed.",
    color: "from-cyan-400 to-teal-500",
  },
  {
    icon: Shield,
    title: "Segurança avançada",
    desc: "SSL, proteção contra ataques, backups automáticos e criptografia de dados para total tranquilidade.",
    color: "from-red-500 to-rose-600",
  },
  {
    icon: Cloud,
    title: "Hospedagem e suporte",
    desc: "Infraestrutura robusta em nuvem com uptime garantido e suporte humanizado quando você precisar.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: RefreshCw,
    title: "Atualizações constantes",
    desc: "Seu projeto sempre atualizado com as últimas tecnologias, correções de segurança e melhorias contínuas.",
    color: "from-emerald-400 to-green-600",
  },
  {
    icon: Sliders,
    title: "Personalização total",
    desc: "Cada detalhe sob medida para sua marca. Cores, fontes, animações e funcionalidades 100% customizáveis.",
    color: "from-fuchsia-500 to-pink-600",
  },
];

const DifferentialsSection = () => {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="diferenciais" className="relative py-24 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/5 via-transparent to-neon-blue/5 pointer-events-none" />
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-neon-purple/8 rounded-full blur-[150px] animate-orb" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-neon-cyan/8 rounded-full blur-[150px] animate-orb" style={{ animationDelay: "4s" }} />

      <div className="max-w-6xl mx-auto relative z-10">
        <ScrollReveal variant="blur-in">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6">
              <Check className="w-4 h-4 text-neon-cyan" />
              <span className="text-xs font-semibold text-neon-cyan tracking-wide uppercase">12 Diferenciais exclusivos</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-5 leading-tight">
              Por que escolher a{" "}
              <span className="gradient-neon-text text-glow">Help Tec</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
              Combinamos tecnologia de ponta com design excepcional para entregar
              resultados que fazem a diferença no seu negócio
            </p>
          </div>
        </ScrollReveal>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, i) => (
            <ScrollReveal
              key={item.title}
              variant="zoom-in"
              delay={i * 60}
            >
              <motion.div
                onHoverStart={() => setActive(i)}
                onHoverEnd={() => setActive(null)}
                className="group relative glass-strong rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,200,255,0.12)] border border-transparent hover:border-primary/20 overflow-hidden h-full"
              >
                {/* Shimmer */}
                <div className="absolute inset-0 animate-shimmer pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Glow dot */}
                <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-15 blur-2xl transition-opacity duration-500`} />

                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>

                {/* Title */}
                <h3 className="font-display font-bold text-foreground mb-2 text-base group-hover:text-primary transition-colors">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.desc}
                </p>

                {/* Arrow indicator */}
                <div className="flex items-center gap-1 mt-4 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-4px] group-hover:translate-x-0">
                  <span className="text-xs font-medium">Saiba mais</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Bottom CTA */}
        <ScrollReveal variant="fade-up" delay={400}>
          <div className="text-center mt-14">
            <a
              href="https://wa.me/5575999401616?text=Olá! Quero saber mais sobre os diferenciais da Help Tec"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full gradient-neon text-primary-foreground font-semibold hover-magnetic shadow-[0_0_30px_rgba(0,200,255,0.2)] hover:shadow-[0_0_50px_rgba(0,200,255,0.35)] transition-shadow"
            >
              <MessageCircle className="w-5 h-5" />
              Falar com um especialista
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default DifferentialsSection;
