-- Fix foreign key relationships for AdminDashboard

-- Add judge_id to hearings table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'hearings' AND column_name = 'judge_id'
    ) THEN
        ALTER TABLE public.hearings ADD COLUMN judge_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add courtroom and duration to hearings table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'hearings' AND column_name = 'courtroom'
    ) THEN
        ALTER TABLE public.hearings ADD COLUMN courtroom TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'hearings' AND column_name = 'duration'
    ) THEN
        ALTER TABLE public.hearings ADD COLUMN duration INTEGER;
    END IF;
END $$;

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

-- Grant access to the views
GRANT SELECT ON public.cases_with_related_data TO authenticated;
GRANT SELECT ON public.hearings_with_related_data TO authenticated; 