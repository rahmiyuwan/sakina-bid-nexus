-- Drop the current overly permissive policies on requests table
DROP POLICY IF EXISTS "Anyone can manage requests" ON public.requests;
DROP POLICY IF EXISTS "Anyone can view requests" ON public.requests;

-- Create proper RLS policies for requests table
-- Travel agents can only view/manage requests from their workspace
CREATE POLICY "Travel agents can view their workspace requests" 
ON public.requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'travel_agent' 
    AND workspace_id = requests.travel_workspace_id
  )
);

CREATE POLICY "Travel agents can manage their workspace requests" 
ON public.requests 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'travel_agent' 
    AND workspace_id = requests.travel_workspace_id
  )
);

-- Admins can view and manage all requests
CREATE POLICY "Admins can view all requests" 
ON public.requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admins can manage all requests" 
ON public.requests 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- Hotel providers can view requests to create offerings
CREATE POLICY "Hotel providers can view requests" 
ON public.requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'hotel_provider'
  )
);

-- Travel agents can insert requests for their workspace
CREATE POLICY "Travel agents can create requests for their workspace" 
ON public.requests 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'travel_agent' 
    AND workspace_id = requests.travel_workspace_id
  )
);