-- Migration 041: Restore faculty_assignments section relationship and add section denormalized foreign keys for PostgREST schema cache

-- 1. Ensure faculty_assignments has section_id referencing sections(id)
ALTER TABLE public.faculty_assignments 
  ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE;

-- 2. Ensure sections has course_id and program_id referencing courses(id) and programs(id)
ALTER TABLE public.sections 
  ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;

ALTER TABLE public.sections 
  ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE;

-- 3. Populate course_id and program_id on sections
UPDATE public.sections sec
SET 
  course_id = sub.course_id,
  program_id = c.program_id
FROM public.subjects sub
JOIN public.courses c ON c.id = sub.course_id
WHERE sec.subject_id = sub.id 
  AND (sec.course_id IS NULL OR sec.program_id IS NULL);

-- 4. Populate section_id on faculty_assignments from subject_id
UPDATE public.faculty_assignments fa
SET section_id = sec.id
FROM public.sections sec
WHERE sec.subject_id = fa.subject_id AND fa.section_id IS NULL;

-- 5. Trigger function to auto-sync subject_id and section_id on faculty_assignments
CREATE OR REPLACE FUNCTION public.sync_faculty_assignment_fields()
RETURNS trigger AS $$
BEGIN
  IF NEW.section_id IS NOT NULL AND NEW.subject_id IS NULL THEN
    SELECT subject_id INTO NEW.subject_id FROM public.sections WHERE id = NEW.section_id;
  ELSIF NEW.subject_id IS NOT NULL AND NEW.section_id IS NULL THEN
    SELECT id INTO NEW.section_id FROM public.sections WHERE subject_id = NEW.subject_id LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_faculty_assignment_fields ON public.faculty_assignments;
CREATE TRIGGER trg_sync_faculty_assignment_fields
BEFORE INSERT OR UPDATE ON public.faculty_assignments
FOR EACH ROW EXECUTE FUNCTION public.sync_faculty_assignment_fields();

-- 6. Update is_faculty_for_section function to support both section_id and subject_id links
CREATE OR REPLACE FUNCTION public.is_faculty_for_section(target_section_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.faculty_assignments fa
        LEFT JOIN public.sections sec ON sec.subject_id = fa.subject_id
        WHERE fa.faculty_id = auth.uid() 
          AND (fa.section_id = target_section_id OR sec.id = target_section_id)
    );
END;
$$;

-- 7. Update RLS policy for reading faculty assignments
DROP POLICY IF EXISTS "Users can read faculty assignments" ON public.faculty_assignments;
CREATE POLICY "Users can read faculty assignments" ON public.faculty_assignments
  FOR SELECT
  USING (
    faculty_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.student_enrollments se
      JOIN public.sections sec ON sec.id = se.section_id
      WHERE se.student_id = auth.uid()
        AND (sec.subject_id = faculty_assignments.subject_id OR sec.id = faculty_assignments.section_id)
        AND se.status = 'active'
    )
    OR has_role('university_admin'::user_role)
    OR has_role('super_admin'::user_role)
  );
