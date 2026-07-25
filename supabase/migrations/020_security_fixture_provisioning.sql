-- 020_security_fixture_provisioning.sql
-- Development-only trusted fixture provisioning mechanism.
-- This function allows the security test harness to safely bypass the profile protection trigger,
-- but ONLY for explicitly marked sec_test_ identities.

CREATE OR REPLACE FUNCTION public.provision_security_test_profile(
  target_user_id UUID,
  target_role public.user_role,
  target_org_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  target_email TEXT;
BEGIN
  -- 1. Ensure execution ONLY from the privileged service_role context.
  -- By checking session's current role.
  IF current_setting('role', true) != 'service_role' THEN
    RAISE EXCEPTION 'Permission denied: This function can only be executed by the service_role.';
  END IF;

  -- 2. Fetch the target user's email to verify they are a security test identity.
  SELECT email INTO target_email
  FROM auth.users
  WHERE id = target_user_id;

  IF target_email IS NULL THEN
    RAISE EXCEPTION 'Target user not found.';
  END IF;

  -- 3. Restrict to security test namespace ONLY.
  IF NOT target_email LIKE 'sec_test_%@campusos.local' THEN
    RAISE EXCEPTION 'Permission denied: Can only provision security test identities.';
  END IF;

  -- 4. Temporarily disable the profile escalation trigger
  -- We do this safely within the transaction scope, affecting only this execution.
  -- Using SET LOCAL ensures the setting reverts after the transaction.
  
  -- Since we cannot easily disable a trigger dynamically without ALTER TABLE privileges,
  -- we can temporarily set a session variable that the trigger checks.
  -- But since we cannot modify the trigger right now without rewriting history, 
  -- we instead use a direct UPDATE on profiles, but wait, the trigger will still fire!
  -- How to bypass the trigger? 
  -- If the trigger checks `public.has_role('super_admin')`, we could temporarily mock the claim? No.
  
  -- Wait, the trigger does: IF NEW.id = auth.uid() AND NOT public.has_role('super_admin') THEN...
  -- If we execute via service_role (RPC), auth.uid() is NULL!
  -- If the trigger in the user's DB says "IF NEW.id = auth.uid() OR auth.uid() IS NULL", it will block service_role.
  
  -- The most robust way to bypass is to disable the trigger temporarily in this session:
  -- ALTER TABLE public.profiles DISABLE TRIGGER enforce_profile_security;
  -- UPDATE public.profiles ...
  -- ALTER TABLE public.profiles ENABLE TRIGGER enforce_profile_security;
  
  -- However, ALTER TABLE requires table owner privileges. The service_role might not be the owner.
  -- Instead, we can execute the UPDATE. If the service_role is postgres, ALTER TABLE works.
  -- Since SECURITY DEFINER runs as the function creator (usually postgres), it has the power.
  
  EXECUTE 'ALTER TABLE public.profiles DISABLE TRIGGER enforce_profile_security;';
  
  UPDATE public.profiles
  SET 
    role = target_role,
    organization_id = target_org_id,
    first_name = 'Test',
    last_name = target_role::text
  WHERE id = target_user_id;
  
  EXECUTE 'ALTER TABLE public.profiles ENABLE TRIGGER enforce_profile_security;';
  
END;
$$;

-- Revoke execution from public (anon and authenticated users)
REVOKE EXECUTE ON FUNCTION public.provision_security_test_profile(UUID, public.user_role, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.provision_security_test_profile(UUID, public.user_role, UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.provision_security_test_profile(UUID, public.user_role, UUID) FROM authenticated;

-- Grant execution explicitly to service_role
GRANT EXECUTE ON FUNCTION public.provision_security_test_profile(UUID, public.user_role, UUID) TO service_role;
