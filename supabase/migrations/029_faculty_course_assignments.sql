-- 029_faculty_course_assignments.sql

-- First, drop the dependent policies so we can safely drop the column without CASCADE deleting the tables or anything crazy
DROP POLICY IF EXISTS "Faculty can view submissions for their sections" ON public.submissions;
DROP POLICY IF EXISTS "Faculty can grade submissions" ON public.grades;
DROP POLICY IF EXISTS "Faculty can manage attendance records for their sections" ON public.attendance_records;
DROP POLICY IF EXISTS "Users can read faculty assignments" ON public.faculty_assignments;

-- Add course_id
ALTER TABLE public.faculty_assignments ADD COLUMN course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;

-- Preserve data if any exists
UPDATE public.faculty_assignments fa
SET course_id = (
    SELECT sub.course_id 
    FROM public.sections sec 
    JOIN public.subjects sub ON sub.id = sec.subject_id 
    WHERE sec.id = fa.section_id
);

-- Drop section_id constraint and column
ALTER TABLE public.faculty_assignments DROP CONSTRAINT IF EXISTS faculty_assignments_section_id_fkey;
ALTER TABLE public.faculty_assignments DROP COLUMN section_id;

-- Make course_id NOT NULL
ALTER TABLE public.faculty_assignments ALTER COLUMN course_id SET NOT NULL;

-- Remove duplicates before applying unique constraint
DELETE FROM public.faculty_assignments a
USING public.faculty_assignments b
WHERE a.id < b.id 
  AND a.faculty_id = b.faculty_id 
  AND a.course_id = b.course_id;

-- Prevent duplicate assignments
ALTER TABLE public.faculty_assignments ADD CONSTRAINT faculty_assignments_faculty_course_key UNIQUE (faculty_id, course_id);

-- Recreate `is_faculty_for_section` to check course_id
CREATE OR REPLACE FUNCTION public.is_faculty_for_section(target_section_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.faculty_assignments fa
        JOIN public.courses c ON c.id = fa.course_id
        JOIN public.subjects sub ON sub.course_id = c.id
        JOIN public.sections sec ON sec.subject_id = sub.id
        WHERE fa.faculty_id = auth.uid() AND sec.id = target_section_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate policies using the updated schema/function

CREATE POLICY "Users can read faculty assignments" ON public.faculty_assignments FOR SELECT USING (
    faculty_id = auth.uid() 
    OR EXISTS (
        SELECT 1 FROM public.student_enrollments se
        JOIN public.sections sec ON sec.id = se.section_id
        JOIN public.subjects sub ON sub.id = sec.subject_id
        WHERE se.student_id = auth.uid() AND sub.course_id = faculty_assignments.course_id AND se.status = 'active'
    )
    OR public.has_role('university_admin') 
    OR public.has_role('super_admin')
);

CREATE POLICY "Faculty can view submissions for their sections" ON public.submissions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.assignments a
        WHERE a.id = submissions.assignment_id AND public.is_faculty_for_section(a.section_id)
    )
);

CREATE POLICY "Faculty can grade submissions" ON public.grades FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.submissions sub
        JOIN public.assignments a ON a.id = sub.assignment_id
        WHERE sub.id = grades.submission_id AND public.is_faculty_for_section(a.section_id)
    )
);

CREATE POLICY "Faculty can manage attendance records for their sections" ON public.attendance_records FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.attendance_sessions assn
        WHERE assn.id = attendance_records.session_id AND public.is_faculty_for_section(assn.section_id)
    )
);
