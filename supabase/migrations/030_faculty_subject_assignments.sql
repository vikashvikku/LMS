-- 030_faculty_subject_assignments.sql

-- Drop dependent policies first
DROP POLICY IF EXISTS "Faculty can view submissions for their sections" ON public.submissions;
DROP POLICY IF EXISTS "Faculty can grade submissions" ON public.grades;
DROP POLICY IF EXISTS "Faculty can manage attendance records for their sections" ON public.attendance_records;
DROP POLICY IF EXISTS "Users can read faculty assignments" ON public.faculty_assignments;

-- Add subject_id
ALTER TABLE public.faculty_assignments ADD COLUMN subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE;

-- We don't have valid subject_ids for existing data (which was mapped to course_id / cohort level),
-- and since this is dev and course_id is currently assigning to an entire year's cohort,
-- we'll just truncate the faculty_assignments table or leave subject_id NULL temporarily, then delete.
-- Better to just delete existing assignments because they are conceptually wrong (tied to a cohort, not a subject).
DELETE FROM public.faculty_assignments;

ALTER TABLE public.faculty_assignments DROP CONSTRAINT IF EXISTS faculty_assignments_faculty_course_key;
ALTER TABLE public.faculty_assignments DROP COLUMN course_id;

ALTER TABLE public.faculty_assignments ALTER COLUMN subject_id SET NOT NULL;
ALTER TABLE public.faculty_assignments ADD CONSTRAINT faculty_assignments_faculty_subject_key UNIQUE (faculty_id, subject_id);

-- Update the `is_faculty_for_section` function
CREATE OR REPLACE FUNCTION public.is_faculty_for_section(target_section_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.faculty_assignments fa
        JOIN public.sections sec ON sec.subject_id = fa.subject_id
        WHERE fa.faculty_id = auth.uid() AND sec.id = target_section_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate policies
CREATE POLICY "Users can read faculty assignments" ON public.faculty_assignments FOR SELECT USING (
    faculty_id = auth.uid() 
    OR EXISTS (
        SELECT 1 FROM public.student_enrollments se
        JOIN public.sections sec ON sec.id = se.section_id
        WHERE se.student_id = auth.uid() AND sec.subject_id = faculty_assignments.subject_id AND se.status = 'active'
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
