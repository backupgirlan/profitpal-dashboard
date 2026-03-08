import { motion } from 'framer-motion';
import { Eye, Star, Brain, ImageIcon, Shield, TrendingUp, ChevronRight, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const benefits = [
  { icon: Brain, text: 'Análise comportamental avançada', desc: 'IA analisa seus padrões de trading' },
  { icon: ImageIcon, text: 'Leitura de prints do gráfico', desc: 'Envie prints e receba análise probabilística' },
  { icon: TrendingUp, text: 'Respostas baseadas nos seus dados', desc: 'Insights personalizados da sua performance' },
  { icon: Shield, text: 'Acompanhamento de disciplina', desc: 'Detecta tilt e padrões de risco' },
];

export default function SuperVipGate() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-lg w-full"
      >
        {/* Icon */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto w-24 h-24 rounded-2xl gradient-gold flex items-center justify-center box-glow-strong mb-6"
        >
          <Eye className="w-12 h-12 text-primary-foreground" />
        </motion.div>

        {/* Title */}
        <h2 className="text-3xl font-display font-bold text-primary text-glow mb-2">
          Desbloqueie a Horus IA
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Tenha acesso à inteligência artificial da plataforma
        </p>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-left">
          {benefits.map((b, i) => (
            <motion.div
              key={b.text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <Card className="border-border/50 bg-card/80 hover:border-primary/20 transition-colors">
                <CardContent className="p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <b.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{b.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{b.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="inline-flex items-baseline gap-1">
            <span className="text-4xl font-display font-bold text-primary text-glow">R$ 29,90</span>
            <span className="text-sm text-muted-foreground">/mês</span>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Button
              size="lg"
              className="w-full gradient-gold text-primary-foreground font-display text-base gap-2 h-12 box-glow"
              disabled
            >
              <Sparkles className="w-5 h-5" /> Tornar-se Super VIP
              <Badge variant="outline" className="ml-1 text-[10px] border-primary-foreground/30 text-primary-foreground">Em breve</Badge>
            </Button>
          </motion.div>
          <Button variant="ghost" className="text-muted-foreground text-sm gap-1" disabled>
            Ver benefícios <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-[10px] text-muted-foreground mt-4 italic">
          Pagamento via Pix • Ativação automática • Cancele quando quiser
        </p>
      </motion.div>
    </div>
  );
}
