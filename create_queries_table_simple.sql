-- Create a table for contact form queries
CREATE TABLE IF NOT EXISTS public.queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  admin_reply TEXT,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.queries ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to create queries
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