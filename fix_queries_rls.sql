-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own queries" ON public.queries;
DROP POLICY IF EXISTS "Users can create queries" ON public.queries;
DROP POLICY IF EXISTS "Admins can manage all queries" ON public.queries;

-- Create a policy that allows anyone to create queries (for non-logged in users)
CREATE POLICY "Anyone can create queries" ON public.queries
  FOR INSERT
  WITH CHECK (true);

-- Users can view their own queries
CREATE POLICY "Users can view their own queries" ON public.queries
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view and manage all queries
CREATE POLICY "Admins can manage all queries" ON public.queries
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Make sure RLS is enabled
ALTER TABLE public.queries ENABLE ROW LEVEL SECURITY; 