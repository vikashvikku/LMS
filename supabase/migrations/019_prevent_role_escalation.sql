-- 019_prevent_role_escalation.sql
-- Fix the known role escalation vulnerability by enforcing that non-super_admins cannot modify their own role or organization_id

CREATE OR REPLACE FUNCTION public.prevent_profile_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    -- 1. Users cannot change their OWN role or organization_id, unless they are a super_admin.
    IF NEW.id = auth.uid() AND NOT public.has_role('super_admin') THEN
        IF NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION 'Permission denied: You cannot modify your own role.';
        END IF;
        IF NEW.organization_id IS DISTINCT FROM OLD.organization_id THEN
            RAISE EXCEPTION 'Permission denied: You cannot change your own organization membership.';
        END IF;
    END IF;

    -- 2. Non-super_admins cannot assign the 'super_admin' role to ANYONE.
    IF NEW.role = 'super_admin' AND OLD.role IS DISTINCT FROM 'super_admin' THEN
        IF NOT public.has_role('super_admin') THEN
            RAISE EXCEPTION 'Permission denied: Only super_admins can grant super_admin privileges.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_profile_security ON public.profiles;

CREATE TRIGGER enforce_profile_security
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_profile_escalation();
