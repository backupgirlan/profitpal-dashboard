
-- Fix security definer view - use security_invoker instead
ALTER VIEW public.profit_rankings SET (security_invoker = on);
