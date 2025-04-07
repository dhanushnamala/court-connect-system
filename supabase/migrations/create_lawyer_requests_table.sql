
-- Create a table for lawyer requests (when clients request a lawyer)
CREATE TABLE IF NOT EXISTS public.lawyer_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES auth.users(id) NOT NULL,
  lawyer_id UUID REFERENCES auth.users(id) NOT NULL,
  case_id UUID REFERENCES public.cases(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.lawyer_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Clients can view and create their own requests
CREATE POLICY "Clients can view their own requests" ON public.lawyer_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can create requests" ON public.lawyer_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = client_id);

-- Lawyers can view requests directed to them
CREATE POLICY "Lawyers can view their requests" ON public.lawyer_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = lawyer_id);

-- Lawyers can update their request status
CREATE POLICY "Lawyers can update their requests" ON public.lawyer_requests
  FOR UPDATE TO authenticated
  USING (auth.uid() = lawyer_id AND status = 'pending');

-- Admins can view and manage all requests
CREATE POLICY "Admins can manage all requests" ON public.lawyer_requests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
