-- 031_programs_management.sql

ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Undergraduate',
ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS duration_unit TEXT DEFAULT 'Years',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Admin policies for programs
CREATE POLICY "Admins can insert programs" ON public.programs
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.departments d
        WHERE d.id = department_id
        AND d.organization_id = public.current_organization_id()
    )
    AND (public.has_role('university_admin') OR public.has_role('super_admin'))
);

CREATE POLICY "Admins can update programs" ON public.programs
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.departments d
        WHERE d.id = department_id
        AND d.organization_id = public.current_organization_id()
    )
    AND (public.has_role('university_admin') OR public.has_role('super_admin'))
);

CREATE POLICY "Admins can delete programs" ON public.programs
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.departments d
        WHERE d.id = department_id
        AND d.organization_id = public.current_organization_id()
    )
    AND (public.has_role('university_admin') OR public.has_role('super_admin'))
);
