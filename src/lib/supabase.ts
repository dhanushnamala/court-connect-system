
import { createClient } from '@supabase/supabase-js';

// Development fallback values - only used if env variables are not set
// In production, these should be set as environment variables
const FALLBACK_URL = 'https://your-project-id.supabase.co';
const FALLBACK_KEY = 'your-anon-key';

// Try to get values from environment variables, fallback to development values if not set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_KEY;

// Check if we're using the fallbacks and warn developer
if (supabaseUrl === FALLBACK_URL || supabaseKey === FALLBACK_KEY) {
  console.warn(
    'Using development fallback values for Supabase configuration. ' +
    'For production, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
