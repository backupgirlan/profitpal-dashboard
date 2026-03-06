
-- Monthly scores table to persist monthly aggregates permanently
CREATE TABLE public.monthly_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month_start date NOT NULL,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(month_start)
);

ALTER TABLE public.monthly_scores ENABLE ROW LEVEL SECURITY;

-- Anyone can view
CREATE POLICY "Anyone can view monthly scores" ON public.monthly_scores FOR SELECT USING (true);

-- Admins can manage
CREATE POLICY "Admins can manage monthly scores" ON public.monthly_scores FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Function to aggregate weekly scores into monthly and reset weekly
CREATE OR REPLACE FUNCTION public.reset_weekly_scores()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_month date;
  total_wins integer;
  total_losses integer;
BEGIN
  current_month := date_trunc('month', CURRENT_DATE)::date;
  
  -- Sum all current live_scores
  SELECT COALESCE(SUM(wins), 0), COALESCE(SUM(losses), 0)
  INTO total_wins, total_losses
  FROM public.live_scores;
  
  -- Upsert into monthly_scores
  IF total_wins > 0 OR total_losses > 0 THEN
    INSERT INTO public.monthly_scores (month_start, wins, losses)
    VALUES (current_month, total_wins, total_losses)
    ON CONFLICT (month_start)
    DO UPDATE SET 
      wins = monthly_scores.wins + EXCLUDED.wins,
      losses = monthly_scores.losses + EXCLUDED.losses,
      updated_at = now();
  END IF;
  
  -- Clear weekly scores
  DELETE FROM public.live_scores;
END;
$$;
