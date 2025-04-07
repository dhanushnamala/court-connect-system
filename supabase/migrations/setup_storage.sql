
-- Create storage buckets for document storage
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('case_documents', 'Case Documents', false),
  ('profile_images', 'Profile Images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for case documents
CREATE POLICY "Users can view their case documents" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'case_documents' AND
    (
      -- Get case ID from the path
      EXISTS (
        SELECT 1 FROM public.cases c
        WHERE 
          c.id::text = SPLIT_PART(storage.objects.name, '/', 1) AND
          (c.client_id = auth.uid() OR c.lawyer_id = auth.uid() OR c.judge_id = auth.uid())
      ) OR
      -- Admin can view all documents
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Users can upload case documents
CREATE POLICY "Users can upload their case documents" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'case_documents' AND
    (
      -- Get case ID from the path
      EXISTS (
        SELECT 1 FROM public.cases c
        WHERE 
          c.id::text = SPLIT_PART(storage.objects.name, '/', 1) AND
          (c.client_id = auth.uid() OR c.lawyer_id = auth.uid())
      ) OR
      -- Admin can add documents
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Set up storage policies for profile images
CREATE POLICY "Users can view profile images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'profile_images');

CREATE POLICY "Users can upload their own profile image" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'profile_images' AND
    auth.uid()::text = SPLIT_PART(storage.objects.name, '/', 1)
  );

CREATE POLICY "Users can update their own profile image" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'profile_images' AND
    auth.uid()::text = SPLIT_PART(storage.objects.name, '/', 1)
  );

CREATE POLICY "Users can delete their own profile image" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'profile_images' AND
    auth.uid()::text = SPLIT_PART(storage.objects.name, '/', 1)
  );
