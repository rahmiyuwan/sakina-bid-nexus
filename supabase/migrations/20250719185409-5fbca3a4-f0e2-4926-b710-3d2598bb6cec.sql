-- Create a security definer function to handle notification creation
CREATE OR REPLACE FUNCTION public.create_notification_for_user(
  target_user_id UUID,
  notification_title TEXT,
  notification_message TEXT,
  notification_type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  action_required BOOLEAN DEFAULT false,
  related_entity_type TEXT DEFAULT NULL,
  related_entity_id UUID DEFAULT NULL,
  related_entity_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id, 
    title, 
    message, 
    type, 
    is_read, 
    action_required, 
    related_entity_type, 
    related_entity_id, 
    related_entity_name
  ) VALUES (
    target_user_id,
    notification_title,
    notification_message,
    notification_type,
    is_read,
    action_required,
    related_entity_type,
    related_entity_id,
    related_entity_name
  ) RETURNING id INTO new_notification_id;
  
  RETURN new_notification_id;
END;
$$;