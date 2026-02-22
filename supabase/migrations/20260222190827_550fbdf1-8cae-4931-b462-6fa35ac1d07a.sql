
-- Fix: Change view to use SECURITY INVOKER (default, safe)
DROP VIEW IF EXISTS public.profit_rankings;

CREATE VIEW public.profit_rankings
WITH (security_invoker = true)
AS
SELECT 
  p.user_id,
  p.display_name,
  COALESCE(SUM(t.profit), 0) as total_profit,
  COUNT(CASE WHEN t.result = 'win' THEN 1 END) as wins,
  COUNT(CASE WHEN t.result = 'loss' THEN 1 END) as losses,
  COUNT(t.id) as total_trades
FROM public.profiles p
LEFT JOIN public.trades t ON t.user_id = p.user_id
GROUP BY p.user_id, p.display_name;
