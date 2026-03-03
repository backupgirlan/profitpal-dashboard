import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AdminMessagePopup() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [message, setMessage] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('admin_messages').select('*')
      .or(`target_user_id.eq.${user.id},is_global.eq.true`)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => { if (data && data.length > 0) setMessage(data[0]); });
  }, [user]);

  const handleClose = async () => {
    if (message) { await supabase.from('admin_messages').update({ is_read: true }).eq('id', message.id); setMessage(null); }
  };

  if (!message) return null;

  return (
    <Dialog open={!!message} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="bg-card border-primary/30 box-glow">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary font-display">
            <MessageSquare className="w-5 h-5" /> {message.title}
          </DialogTitle>
          <DialogDescription className="text-foreground whitespace-pre-wrap pt-2">{message.content}</DialogDescription>
        </DialogHeader>
        <Button onClick={handleClose} className="gradient-gold text-primary-foreground font-display">{t('adminMessage.understood')}</Button>
      </DialogContent>
    </Dialog>
  );
}
