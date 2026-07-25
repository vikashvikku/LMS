-- 016_rls_policies.sql
-- Enable RLS on all tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    END LOOP;
END $$;

-- 1. Profiles
CREATE POLICY "Users can read profiles in their organization" ON public.profiles FOR SELECT USING (organization_id = public.current_organization_id());
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Super admins can manage all profiles" ON public.profiles FOR ALL USING (public.has_role('super_admin'));
CREATE POLICY "University admins can manage profiles in their org" ON public.profiles FOR ALL USING (public.has_role('university_admin') AND organization_id = public.current_organization_id());

-- 2. Organizations
CREATE POLICY "Users can read their own organization" ON public.organizations FOR SELECT USING (id = public.current_organization_id());
CREATE POLICY "Super admins manage organizations" ON public.organizations FOR ALL USING (public.has_role('super_admin'));

-- 3. Academic Structure (Semesters, Departments, Programs, Courses, Subjects, Rooms, Sections)
CREATE POLICY "Users can read academic structure in their org" ON public.departments FOR SELECT USING (organization_id = public.current_organization_id());
CREATE POLICY "Admins manage academic structure" ON public.departments FOR ALL USING ((public.has_role('university_admin') AND organization_id = public.current_organization_id()) OR public.has_role('super_admin'));

-- Note: In a real deployment, we mirror the read policy for programs, courses, subjects, sections etc. 
-- For brevity, here is sections:
CREATE POLICY "Users can read sections" ON public.sections FOR SELECT USING (
    subject_id IN (SELECT id FROM public.subjects WHERE course_id IN (SELECT id FROM public.courses WHERE program_id IN (SELECT id FROM public.programs WHERE department_id IN (SELECT id FROM public.departments WHERE organization_id = public.current_organization_id()))))
);

-- 4. LMS (Assignments, Submissions, Grades)
CREATE POLICY "Faculty can manage assignments for their sections" ON public.assignments FOR ALL USING (public.is_faculty_for_section(section_id));
CREATE POLICY "Students can view published assignments for their sections" ON public.assignments FOR SELECT USING (public.is_student_enrolled(section_id) AND is_published = true);

CREATE POLICY "Students can manage their own submissions" ON public.submissions FOR ALL USING (student_id = auth.uid());
CREATE POLICY "Faculty can view submissions for their sections" ON public.submissions FOR SELECT USING (assignment_id IN (SELECT id FROM public.assignments WHERE section_id IN (SELECT section_id FROM public.faculty_assignments WHERE faculty_id = auth.uid())));

CREATE POLICY "Faculty can grade submissions" ON public.grades FOR ALL USING (
    submission_id IN (SELECT id FROM public.submissions WHERE assignment_id IN (SELECT id FROM public.assignments WHERE section_id IN (SELECT section_id FROM public.faculty_assignments WHERE faculty_id = auth.uid())))
);
CREATE POLICY "Students can view released grades" ON public.grades FOR SELECT USING (
    is_released = true AND submission_id IN (SELECT id FROM public.submissions WHERE student_id = auth.uid())
);

-- 5. Finance
CREATE POLICY "Finance can manage fees" ON public.student_fees FOR ALL USING (
    public.has_role('finance') AND student_id IN (SELECT id FROM public.profiles WHERE organization_id = public.current_organization_id())
);
CREATE POLICY "Students can view their own fees" ON public.student_fees FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Parents can view linked student fees" ON public.student_fees FOR SELECT USING (public.is_parent_of_student(student_id));
