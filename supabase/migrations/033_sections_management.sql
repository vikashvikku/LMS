-- 033_sections_management.sql

ALTER TABLE public.sections
ADD COLUMN IF NOT EXISTS code TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Update unique constraint to allow section codes
-- We don't necessarily need a constraint on code, but if we do, it should be unique within an org.
-- For now, we just add the columns.

-- Add RLS policies for admins to insert/update/delete sections
CREATE POLICY "Admins can insert sections" ON public.sections
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.subjects s
        JOIN public.courses c ON s.course_id = c.id
        JOIN public.programs p ON c.program_id = p.id
        JOIN public.departments d ON p.department_id = d.id
        WHERE s.id = subject_id
        AND d.organization_id = public.current_organization_id()
    )
    AND (public.has_role('university_admin') OR public.has_role('super_admin'))
);

CREATE POLICY "Admins can update sections" ON public.sections
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.subjects s
        JOIN public.courses c ON s.course_id = c.id
        JOIN public.programs p ON c.program_id = p.id
        JOIN public.departments d ON p.department_id = d.id
        WHERE s.id = subject_id
        AND d.organization_id = public.current_organization_id()
    )
    AND (public.has_role('university_admin') OR public.has_role('super_admin'))
);

CREATE POLICY "Admins can delete sections" ON public.sections
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.subjects s
        JOIN public.courses c ON s.course_id = c.id
        JOIN public.programs p ON c.program_id = p.id
        JOIN public.departments d ON p.department_id = d.id
        WHERE s.id = subject_id
        AND d.organization_id = public.current_organization_id()
    )
    AND (public.has_role('university_admin') OR public.has_role('super_admin'))
);
