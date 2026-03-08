
-- AI usage tracking table
CREATE TABLE public.ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  behavior_used_today integer NOT NULL DEFAULT 0,
  image_used_today integer NOT NULL DEFAULT 0,
  last_request_at timestamp with time zone,
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, usage_date)
);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON public.ai_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage" ON public.ai_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own usage" ON public.ai_usage FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all usage" ON public.ai_usage FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all usage" ON public.ai_usage FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for chart images
INSERT INTO storage.buckets (id, name, public) VALUES ('chart-images', 'chart-images', false);

-- Storage policies
CREATE POLICY "Users can upload chart images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chart-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can view own chart images" ON storage.objects FOR SELECT USING (bucket_id = 'chart-images' AND auth.uid() IS NOT NULL);
