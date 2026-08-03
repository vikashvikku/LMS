-- 032_subjects_management.sql

ALTER TABLE public.subjects
ADD COLUMN IF NOT EXISTS semester INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Core',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Add RLS policies for admins to insert/update/delete subjects
CREATE POLICY "Admins can insert subjects" ON public.subjects
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.courses c
        JOIN public.programs p ON c.program_id = p.id
        JOIN public.departments d ON p.department_id = d.id
        WHERE c.id = course_id
        AND d.organization_id = public.current_organization_id()
    )
    AND (public.has_role('university_admin') OR public.has_role('super_admin'))
);

CREATE POLICY "Admins can update subjects" ON public.subjects
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.courses c
        JOIN public.programs p ON c.program_id = p.id
        JOIN public.departments d ON p.department_id = d.id
        WHERE c.id = course_id
        AND d.organization_id = public.current_organization_id()
    )
    AND (public.has_role('university_admin') OR public.has_role('super_admin'))
);

CREATE POLICY "Admins can delete subjects" ON public.subjects
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.courses c
        JOIN public.programs p ON c.program_id = p.id
        JOIN public.departments d ON p.department_id = d.id
        WHERE c.id = course_id
        AND d.organization_id = public.current_organization_id()
    )
    AND (public.has_role('university_admin') OR public.has_role('super_admin'))
);
