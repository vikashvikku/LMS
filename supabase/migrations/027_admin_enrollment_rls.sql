-- 027_admin_enrollment_rls.sql
-- Add explicit SELECT, INSERT, and UPDATE policies for admins on student_enrollments

-- 1. Admin Read Enrollments
CREATE POLICY "Admins can read student_enrollments" ON public.student_enrollments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = student_enrollments.student_id
        AND organization_id = public.current_organization_id()
    )
    AND (public.has_role('university_admin') OR public.has_role('super_admin'))
);

-- 2. Admin Insert Enrollments
CREATE POLICY "Admins can insert student_enrollments" ON public.student_enrollments FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = student_enrollments.student_id
        AND organization_id = public.current_organization_id()
    )
    AND (public.has_role('university_admin') OR public.has_role('super_admin'))
);

-- 3. Admin Update Enrollments
CREATE POLICY "Admins can update student_enrollments" ON public.student_enrollments FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = student_enrollments.student_id
        AND organization_id = public.current_organization_id()
    )
    AND (public.has_role('university_admin') OR public.has_role('super_admin'))
);
