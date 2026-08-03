-- 028_faculty_profiles.sql

CREATE TABLE public.faculty_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    employee_id TEXT,
    designation TEXT,
    specialization TEXT,
    phone TEXT,
    joining_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX idx_faculty_profiles_department ON public.faculty_profiles(department_id);
CREATE INDEX idx_faculty_profiles_employee_id ON public.faculty_profiles(employee_id);

-- RLS
ALTER TABLE public.faculty_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read faculty profiles in their org" ON public.faculty_profiles
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = faculty_profiles.id
        AND p.organization_id = public.current_organization_id()
    )
);

CREATE POLICY "Admins can manage faculty profiles" ON public.faculty_profiles
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = faculty_profiles.id
        AND p.organization_id = public.current_organization_id()
    )
    AND (public.has_role('university_admin') OR public.has_role('super_admin'))
);

-- Also add admin policies for faculty_assignments (they might only have read policies currently)
CREATE POLICY "Admins can insert faculty_assignments" ON public.faculty_assignments
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = faculty_assignments.faculty_id
        AND p.organization_id = public.current_organization_id()
    )
    AND (public.has_role('university_admin') OR public.has_role('super_admin'))
);

CREATE POLICY "Admins can update faculty_assignments" ON public.faculty_assignments
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = faculty_assignments.faculty_id
        AND p.organization_id = public.current_organization_id()
    )
    AND (public.has_role('university_admin') OR public.has_role('super_admin'))
);

CREATE POLICY "Admins can delete faculty_assignments" ON public.faculty_assignments
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = faculty_assignments.faculty_id
        AND p.organization_id = public.current_organization_id()
    )
    AND (public.has_role('university_admin') OR public.has_role('super_admin'))
);
