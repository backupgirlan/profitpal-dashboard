import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Advice = () => {
  const { t } = useTranslation();
  const [advices, setAdvices] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('admin_advice').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setAdvices(data); });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-primary text-glow flex items-center gap-2">
          <MessageSquare className="w-6 h-6" /> {t('advice.title')}
        </h1>
        <p className="text-muted-foreground">{t('advice.subtitle')}</p>
      </div>
      <div className="grid gap-4">
        {advices.map((advice) => (
          <div key={advice.id} className="bg-card border border-border rounded-lg p-6 hover:box-glow transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg"><MessageSquare className="w-5 h-5 text-primary" /></div>
              <div>
                <h3 className="font-display font-bold text-foreground mb-1">{advice.title}</h3>
                <p className="text-muted-foreground text-sm whitespace-pre-wrap">{advice.content}</p>
              </div>
            </div>
          </div>
        ))}
        {advices.length === 0 && (
          <div className="text-center text-muted-foreground py-8">{t('advice.noAdvice')}</div>
        )}
      </div>
    </div>
  );
};

export default Advice;
