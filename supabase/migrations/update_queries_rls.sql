-- Drop existing policies
DROP POLICY IF EXISTS "Users can create queries" ON public.queries;

-- Create new policy to allow anyone to create queries
CREATE POLICY "Anyone can create queries" ON public.queries
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Update the admin policy to be more specific
DROP POLICY IF EXISTS "Admins can manage all queries" ON public.queries;

CREATE POLICY "Admins can manage all queries" ON public.queries
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  ); 