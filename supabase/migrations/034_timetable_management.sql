-- 034_timetable_management.sql

ALTER TABLE public.timetable_entries 
ADD COLUMN IF NOT EXISTS class_type TEXT DEFAULT 'Lecture',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- RLS policies for Admins

CREATE POLICY "Admins can view timetable_entries" ON public.timetable_entries
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.sections s
        JOIN public.subjects sub ON s.subject_id = sub.id
        JOIN public.courses c ON sub.course_id = c.id
        JOIN public.programs p ON c.program_id = p.id
        JOIN public.departments d ON p.department_id = d.id
        WHERE s.id = section_id
        AND d.organization_id = public.current_organization_id()
    )
    AND (public.has_role('university_admin') OR public.has_role('super_admin'))
);

CREATE POLICY "Admins can insert timetable_entries" ON public.timetable_entries
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.sections s
        JOIN public.subjects sub ON s.subject_id = sub.id
        JOIN public.courses c ON sub.course_id = c.id
        JOIN public.programs p ON c.program_id = p.id
        JOIN public.departments d ON p.department_id = d.id
        WHERE s.id = section_id
        AND d.organization_id = public.current_organization_id()
    )
    AND (public.has_role('university_admin') OR public.has_role('super_admin'))
);

CREATE POLICY "Admins can update timetable_entries" ON public.timetable_entries
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.sections s
        JOIN public.subjects sub ON s.subject_id = sub.id
        JOIN public.courses c ON sub.course_id = c.id
        JOIN public.programs p ON c.program_id = p.id
        JOIN public.departments d ON p.department_id = d.id
        WHERE s.id = section_id
        AND d.organization_id = public.current_organization_id()
    )
    AND (public.has_role('university_admin') OR public.has_role('super_admin'))
);

CREATE POLICY "Admins can delete timetable_entries" ON public.timetable_entries
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.sections s
        JOIN public.subjects sub ON s.subject_id = sub.id
        JOIN public.courses c ON sub.course_id = c.id
        JOIN public.programs p ON c.program_id = p.id
        JOIN public.departments d ON p.department_id = d.id
        WHERE s.id = section_id
        AND d.organization_id = public.current_organization_id()
    )
    AND (public.has_role('university_admin') OR public.has_role('super_admin'))
);
