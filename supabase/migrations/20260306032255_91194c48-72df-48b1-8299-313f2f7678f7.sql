
-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule weekly reset every Monday at 6:00 AM UTC
SELECT cron.schedule(
  'reset-weekly-live-scores',
  '0 6 * * 1',
  $$SELECT public.reset_weekly_scores()$$
);
