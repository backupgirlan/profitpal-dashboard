import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Smartphone, Apple, Monitor } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props { open: boolean; onOpenChange: (open: boolean) => void; }

export default function InstallAppDialog({ open, onOpenChange }: Props) {
  const [tab, setTab] = useState<'ios' | 'android'>('ios');
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-primary text-center text-lg">{t('install.title')}</DialogTitle>
        </DialogHeader>
        <p className="text-center text-muted-foreground text-sm">{t('install.subtitle')}</p>
        <div className="flex gap-2 mt-2">
          <Button variant={tab === 'ios' ? 'default' : 'outline'} size="sm" onClick={() => setTab('ios')}
            className={`flex-1 gap-2 ${tab === 'ios' ? 'gradient-gold text-primary-foreground' : 'border-border'}`}>
            <Apple className="w-4 h-4" /> iPhone / iPad
          </Button>
          <Button variant={tab === 'android' ? 'default' : 'outline'} size="sm" onClick={() => setTab('android')}
            className={`flex-1 gap-2 ${tab === 'android' ? 'gradient-gold text-primary-foreground' : 'border-border'}`}>
            <Smartphone className="w-4 h-4" /> Android
          </Button>
        </div>

        {tab === 'ios' ? (
          <div className="space-y-4 mt-2">
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 text-center">
              <p className="text-xs font-display font-bold text-accent">Safari</p>
              <p className="text-[10px] text-muted-foreground">{t('install.iosRequired')}</p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0"><span className="text-sm font-bold text-primary">1</span></div>
              <div><p className="text-sm font-bold text-foreground">{t('install.openSafari')}</p><p className="text-xs text-muted-foreground">{t('install.safariWarning')}</p></div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0"><span className="text-sm font-bold text-primary">2</span></div>
              <div><p className="text-sm font-bold text-foreground">{t('install.shareButton')}</p><p className="text-xs text-muted-foreground">{t('install.shareDesc')}</p></div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0"><span className="text-sm font-bold text-primary">3</span></div>
              <div>
                <p className="text-sm font-bold text-foreground">{t('install.scrollDown')}</p>
                <div className="mt-1 bg-secondary rounded-lg px-3 py-2 border border-border">
                  <p className="text-sm font-display font-bold text-foreground flex items-center gap-2"><Monitor className="w-4 h-4" />{t('install.addToHome')}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t('install.confirmAdd')}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
              <p className="text-xs font-display font-bold text-primary">{t('install.chromeDefault')}</p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0"><span className="text-sm font-bold text-primary">1</span></div>
              <div><p className="text-sm font-bold text-foreground">{t('install.openChrome')}</p><p className="text-xs text-muted-foreground">{t('install.orDefault')}</p></div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0"><span className="text-sm font-bold text-primary">2</span></div>
              <div><p className="text-sm font-bold text-foreground">{t('install.tapMenu')}</p><p className="text-xs text-muted-foreground">{t('install.threeDots')}</p></div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0"><span className="text-sm font-bold text-primary">3</span></div>
              <div>
                <p className="text-sm font-bold text-foreground">{t('install.select')}</p>
                <div className="mt-1 bg-secondary rounded-lg px-3 py-2 border border-border">
                  <p className="text-sm font-display font-bold text-foreground">{t('install.installApp')}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t('install.orAddHome')}</p>
              </div>
            </div>
          </div>
        )}
        <div className="text-center mt-2"><p className="text-[10px] text-muted-foreground">girlanbarreto.lovable.app</p></div>
      </DialogContent>
    </Dialog>
  );
}
