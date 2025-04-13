-- Create a table for case information
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  case_number TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'closed', 'archived')),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lawyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  judge_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Clients can view their own cases
CREATE POLICY "Clients can view own cases" ON public.cases
  FOR SELECT TO authenticated
  USING (auth.uid() = client_id);

-- Lawyers can view assigned cases
CREATE POLICY "Lawyers can view assigned cases" ON public.cases
  FOR SELECT TO authenticated
  USING (
    auth.uid() = lawyer_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'lawyer'
    )
  );

-- Judges can view assigned cases
CREATE POLICY "Judges can view assigned cases" ON public.cases
  FOR SELECT TO authenticated
  USING (
    auth.uid() = judge_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'judge'
    )
  );

-- Admins can view all cases
CREATE POLICY "Admins can view all cases" ON public.cases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all cases
CREATE POLICY "Admins can manage all cases" ON public.cases
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add a policy to allow admins to insert cases
CREATE POLICY "Admins can insert cases" ON public.cases
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add a policy to allow admins to delete cases
CREATE POLICY "Admins can delete cases" ON public.cases
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
