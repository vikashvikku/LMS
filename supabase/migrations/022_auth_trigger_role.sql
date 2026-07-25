-- 022_auth_trigger_role.sql
-- Safely allow public signup of Student and Faculty roles only.

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  default_org_id UUID;
  requested_role TEXT;
  assigned_role public.user_role;
BEGIN
  -- Fetch a default organization
  SELECT id INTO default_org_id FROM public.organizations ORDER BY created_at ASC LIMIT 1;
  
  IF default_org_id IS NULL THEN
      -- Create a fallback organization if none exists to prevent signup failure
      INSERT INTO public.organizations (name, domain) VALUES ('Default Organization', 'default.edu') RETURNING id INTO default_org_id;
  END IF;

  requested_role := NEW.raw_user_meta_data->>'role';
  
  -- Explicitly allowlist ONLY 'faculty' and 'student' for public signup.
  -- Any other value (including null, or malicious values like 'super_admin') safely defaults to 'student'.
  IF requested_role = 'faculty' THEN
      assigned_role := 'faculty'::public.user_role;
  ELSE
      assigned_role := 'student'::public.user_role;
  END IF;

  INSERT INTO public.profiles (id, organization_id, first_name, last_name, role)
  VALUES (
    NEW.id,
    default_org_id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
    assigned_role
  );
  
  RETURN NEW;
END;
$$;
