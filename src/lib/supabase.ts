
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://vhybphxmzlyesdfvusst.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJwaHhtemx5ZXNkZnZ1c3N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMDg0NDQsImV4cCI6MjA1OTU4NDQ0NH0.toAGZG_vrD8kQEd1L_rS8sadD_CTsccQLvRbXx-Gr_M';

// Create the Supabase client with proper configuration
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'court-connect-system'
    }
  }
});

// Ensure the documents bucket exists
export const ensureDocumentsBucket = async () => {
  try {
    // Check if the bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error("Error checking buckets:", error);
      return;
    }
    
    // Check if documents bucket exists
    const documentsBucket = buckets?.find(bucket => bucket.name === 'documents');
    
    if (!documentsBucket) {
      console.log("Documents bucket not found. Creating one...");
      
      // Create documents bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket('documents', {
        public: true, 
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'image/jpg']
      });
      
      if (createError) {
        console.error("Error creating documents bucket:", createError);
      } else {
        console.log("Documents bucket created successfully");
      }
    }
  } catch (err) {
    console.error("Error in ensureDocumentsBucket:", err);
  }
};
