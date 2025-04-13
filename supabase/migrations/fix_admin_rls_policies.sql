-- Fix RLS policies for admin access

-- Drop existing policies for cases table
DROP POLICY IF EXISTS "Admins can view all cases" ON public.cases;
DROP POLICY IF EXISTS "Admins can manage all cases" ON public.cases;

-- Create new policies for cases table
CREATE POLICY "Admins can view all cases" ON public.cases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all cases" ON public.cases
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Drop existing policies for profiles table
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create new policies for profiles table
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Drop existing policies for hearings table
DROP POLICY IF EXISTS "Admins can manage all hearings" ON public.hearings;

-- Create new policies for hearings table
CREATE POLICY "Admins can manage all hearings" ON public.hearings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Drop existing policies for queries table
DROP POLICY IF EXISTS "Admins can manage all queries" ON public.queries;

-- Create new policies for queries table
CREATE POLICY "Admins can manage all queries" ON public.queries
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  ); 