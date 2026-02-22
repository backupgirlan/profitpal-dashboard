
-- Add is_vip column to profiles (default false, users need admin approval)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_vip boolean NOT NULL DEFAULT false;

-- Allow admins to update any profile (for VIP management)
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
