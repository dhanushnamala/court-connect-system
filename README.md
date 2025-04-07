
# Court Connect System

A comprehensive court case management system built with React, TypeScript, and Supabase.

## Supabase Configuration

To run this application, you need to configure Supabase:

1. Create a `.env` file in the root directory
2. Add the following environment variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Replace `your-project-id` and `your-anon-key` with your actual Supabase project values.

3. If developing locally, you can also edit the fallback values in `src/lib/supabase.ts`

See `SUPABASE_SETUP.md` for more detailed instructions on setting up your Supabase project.
