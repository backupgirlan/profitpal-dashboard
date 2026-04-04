import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, CheckCircle, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

const ContactFormSection = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", project_type: "site" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.from("contact_leads").insert([form]);
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <section id="contato" className="py-20 px-4">
        <ScrollReveal variant="zoom-in">
          <div className="max-w-lg mx-auto text-center glass-strong rounded-2xl p-12 box-glow relative overflow-hidden">
            <div className="absolute inset-0 animate-shimmer pointer-events-none" />
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4 animate-surreal-float" />
            <h3 className="font-display font-bold text-xl mb-2">Mensagem Enviada!</h3>
            <p className="text-sm text-muted-foreground">Entraremos em contato em breve pelo WhatsApp.</p>
          </div>
        </ScrollReveal>
      </section>
    );
  }

  return (
    <section id="contato" className="py-20 px-4">
      <div className="max-w-lg mx-auto">
        <ScrollReveal variant="fade-up">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
              <Sparkles className="w-4 h-4 text-neon-cyan animate-pulse" />
              <span className="text-xs text-neon-cyan font-medium">Orçamento gratuito</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Solicite seu <span className="gradient-neon-text text-glow">Orçamento</span>
            </h2>
            <p className="text-muted-foreground text-sm">Preencha o formulário e retornamos rapidamente</p>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="flip-up" delay={200}>
          <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-6 space-y-4 box-glow relative overflow-hidden">
            <div className="absolute inset-0 animate-shimmer pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <Input
                placeholder="Seu nome"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="bg-muted/50 border-border/50 focus:box-glow transition-shadow"
              />
              <Input
                type="email"
                placeholder="Seu e-mail"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-muted/50 border-border/50 focus:box-glow transition-shadow"
              />
              <Input
                placeholder="Seu WhatsApp"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="bg-muted/50 border-border/50 focus:box-glow transition-shadow"
              />
              <select
                value={form.project_type}
                onChange={(e) => setForm({ ...form, project_type: e.target.value })}
                className="w-full h-10 rounded-md border border-border/50 bg-muted/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="site">Site</option>
                <option value="sistema">Sistema</option>
                <option value="aplicativo">Aplicativo</option>
                <option value="ia">Inteligência Artificial</option>
                <option value="landing">Landing Page</option>
                <option value="loja">Loja Virtual</option>
                <option value="outro">Outro</option>
              </select>
              <Textarea
                placeholder="Descreva seu projeto..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={4}
                className="bg-muted/50 border-border/50 focus:box-glow transition-shadow"
              />
              <Button
                type="submit"
                disabled={loading || !form.name}
                className="w-full gradient-neon text-primary-foreground font-semibold py-5 hover-magnetic"
              >
                <Send className="mr-2 w-4 h-4" /> {loading ? "Enviando..." : "Enviar Orçamento"}
              </Button>
            </div>
          </form>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ContactFormSection;
