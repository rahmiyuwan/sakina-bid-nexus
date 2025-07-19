-- Fix notifications RLS policies to allow users to create notifications for admins
-- Drop existing policies
DROP POLICY IF EXISTS "Super admins can manage all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;

-- Create new comprehensive policies
-- Admins and super admins can manage all notifications
CREATE POLICY "Admins can manage all notifications" 
ON public.notifications 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read, etc.)
CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow any authenticated user to create notifications for admins (needed for system notifications)
CREATE POLICY "Users can create notifications for admins" 
ON public.notifications 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    -- Allow users to create notifications for themselves
    auth.uid() = user_id 
    OR 
    -- Allow users to create notifications for admins (system notifications)
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = user_id 
      AND role IN ('admin', 'super_admin')
    )
  )
);

-- Allow users to delete their own notifications
CREATE POLICY "Users can delete their own notifications" 
ON public.notifications 
FOR DELETE 
USING (auth.uid() = user_id);