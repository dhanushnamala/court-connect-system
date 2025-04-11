
-- Add a relationship between profiles and lawyer_requests
ALTER TABLE IF EXISTS public.lawyer_requests
DROP CONSTRAINT IF EXISTS lawyer_requests_lawyer_id_fkey;

-- Make sure you can query lawyer profiles when fetching lawyer requests
CREATE OR REPLACE FUNCTION public.get_lawyer_requests_with_profiles(client_uid uuid)
RETURNS TABLE (
  id uuid,
  client_id uuid,
  lawyer_id uuid,
  case_id uuid,
  status text,
  message text,
  created_at timestamptz,
  updated_at timestamptz,
  lawyer_name text,
  lawyer_email text,
  lawyer_specialization text
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lr.id,
    lr.client_id,
    lr.lawyer_id,
    lr.case_id,
    lr.status,
    lr.message,
    lr.created_at,
    lr.updated_at,
    p.name as lawyer_name,
    p.email as lawyer_email,
    COALESCE(
      (SELECT lu.specialization FROM lawyer_users lu WHERE lu.id = lr.lawyer_id),
      'General Practice'
    ) as lawyer_specialization
  FROM 
    lawyer_requests lr
  JOIN
    profiles p ON lr.lawyer_id = p.id
  WHERE 
    lr.client_id = client_uid;
END;
$$;

-- Ensure clients can view all available lawyers
CREATE POLICY "Clients can view all lawyers" 
ON public.profiles 
FOR SELECT 
USING (role = 'lawyer' OR auth.uid() = id);
