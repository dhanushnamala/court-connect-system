-- Ensure the queries table exists with all necessary columns
CREATE TABLE IF NOT EXISTS public.queries (
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own queries" ON public.queries;
DROP POLICY IF EXISTS "Users can create queries" ON public.queries;
DROP POLICY IF EXISTS "Admins can manage all queries" ON public.queries;
DROP POLICY IF EXISTS "Anyone can create queries" ON public.queries;

-- Create policies
-- Users can view their own queries
CREATE POLICY "Users can view their own queries" ON public.queries
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Anyone can create queries
CREATE POLICY "Anyone can create queries" ON public.queries
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Admins can view and manage all queries
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

-- Create or replace the trigger function for updating timestamps
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

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS update_queries_updated_at ON public.queries;

-- Create the trigger
CREATE TRIGGER update_queries_updated_at
  BEFORE UPDATE ON public.queries
  FOR EACH ROW
  EXECUTE FUNCTION update_queries_updated_at(); 