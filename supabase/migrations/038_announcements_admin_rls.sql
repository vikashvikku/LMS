-- 038_announcements_admin_rls.sql
-- Allow university admins and super admins to manage announcements
-- only inside their current organization.

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can create announcements"
ON public.announcements;

CREATE POLICY "Admins can create announcements"
ON public.announcements
FOR INSERT
TO authenticated
WITH CHECK (
    organization_id = public.current_organization_id()
    AND (
        public.has_role('university_admin')
        OR public.has_role('super_admin')
    )
);

DROP POLICY IF EXISTS "Admins can update announcements"
ON public.announcements;

CREATE POLICY "Admins can update announcements"
ON public.announcements
FOR UPDATE
TO authenticated
USING (
    organization_id = public.current_organization_id()
    AND (
        public.has_role('university_admin')
        OR public.has_role('super_admin')
    )
)
WITH CHECK (
    organization_id = public.current_organization_id()
    AND (
        public.has_role('university_admin')
        OR public.has_role('super_admin')
    )
);

DROP POLICY IF EXISTS "Admins can delete announcements"
ON public.announcements;

CREATE POLICY "Admins can delete announcements"
ON public.announcements
FOR DELETE
TO authenticated
USING (
    organization_id = public.current_organization_id()
    AND (
        public.has_role('university_admin')
        OR public.has_role('super_admin')
    )
);
