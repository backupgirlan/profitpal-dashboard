ALTER TABLE public.horus_print_analyses ADD COLUMN result text DEFAULT NULL;
ALTER TABLE public.horus_print_analyses ADD COLUMN feedback_note text DEFAULT NULL;

-- Allow users to update their own print analyses (for feedback)
CREATE POLICY "Users can update own print analyses"
ON public.horus_print_analyses
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);