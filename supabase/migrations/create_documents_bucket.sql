
-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', true, 10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents
CREATE POLICY "Documents are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Users can upload any document" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Document owners can update their documents" ON storage.objects
  FOR UPDATE USING (bucket_id = 'documents' AND auth.uid() = owner);

CREATE POLICY "Document owners can delete their documents" ON storage.objects
  FOR DELETE USING (bucket_id = 'documents' AND auth.uid() = owner);
