-- Update RLS policy for users table to require authentication
DROP POLICY IF EXISTS "Anyone can manage users" ON public.users;

-- Only authenticated users can manage users
CREATE POLICY "Only authenticated users can manage users" 
ON public.users 
FOR ALL 
USING (auth.role() = 'authenticated'::text);