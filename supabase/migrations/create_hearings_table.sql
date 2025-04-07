
-- Create a table for hearing information
CREATE TABLE IF NOT EXISTS public.hearings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES public.cases(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'postponed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.hearings ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view hearings for their cases
CREATE POLICY "Users can view hearings for their cases" ON public.hearings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE id = hearings.case_id AND (
        client_id = auth.uid() OR
        lawyer_id = auth.uid() OR
        judge_id = auth.uid()
      )
    )
  );

-- Judges can update hearings for their cases
CREATE POLICY "Judges can update hearings" ON public.hearings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE c.id = hearings.case_id AND (
        c.judge_id = auth.uid() OR
        p.role = 'admin'
      )
    )
  );

-- Admins can manage all hearings
CREATE POLICY "Admins can manage all hearings" ON public.hearings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
