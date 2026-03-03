import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { i18n } = useTranslation();
  const current = i18n.language;

  const toggle = () => {
    const next = current === 'pt' ? 'en' : 'pt';
    i18n.changeLanguage(next);
    localStorage.setItem('language', next);
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider border border-border/40 bg-background/30 backdrop-blur-sm text-foreground/80 hover:text-primary hover:border-primary/40 transition-colors ${className}`}
      title={current === 'pt' ? 'Switch to English' : 'Mudar para Português'}
    >
      {current === 'pt' ? '🇧🇷 PT' : '🇺🇸 EN'}
    </button>
  );
}
