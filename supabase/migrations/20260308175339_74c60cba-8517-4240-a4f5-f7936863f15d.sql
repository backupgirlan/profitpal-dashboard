
-- Table for trader dialog chat messages
CREATE TABLE public.trader_dialog_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trader_dialog_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own messages" ON public.trader_dialog_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON public.trader_dialog_messages
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON public.trader_dialog_messages
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all messages" ON public.trader_dialog_messages
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Table for full account analyses
CREATE TABLE public.account_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'medio',
  summary TEXT,
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  patterns TEXT[] DEFAULT '{}',
  improvements TEXT[] DEFAULT '{}',
  insights TEXT[] DEFAULT '{}',
  final_phrase TEXT,
  full_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.account_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own analyses" ON public.account_analyses
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own analyses" ON public.account_analyses
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analyses" ON public.account_analyses
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Add dialog usage tracking to ai_usage
ALTER TABLE public.ai_usage ADD COLUMN IF NOT EXISTS dialog_used_today INTEGER NOT NULL DEFAULT 0;

-- Add index for faster queries
CREATE INDEX idx_trader_dialog_user_date ON public.trader_dialog_messages (user_id, created_at DESC);
CREATE INDEX idx_account_analyses_user_date ON public.account_analyses (user_id, created_at DESC);
