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
