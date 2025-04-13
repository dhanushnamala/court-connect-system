-- Create storage buckets for profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile_images', 'Profile Images', true)
ON CONFLICT (id) DO NOTHING;

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
