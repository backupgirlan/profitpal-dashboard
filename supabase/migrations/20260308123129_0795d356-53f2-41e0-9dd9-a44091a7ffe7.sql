
-- Emotional check-ins before trading
CREATE TABLE public.emotional_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  emotional_state TEXT NOT NULL DEFAULT 'neutro',
  had_argument BOOLEAN NOT NULL DEFAULT false,
  recovering_loss BOOLEAN NOT NULL DEFAULT false,
  slept_well BOOLEAN NOT NULL DEFAULT true,
  is_risky BOOLEAN NOT NULL DEFAULT false,
  proceeded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.emotional_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own checkins" ON public.emotional_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own checkins" ON public.emotional_checkins FOR SELECT USING (auth.uid() = user_id);

-- Trader diary entries
CREATE TABLE public.trader_diary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  emotional_state TEXT,
  mistakes TEXT,
  lessons TEXT,
  followed_plan BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trader_diary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own diary" ON public.trader_diary FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own diary" ON public.trader_diary FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own diary" ON public.trader_diary FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own diary" ON public.trader_diary FOR DELETE USING (auth.uid() = user_id);

-- Add stop_daily and stop_weekly to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stop_daily NUMERIC DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stop_weekly NUMERIC DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS discipline_score INTEGER DEFAULT 100;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS forced_pause_until TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS consecutive_losses INTEGER DEFAULT 0;

-- Add followed_plan to trades
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS followed_plan BOOLEAN DEFAULT true;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS observation TEXT DEFAULT NULL;
