
-- Modify the lawyer_requests table to fix the relationship issue with lawyer profiles
ALTER TABLE IF EXISTS public.lawyer_requests
DROP CONSTRAINT IF EXISTS lawyer_requests_lawyer_id_fkey;

-- Re-add the constraint properly
ALTER TABLE public.lawyer_requests
ADD CONSTRAINT lawyer_requests_lawyer_id_fkey 
FOREIGN KEY (lawyer_id) REFERENCES auth.users(id);

-- Enable RLS policy for joining with profiles
CREATE POLICY "Allow profiles selection for lawyer_requests" 
ON public.profiles 
FOR SELECT 
USING (true);
