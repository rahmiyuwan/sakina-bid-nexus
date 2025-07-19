-- Update the handle_new_user function to properly handle workspace_id and role from signup data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, username, role, workspace_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'travel_agent'::user_role),
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'workspace_id' IS NOT NULL AND NEW.raw_user_meta_data ->> 'workspace_id' != 'null'
      THEN (NEW.raw_user_meta_data ->> 'workspace_id')::uuid
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$;