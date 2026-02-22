
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  balance NUMERIC DEFAULT 0,
  stop_loss NUMERIC DEFAULT 0,
  stop_win NUMERIC DEFAULT 0,
  soros_enabled BOOLEAN DEFAULT false,
  soros_level INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_login_date DATE,
  total_profit NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trades/operations table
CREATE TABLE public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pair_name TEXT NOT NULL,
  payout NUMERIC NOT NULL,
  result TEXT CHECK (result IN ('win', 'loss')) NOT NULL,
  amount NUMERIC DEFAULT 0,
  profit NUMERIC DEFAULT 0,
  soros_level INTEGER DEFAULT 0,
  trade_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trades" ON public.trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trades" ON public.trades FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own trades" ON public.trades FOR DELETE USING (auth.uid() = user_id);

-- User roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Admin messages
CREATE TABLE public.admin_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_global BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages" ON public.admin_messages FOR SELECT USING (
  auth.uid() = target_user_id OR is_global = true
);
CREATE POLICY "Users can update read status" ON public.admin_messages FOR UPDATE USING (
  auth.uid() = target_user_id OR is_global = true
);
CREATE POLICY "Admins can insert messages" ON public.admin_messages FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'admin')
);

-- Psychology content
CREATE TABLE public.psychology_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'motivacional',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.psychology_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view" ON public.psychology_content FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage" ON public.psychology_content FOR ALL USING (
  public.has_role(auth.uid(), 'admin')
);

-- Rankings view (profits)
CREATE OR REPLACE VIEW public.profit_rankings AS
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

-- Daily rewards tracking
CREATE TABLE public.daily_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reward_date DATE DEFAULT CURRENT_DATE,
  reward_type TEXT DEFAULT 'login',
  claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, reward_date, reward_type)
);

ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rewards" ON public.daily_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can claim rewards" ON public.daily_rewards FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
