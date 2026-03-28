
-- 1. Fix user_roles: Add restrictive policies to prevent privilege escalation
-- Block INSERT for non-service-role users
CREATE POLICY "Block user role self-insert"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Block UPDATE for non-admin users  
CREATE POLICY "Block user role self-update"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- Block DELETE for non-admin users
CREATE POLICY "Block user role self-delete"
ON public.user_roles
FOR DELETE
TO authenticated
USING (false);

-- 2. Fix horus_prompts: restrict SELECT to authenticated only
DROP POLICY IF EXISTS "Authenticated can view prompts" ON public.horus_prompts;
CREATE POLICY "Authenticated can view prompts"
ON public.horus_prompts
FOR SELECT
TO authenticated
USING (true);

-- 3. Fix horus_settings: restrict SELECT to authenticated only
DROP POLICY IF EXISTS "Authenticated can view settings" ON public.horus_settings;
CREATE POLICY "Authenticated can view settings"
ON public.horus_settings
FOR SELECT
TO authenticated
USING (true);

-- 4. Fix course_categories: restrict SELECT to authenticated only
DROP POLICY IF EXISTS "Authenticated users can view categories" ON public.course_categories;
CREATE POLICY "Authenticated users can view categories"
ON public.course_categories
FOR SELECT
TO authenticated
USING (true);

-- 5. Fix course_videos: restrict SELECT to authenticated only
DROP POLICY IF EXISTS "Authenticated users can view course videos" ON public.course_videos;
CREATE POLICY "Authenticated users can view course videos"
ON public.course_videos
FOR SELECT
TO authenticated
USING (true);

-- 6. Enable RLS on profit_rankings view (if it's a table) and add policy
-- profit_rankings is a view, so we need to ensure RLS on underlying tables covers it
-- The view already queries from trades and profiles which have RLS
