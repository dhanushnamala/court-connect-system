-- Drop the table if it exists to start fresh
DROP TABLE IF EXISTS public.queries;

-- Create a table for contact form queries
CREATE TABLE public.queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('new', 'pending', 'resolved')) DEFAULT 'new',
  admin_reply TEXT,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.queries ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Anyone can create queries (for non-logged in users)
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

-- Update the updated_at timestamp when admin_reply is set
CREATE OR REPLACE FUNCTION update_queries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  IF NEW.admin_reply IS NOT NULL AND OLD.admin_reply IS NULL THEN
    NEW.replied_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_queries_updated_at
  BEFORE UPDATE ON public.queries
  FOR EACH ROW
  EXECUTE FUNCTION update_queries_updated_at(); 