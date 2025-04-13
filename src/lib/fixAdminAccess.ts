import { supabase } from './supabase';

/**
 * This function fixes the RLS policies for admin access
 * It can be called directly from the browser console to fix the issue
 */
export const fixAdminAccess = async () => {
  console.log('Fixing admin access policies...');
  
  try {
    // Fix cases table policies
    const { error: casesError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing policies for cases table
        DROP POLICY IF EXISTS "Admins can view all cases" ON public.cases;
        DROP POLICY IF EXISTS "Admins can manage all cases" ON public.cases;

        -- Create new policies for cases table
        CREATE POLICY "Admins can view all cases" ON public.cases
          FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM public.profiles
              WHERE id = auth.uid() AND role = 'admin'
            )
          );

        CREATE POLICY "Admins can manage all cases" ON public.cases
          FOR ALL
          USING (
            EXISTS (
              SELECT 1 FROM public.profiles
              WHERE id = auth.uid() AND role = 'admin'
            )
          );
      `
    });
    
    if (casesError) {
      console.error('Error fixing cases policies:', casesError);
    } else {
      console.log('Cases policies fixed successfully');
    }
    
    // Fix profiles table policies
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing policies for profiles table
        DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
        DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

        -- Create new policies for profiles table
        CREATE POLICY "Admins can view all profiles" ON public.profiles
          FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM public.profiles
              WHERE id = auth.uid() AND role = 'admin'
            )
          );

        CREATE POLICY "Admins can manage all profiles" ON public.profiles
          FOR ALL
          USING (
            EXISTS (
              SELECT 1 FROM public.profiles
              WHERE id = auth.uid() AND role = 'admin'
            )
          );
      `
    });
    
    if (profilesError) {
      console.error('Error fixing profiles policies:', profilesError);
    } else {
      console.log('Profiles policies fixed successfully');
    }
    
    // Fix hearings table policies
    const { error: hearingsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing policies for hearings table
        DROP POLICY IF EXISTS "Admins can manage all hearings" ON public.hearings;

        -- Create new policies for hearings table
        CREATE POLICY "Admins can manage all hearings" ON public.hearings
          FOR ALL
          USING (
            EXISTS (
              SELECT 1 FROM public.profiles
              WHERE id = auth.uid() AND role = 'admin'
            )
          );
      `
    });
    
    if (hearingsError) {
      console.error('Error fixing hearings policies:', hearingsError);
    } else {
      console.log('Hearings policies fixed successfully');
    }
    
    // Fix queries table policies
    const { error: queriesError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing policies for queries table
        DROP POLICY IF EXISTS "Admins can manage all queries" ON public.queries;

        -- Create new policies for queries table
        CREATE POLICY "Admins can manage all queries" ON public.queries
          FOR ALL
          USING (
            EXISTS (
              SELECT 1 FROM public.profiles
              WHERE id = auth.uid() AND role = 'admin'
            )
          );
      `
    });
    
    if (queriesError) {
      console.error('Error fixing queries policies:', queriesError);
    } else {
      console.log('Queries policies fixed successfully');
    }
    
    console.log('Admin access policies fixed successfully');
    return true;
  } catch (error) {
    console.error('Error fixing admin access:', error);
    return false;
  }
}; 