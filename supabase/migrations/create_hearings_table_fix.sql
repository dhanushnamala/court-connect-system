-- Create hearings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.hearings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES public.cases(id) NOT NULL,
  judge_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  time TEXT NOT NULL,
  location TEXT,
  courtroom TEXT,
  duration INTEGER,
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

-- Add a policy to allow admins to insert hearings
CREATE POLICY "Admins can insert hearings" ON public.hearings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add a policy to allow admins to delete hearings
CREATE POLICY "Admins can delete hearings" ON public.hearings
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create a view for hearings with related data
CREATE OR REPLACE VIEW public.hearings_with_related_data AS
SELECT 
    h.*,
    c.title AS case_title,
    c.case_number,
    judge.name AS judge_name
FROM 
    public.hearings h
LEFT JOIN 
    public.cases c ON h.case_id = c.id
LEFT JOIN 
    public.profiles judge ON h.judge_id = judge.id;

-- Grant access to the view
GRANT SELECT ON public.hearings_with_related_data TO authenticated; 