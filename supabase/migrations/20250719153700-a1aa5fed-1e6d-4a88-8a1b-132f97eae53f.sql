-- Update the notifications policy to restrict to super admins only
DROP POLICY "Admins can manage all notifications" ON public.notifications;

CREATE POLICY "Super admins can manage all notifications" 
ON public.notifications 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
);