
# Supabase Setup for Court Connect System

This document provides instructions on how to set up Supabase for the Court Connect System.

## Environment Variables

Create a `.env` file in the root of your project with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace `your_supabase_url` and `your_supabase_anon_key` with the values from your Supabase project.

## Database Setup

1. Navigate to the SQL Editor in your Supabase dashboard.
2. Run the SQL scripts in the following order:
   - `supabase/migrations/create_profiles_table.sql`
   - `supabase/migrations/create_cases_table.sql`
   - `supabase/migrations/create_hearings_table.sql`
   - `supabase/migrations/create_documents_table.sql`
   - `supabase/migrations/create_queries_table.sql`
   - `supabase/migrations/create_lawyer_requests_table.sql`
   - `supabase/migrations/setup_storage.sql`

## Authentication Setup

1. Go to Authentication > Settings in your Supabase dashboard.
2. Enable Email provider.
3. Configure the Site URL to match your frontend URL.
4. Set up any additional providers as needed.

## Storage Setup

The storage buckets will be created automatically when you run the SQL scripts, but you'll need to ensure that Row Level Security (RLS) is enabled for the storage buckets.

## Email Templates

You may want to customize the email templates for:
- Email confirmation
- Password recovery
- Email change confirmation
- Invite email

These can be configured in the Authentication > Email Templates section of your Supabase dashboard.

## Testing

After setting up, you can test the authentication by:
1. Creating a new user through the signup form
2. Logging in with an existing user
3. Uploading a document to test storage
4. Creating a case to test database functionality
