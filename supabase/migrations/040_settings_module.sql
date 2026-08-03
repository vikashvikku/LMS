-- 040_settings_module.sql

-- 1. Enhance organizations table
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS code TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. Enhance departments table
ALTER TABLE public.departments
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- 3. Enhance semesters table
ALTER TABLE public.semesters
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT false;

-- 4. Create organization_settings table for branding and notifications
CREATE TABLE IF NOT EXISTS public.organization_settings (
    organization_id UUID PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
    branding_primary_color TEXT DEFAULT '#0f172a',
    branding_secondary_color TEXT DEFAULT '#334155',
    branding_logo_url TEXT,
    notification_email BOOLEAN DEFAULT true,
    notification_announcements BOOLEAN DEFAULT true,
    notification_fees BOOLEAN DEFAULT true,
    notification_students BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_organization_settings_updated_at ON public.organization_settings;
CREATE TRIGGER set_organization_settings_updated_at
BEFORE UPDATE ON public.organization_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on organization_settings
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;

-- Policies for organization_settings & admin management of settings entities
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy WHERE polname = 'Users can read organization_settings' AND polrelid = 'public.organization_settings'::regclass
    ) THEN
        CREATE POLICY "Users can read organization_settings" ON public.organization_settings
        FOR SELECT USING (organization_id = public.current_organization_id());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage organization_settings' AND polrelid = 'public.organization_settings'::regclass
    ) THEN
        CREATE POLICY "Admins can manage organization_settings" ON public.organization_settings
        FOR ALL USING (
            organization_id = public.current_organization_id()
            AND (public.has_role('university_admin') OR public.has_role('super_admin'))
        );
    END IF;

    -- Admins can update their organization
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy WHERE polname = 'Admins can update their organization' AND polrelid = 'public.organizations'::regclass
    ) THEN
        CREATE POLICY "Admins can update their organization" ON public.organizations
        FOR UPDATE USING (
            id = public.current_organization_id()
            AND (public.has_role('university_admin') OR public.has_role('super_admin'))
        );
    END IF;

    -- Admins manage academic_years
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy WHERE polname = 'Admins manage academic_years' AND polrelid = 'public.academic_years'::regclass
    ) THEN
        CREATE POLICY "Admins manage academic_years" ON public.academic_years
        FOR ALL USING (
            (public.has_role('university_admin') AND organization_id = public.current_organization_id())
            OR public.has_role('super_admin')
        );
    END IF;

    -- Admins manage semesters
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy WHERE polname = 'Admins manage semesters' AND polrelid = 'public.semesters'::regclass
    ) THEN
        CREATE POLICY "Admins manage semesters" ON public.semesters
        FOR ALL USING (
            (public.has_role('university_admin') AND academic_year_id IN (
                SELECT id FROM public.academic_years WHERE organization_id = public.current_organization_id()
            ))
            OR public.has_role('super_admin')
        );
    END IF;
END $$;

-- 5. Ensure prevent_profile_escalation allows admins to manage other users' roles without self-escalation
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
