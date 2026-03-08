
-- Seed default Horus settings if not exists
INSERT INTO public.horus_settings (setting_key, setting_value, setting_type) VALUES
  ('ia_model', 'google/gemini-2.5-flash', 'select'),
  ('daily_behavioral_limit', '10', 'number'),
  ('daily_print_limit', '10', 'number'),
  ('monthly_limit', '300', 'number'),
  ('min_confidence', '60', 'number'),
  ('unlimited_access', 'false', 'boolean'),
  ('m5_enabled', 'true', 'boolean'),
  ('m15_enabled', 'true', 'boolean'),
  ('ia_access_mode', 'super_vip_only', 'select'),
  ('trial_enabled', 'false', 'boolean'),
  ('block_expired', 'true', 'boolean')
ON CONFLICT DO NOTHING;

-- Seed default Horus prompts if not exists
INSERT INTO public.horus_prompts (prompt_key, prompt_label, prompt_value) VALUES
  ('behavior_system', 'Prompt da Análise Comportamental', 'Você é a Horus IA, analista de performance e comportamento de traders de opções binárias. Seja objetivo, profissional e curto. Responda SEMPRE usando a tool behavioral_analysis. Não faça promessas de lucro. Não dê diagnóstico clínico. Atue como analista de dados comportamentais. Análise probabilística apenas.'),
  ('image_analysis', 'Prompt da Leitura de Print', 'Você é a Horus IA, especialista em leitura de gráficos de opções binárias. Analise o print do gráfico. Responda SEMPRE usando a tool chart_analysis. Se a imagem não for clara, retorne confiança baixa. Análise probabilística apenas, sem garantias.'),
  ('tone_verdade_dura', 'Tom: Verdade Dura', 'Seja brutalmente honesto. Não suavize a verdade. O trader precisa ouvir a realidade dos números.'),
  ('tone_acolhedor', 'Tom: Acolhedor', 'Seja empático e acolhedor, mas honesto sobre os dados. Incentive com base em fatos.'),
  ('alerts_prompt', 'Prompt de Alertas Automáticos', 'Gere alertas curtos quando detectar padrões de risco no comportamento do trader.')
ON CONFLICT DO NOTHING;
