-- 018_auth_trigger.sql
-- Safely create a profile when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  default_org_id UUID;
BEGIN
  -- Fetch a default organization (for demonstration; in production, you might pass this in user_metadata or have a dedicated default)
  -- If we don't have an org, we can't create the profile due to NOT NULL constraint.
  SELECT id INTO default_org_id FROM public.organizations ORDER BY created_at ASC LIMIT 1;
  
  IF default_org_id IS NULL THEN
      -- Create a fallback organization if none exists to prevent signup failure
      INSERT INTO public.organizations (name, domain) VALUES ('Default Organization', 'default.edu') RETURNING id INTO default_org_id;
  END IF;

  INSERT INTO public.profiles (id, organization_id, first_name, last_name, role)
  VALUES (
    NEW.id,
    default_org_id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
    'student'::public.user_role -- Hardcoded safe default. NEVER trust client metadata for roles.
  );
  
  RETURN NEW;
END;
$$;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
