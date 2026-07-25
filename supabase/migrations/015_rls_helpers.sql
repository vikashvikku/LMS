-- 015_rls_helpers.sql

CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = ''
AS $$
    SELECT id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_organization_id()
RETURNS UUID
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = ''
AS $$
    SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.has_role(required_role public.user_role)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = required_role
    );
$$;

CREATE OR REPLACE FUNCTION public.is_faculty_for_section(target_section_id UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.faculty_assignments 
        WHERE faculty_id = auth.uid() AND section_id = target_section_id
    );
$$;

CREATE OR REPLACE FUNCTION public.is_student_enrolled(target_section_id UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.student_enrollments 
        WHERE student_id = auth.uid() AND section_id = target_section_id AND status = 'active'
    );
$$;

CREATE OR REPLACE FUNCTION public.is_parent_of_student(target_student_id UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.parent_student_links 
        WHERE parent_id = auth.uid() AND student_id = target_student_id AND status = 'approved'
    );
$$;
