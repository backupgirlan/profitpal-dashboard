
-- Add active management mode to profiles (locks user to a module until reset)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_management_mode text DEFAULT NULL;

-- Add management_mode to trades for ranking separation
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS management_mode text DEFAULT NULL;

-- Add entry_type to trades (soros/normal)
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS entry_type text DEFAULT 'normal';

-- Update the profit_rankings view to include management_mode grouping
DROP VIEW IF EXISTS public.profit_rankings;
CREATE VIEW public.profit_rankings AS
SELECT 
  t.user_id,
  p.display_name,
  t.management_mode,
  COUNT(*) as total_trades,
  COUNT(*) FILTER (WHERE t.result = 'win') as wins,
  COUNT(*) FILTER (WHERE t.result = 'loss') as losses,
  COALESCE(SUM(t.profit), 0) as total_profit
FROM public.trades t
LEFT JOIN public.profiles p ON p.user_id = t.user_id
GROUP BY t.user_id, p.display_name, t.management_mode;
