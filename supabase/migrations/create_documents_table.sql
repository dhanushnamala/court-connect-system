
-- Create a table for document information
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES public.cases(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view documents for their cases
CREATE POLICY "Users can view documents for their cases" ON public.documents
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE id = documents.case_id AND (
        client_id = auth.uid() OR
        lawyer_id = auth.uid() OR
        judge_id = auth.uid()
      )
    ) OR
    uploaded_by = auth.uid()
  );

-- Users can create documents
CREATE POLICY "Users can upload documents" ON public.documents
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

-- Judges and admins can update document status
CREATE POLICY "Judges and admins can update document status" ON public.documents
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE c.id = documents.case_id AND (
        c.judge_id = auth.uid() OR
        p.role = 'admin'
      )
    )
  );
