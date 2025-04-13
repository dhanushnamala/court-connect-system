-- Add admin_reply column to queries table
ALTER TABLE public.queries
ADD COLUMN IF NOT EXISTS admin_reply TEXT,
ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP WITH TIME ZONE;

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