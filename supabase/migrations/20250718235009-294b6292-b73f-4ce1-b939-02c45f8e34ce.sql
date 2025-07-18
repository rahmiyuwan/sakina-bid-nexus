-- Allow travel agents to update offerings for their own requests
CREATE POLICY "Travel agents can update offerings for their requests" 
ON public.offerings 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.requests 
    WHERE requests.id = offerings.request_id 
    AND requests.travel_workspace_id IN (
      SELECT workspace_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  )
);

-- Allow travel agents to view detailed offering information for their requests
CREATE POLICY "Travel agents can manage offerings for their requests" 
ON public.offerings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.requests 
    WHERE requests.id = offerings.request_id 
    AND requests.travel_workspace_id IN (
      SELECT workspace_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  )
);