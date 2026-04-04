import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, User } from "lucide-react";

const fallbackTestimonials = [
  { id: "1", name: "Maria Silva", company: "Loja Elegância", comment: "A Help Tec transformou nosso negócio com um site incrível. As vendas aumentaram 200% em 3 meses!", rating: 5, photo_url: null },
  { id: "2", name: "João Santos", company: "Clínica Saúde+", comment: "Sistema de agendamento perfeito. Nossos pacientes adoraram a facilidade.", rating: 5, photo_url: null },
  { id: "3", name: "Ana Costa", company: "Restaurante Sabor", comment: "O cardápio digital e sistema de pedidos online revolucionou nosso atendimento.", rating: 5, photo_url: null },
  { id: "4", name: "Pedro Oliveira", company: "Imobiliária Central", comment: "Plataforma completa com IA que facilitou a gestão de mais de 500 imóveis.", rating: 5, photo_url: null },
];

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("testimonials").select("*").eq("is_active", true);
      if (data && data.length > 0) setTestimonials(data);
    };
    fetch();
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [testimonials.length]);

  return (
    <section className="relative py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            O que nossos <span className="gradient-neon-text">clientes</span> dizem
          </h2>
        </div>

        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {testimonials.map((t) => (
              <div key={t.id} className="w-full shrink-0 px-4">
                <div className="glass-strong rounded-2xl p-8 text-center max-w-xl mx-auto box-glow">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-blue/30 to-neon-purple/30 flex items-center justify-center mx-auto mb-4">
                    {t.photo_url ? (
                      <img src={t.photo_url} alt={t.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-7 h-7 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex justify-center gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">"{t.comment}"</p>
                  <h4 className="font-display font-semibold">{t.name}</h4>
                  <p className="text-xs text-muted-foreground">{t.company}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === current ? "w-6 gradient-neon" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
