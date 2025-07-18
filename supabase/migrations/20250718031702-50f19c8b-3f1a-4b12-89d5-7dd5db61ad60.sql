-- Update RLS policies to allow anonymous users to read user data for login
-- This is needed because our login system needs to query the users table without authentication

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage users" ON public.users;
DROP POLICY IF EXISTS "Users can view users" ON public.users;

-- Create new policies that allow anonymous access for reading users (needed for login)
CREATE POLICY "Anyone can view users" 
ON public.users 
FOR SELECT 
USING (true);

-- Restrict other operations to authenticated users
CREATE POLICY "Only authenticated users can manage users" 
ON public.users 
FOR ALL 
USING (auth.role() = 'authenticated');