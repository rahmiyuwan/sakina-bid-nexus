
-- Fix the notify_new_user_registration function to handle UUID types correctly
CREATE OR REPLACE FUNCTION public.notify_new_user_registration()
RETURNS TRIGGER AS $$
DECLARE
  admin_user RECORD;
BEGIN
  -- Insert notifications for all admin and super admin users
  FOR admin_user IN 
    SELECT id FROM public.profiles 
    WHERE role IN ('admin', 'super_admin') 
    AND is_active = true 
  LOOP
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
      admin_user.id,
      'New User Registration',
      'A new user has registered: ' || COALESCE(NEW.full_name, NEW.email),
      'info',
      false,
      true,
      'user',
      NEW.id,
      COALESCE(NEW.full_name, NEW.email)
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
