import { HelpCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface FieldHelpProps {
  text: string;
}

export default function FieldHelp({ text }: FieldHelpProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors ml-1">
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="bg-card border-border text-xs text-foreground max-w-[220px] p-3">
        {text}
      </PopoverContent>
    </Popover>
  );
}
