-- 023_missing_academic_rls.sql
-- Fix the silent query failures caused by missing RLS SELECT policies on academic and relationship tables

-- 1. Academic Structure Read Policies (Organization-wide visibility)
CREATE POLICY "Users can read academic_years" ON public.academic_years FOR SELECT USING (organization_id = public.current_organization_id());

CREATE POLICY "Users can read semesters" ON public.semesters FOR SELECT USING (
    academic_year_id IN (SELECT id FROM public.academic_years WHERE organization_id = public.current_organization_id())
);

CREATE POLICY "Users can read programs" ON public.programs FOR SELECT USING (
    department_id IN (SELECT id FROM public.departments WHERE organization_id = public.current_organization_id())
);

CREATE POLICY "Users can read courses" ON public.courses FOR SELECT USING (
    program_id IN (SELECT id FROM public.programs WHERE department_id IN (SELECT id FROM public.departments WHERE organization_id = public.current_organization_id()))
);

CREATE POLICY "Users can read subjects" ON public.subjects FOR SELECT USING (
    course_id IN (SELECT id FROM public.courses WHERE program_id IN (SELECT id FROM public.programs WHERE department_id IN (SELECT id FROM public.departments WHERE organization_id = public.current_organization_id())))
);

CREATE POLICY "Users can read rooms" ON public.rooms FOR SELECT USING (organization_id = public.current_organization_id());

-- 2. Enrollments and Assignments
CREATE POLICY "Students and faculty can read enrollments" ON public.student_enrollments FOR SELECT USING (
    student_id = auth.uid() OR public.is_faculty_for_section(section_id)
);

CREATE POLICY "Users can read faculty assignments" ON public.faculty_assignments FOR SELECT USING (
    faculty_id = auth.uid() OR public.is_student_enrolled(section_id)
);

-- 3. Timetable
CREATE POLICY "Users can read timetable_entries" ON public.timetable_entries FOR SELECT USING (
    public.is_student_enrolled(section_id) OR public.is_faculty_for_section(section_id) OR faculty_id = auth.uid()
);

-- 4. Communications
CREATE POLICY "Users can read announcements" ON public.announcements FOR SELECT USING (organization_id = public.current_organization_id());
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT USING (recipient_id = auth.uid());
