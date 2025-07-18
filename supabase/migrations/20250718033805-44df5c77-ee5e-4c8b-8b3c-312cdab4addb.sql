-- Fix RLS policies for settings, requests, and hotels tables to allow anonymous access for admin functionality

-- Drop existing problematic policies for settings
DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;
DROP POLICY IF EXISTS "Users can view settings" ON public.settings;

-- Create new settings policies that allow all users to access settings data
CREATE POLICY "Anyone can view settings" 
ON public.settings 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can manage settings" 
ON public.settings 
FOR ALL 
USING (true);

-- Drop existing policies for requests
DROP POLICY IF EXISTS "Users can manage requests" ON public.requests;
DROP POLICY IF EXISTS "Users can view requests" ON public.requests;

-- Create new requests policies
CREATE POLICY "Anyone can view requests" 
ON public.requests 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can manage requests" 
ON public.requests 
FOR ALL 
USING (true);

-- Drop existing policies for hotels
DROP POLICY IF EXISTS "Users can manage hotels" ON public.hotels;
DROP POLICY IF EXISTS "Users can view hotels" ON public.hotels;

-- Create new hotels policies
CREATE POLICY "Anyone can view hotels" 
ON public.hotels 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can manage hotels" 
ON public.hotels 
FOR ALL 
USING (true);