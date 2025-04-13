-- Fix admin access to views and tables

-- Drop existing policies for cases_with_related_data view
DROP POLICY IF EXISTS "Admins can view all cases with related data" ON public.cases_with_related_data;

-- Create new policy for cases_with_related_data view
CREATE POLICY "Admins can view all cases with related data" ON public.cases_with_related_data
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Drop existing policies for hearings_with_related_data view
DROP POLICY IF EXISTS "Admins can view all hearings with related data" ON public.hearings_with_related_data;

-- Create new policy for hearings_with_related_data view
CREATE POLICY "Admins can view all hearings with related data" ON public.hearings_with_related_data
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Ensure admin has access to all tables
GRANT ALL ON public.cases TO authenticated;
GRANT ALL ON public.hearings TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- Ensure admin has access to all views
GRANT ALL ON public.cases_with_related_data TO authenticated;
GRANT ALL ON public.hearings_with_related_data TO authenticated;

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get all cases for admin
CREATE OR REPLACE FUNCTION public.get_all_cases_for_admin()
RETURNS SETOF public.cases_with_related_data AS $$
BEGIN
  IF public.is_admin() THEN
    RETURN QUERY SELECT * FROM public.cases_with_related_data;
  ELSE
    RAISE EXCEPTION 'Not authorized';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get all hearings for admin
CREATE OR REPLACE FUNCTION public.get_all_hearings_for_admin()
RETURNS SETOF public.hearings_with_related_data AS $$
BEGIN
  IF public.is_admin() THEN
    RETURN QUERY SELECT * FROM public.hearings_with_related_data;
  ELSE
    RAISE EXCEPTION 'Not authorized';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 