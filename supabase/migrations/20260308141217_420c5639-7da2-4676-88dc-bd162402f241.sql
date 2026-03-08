
-- Super VIP subscriptions table
CREATE TABLE public.super_vip_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_name text NOT NULL DEFAULT 'Super VIP',
  price numeric NOT NULL DEFAULT 29.90,
  status text NOT NULL DEFAULT 'inactive',
  payment_method text DEFAULT 'pix',
  payment_id text,
  activated_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.super_vip_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" ON public.super_vip_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON public.super_vip_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all subscriptions" ON public.super_vip_subscriptions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Horus IA analyses (behavioral)
CREATE TABLE public.horus_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  analysis_type text NOT NULL DEFAULT 'behavioral',
  tone text NOT NULL DEFAULT 'equilibrado',
  prompt_used text,
  response text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.horus_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own analyses" ON public.horus_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analyses" ON public.horus_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all analyses" ON public.horus_analyses FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Horus IA print analyses (chart reading)
CREATE TABLE public.horus_print_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  image_url text,
  timeframe text NOT NULL DEFAULT 'M5',
  scenario text,
  entry_time text,
  exit_time text,
  confidence integer,
  raw_response text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.horus_print_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own print analyses" ON public.horus_print_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own print analyses" ON public.horus_print_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all print analyses" ON public.horus_print_analyses FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- IA Prompts (admin-editable)
CREATE TABLE public.horus_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_key text NOT NULL UNIQUE,
  prompt_label text NOT NULL,
  prompt_value text NOT NULL DEFAULT '',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.horus_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage prompts" ON public.horus_prompts FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated can view prompts" ON public.horus_prompts FOR SELECT USING (true);

-- Insert default prompts
INSERT INTO public.horus_prompts (prompt_key, prompt_label, prompt_value) VALUES
('behavioral', 'Análise Comportamental', 'Analise o comportamento do trader com base nos dados fornecidos. Seja objetivo, firme e profissional.'),
('print_reading', 'Leitura de Print', 'Analise o gráfico enviado e forneça cenário (Compra/Venda), entrada estimada, saída estimada e confiança em %.'),
('tone_friendly', 'Tom Acolhedor', 'Use linguagem empática e encorajadora.'),
('tone_balanced', 'Tom Equilibrado', 'Use linguagem profissional e equilibrada.'),
('tone_firm', 'Tom Firme', 'Seja direto e disciplinador.'),
('tone_harsh', 'Verdade Dura', 'Seja brutalmente honesto sobre os erros.'),
('tilt_alert', 'Alerta de Tilt', 'Detecte padrões de tilt emocional e alerte o trader.'),
('discipline', 'Orientação de Disciplina', 'Oriente o trader sobre disciplina operacional.');

-- IA Settings (admin config)
CREATE TABLE public.horus_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value text NOT NULL DEFAULT '',
  setting_type text NOT NULL DEFAULT 'text',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.horus_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage settings" ON public.horus_settings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated can view settings" ON public.horus_settings FOR SELECT USING (true);

-- Insert default settings
INSERT INTO public.horus_settings (setting_key, setting_value, setting_type) VALUES
('ia_access_mode', 'super_vip_only', 'select'),
('trial_enabled', 'false', 'boolean'),
('trial_days', '7', 'number'),
('block_expired', 'true', 'boolean'),
('daily_print_limit', '10', 'number'),
('daily_behavioral_limit', '5', 'number'),
('monthly_limit', '200', 'number'),
('unlimited_access', 'false', 'boolean'),
('min_confidence', '60', 'number'),
('m5_enabled', 'true', 'boolean'),
('m15_enabled', 'true', 'boolean'),
('ia_model', 'gemini-2.5-flash', 'text'),
('mercadopago_public_key', '', 'secret'),
('mercadopago_access_token', '', 'secret'),
('mercadopago_client_id', '', 'secret'),
('mercadopago_client_secret', '', 'secret'),
('mercadopago_webhook_url', '', 'text'),
('mercadopago_environment', 'sandbox', 'select'),
('mercadopago_status', 'inactive', 'select'),
('mercadopago_auto_qr', 'false', 'boolean'),
('mercadopago_auto_checkout', 'false', 'boolean'),
('mercadopago_auto_confirm', 'false', 'boolean'),
('mercadopago_auto_upgrade', 'false', 'boolean');

-- Add is_super_vip to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_vip boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS super_vip_expires_at timestamp with time zone;
