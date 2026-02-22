
-- Table for admin advice messages visible to all users
CREATE TABLE public.admin_advice (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admin_advice ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage advice" ON public.admin_advice
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view advice" ON public.admin_advice
FOR SELECT TO authenticated
USING (true);

-- Table for YouTube videos managed by admin
CREATE TABLE public.youtube_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  youtube_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage videos" ON public.youtube_videos
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view videos" ON public.youtube_videos
FOR SELECT TO authenticated
USING (true);
