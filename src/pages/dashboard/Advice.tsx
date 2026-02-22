import { MessageSquare, Shield, Target, Clock, TrendingDown } from 'lucide-react';

const advices = [
  {
    icon: Target,
    title: 'Siga o Gerenciamento',
    text: 'Nunca ultrapasse 3 operações por dia. A disciplina é o que separa traders lucrativos dos que quebram.',
  },
  {
    icon: Shield,
    title: 'Respeite o Stop Loss',
    text: 'O stop loss existe para proteger sua banca. Nunca opere sem ele. Perder pouco é ganhar muito no longo prazo.',
  },
  {
    icon: Clock,
    title: 'Paciência é Lucro',
    text: 'Espere o setup perfeito. Não force entradas. O mercado sempre dará novas oportunidades.',
  },
  {
    icon: TrendingDown,
    title: 'Aceite as Perdas',
    text: 'Perdas fazem parte do jogo. O importante é manter a consistência e não tentar recuperar no desespero.',
  },
  {
    icon: MessageSquare,
    title: 'Controle Emocional',
    text: 'Nunca opere com raiva, ansiedade ou euforia. O melhor trader é aquele que opera como uma máquina.',
  },
];

const Advice = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-primary text-glow flex items-center gap-2">
          <MessageSquare className="w-6 h-6" /> Conselhos do Trader
        </h1>
        <p className="text-muted-foreground">Dicas essenciais para evoluir como trader</p>
      </div>

      <div className="grid gap-4">
        {advices.map((advice, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-6 hover:box-glow transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <advice.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground mb-1">{advice.title}</h3>
                <p className="text-muted-foreground text-sm">{advice.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Advice;
