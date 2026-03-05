
CREATE TABLE public.live_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  week_start date NOT NULL DEFAULT (date_trunc('week', CURRENT_DATE + interval '1 day') - interval '1 day')::date,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (day_of_week, week_start)
);

ALTER TABLE public.live_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view live scores" ON public.live_scores FOR SELECT USING (true);
CREATE POLICY "Admins can manage live scores" ON public.live_scores FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
