-- Add type field to cases table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'type'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN type TEXT CHECK (type IN ('civil', 'criminal', 'family', 'corporate'));
    END IF;
END $$;

-- Update the appealed status in cases table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'cases_status_check' AND 
              constraint_definition LIKE '%appealed%'
    ) THEN
        ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS cases_status_check;
        ALTER TABLE public.cases ADD CONSTRAINT cases_status_check 
            CHECK (status IN ('pending', 'active', 'closed', 'archived', 'appealed'));
    END IF;
END $$;

-- Create a view for cases with related data
CREATE OR REPLACE VIEW public.cases_with_related_data AS
SELECT 
    c.*,
    client.name AS client_name,
    client.email AS client_email,
    lawyer.name AS lawyer_name,
    lawyer.email AS lawyer_email,
    judge.name AS judge_name,
    judge.email AS judge_email
FROM 
    public.cases c
LEFT JOIN 
    public.profiles client ON c.client_id = client.id
LEFT JOIN 
    public.profiles lawyer ON c.lawyer_id = lawyer.id
LEFT JOIN 
    public.profiles judge ON c.judge_id = judge.id;

-- Grant access to the view
GRANT SELECT ON public.cases_with_related_data TO authenticated; 