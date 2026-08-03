-- 036_fees_management.sql

-- 1. Enhance fee_structures
ALTER TABLE public.fee_structures
ADD COLUMN IF NOT EXISTS semester_id UUID REFERENCES public.semesters(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS components JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS due_date DATE;

-- 2. Enhance student_fees
ALTER TABLE public.student_fees
ADD COLUMN IF NOT EXISTS semester_id UUID REFERENCES public.semesters(id) ON DELETE RESTRICT;

-- 3. Enhance payments
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Enable RLS
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage fee_structures' AND polrelid = 'public.fee_structures'::regclass
    ) THEN
        CREATE POLICY "Admins can manage fee_structures" ON public.fee_structures
        FOR ALL
        USING (
            organization_id = public.current_organization_id()
            AND (public.has_role('university_admin') OR public.has_role('super_admin'))
        )
        WITH CHECK (
            organization_id = public.current_organization_id()
            AND (public.has_role('university_admin') OR public.has_role('super_admin'))
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage student_fees' AND polrelid = 'public.student_fees'::regclass
    ) THEN
        CREATE POLICY "Admins can manage student_fees" ON public.student_fees
        FOR ALL
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = student_id
                AND profiles.organization_id = public.current_organization_id()
            )
            AND (public.has_role('university_admin') OR public.has_role('super_admin'))
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage payments' AND polrelid = 'public.payments'::regclass
    ) THEN
        CREATE POLICY "Admins can manage payments" ON public.payments
        FOR ALL
        USING (
            EXISTS (
                SELECT 1 FROM public.student_fees sf
                JOIN public.profiles p ON sf.student_id = p.id
                WHERE sf.id = student_fee_id
                AND p.organization_id = public.current_organization_id()
            )
            AND (public.has_role('university_admin') OR public.has_role('super_admin'))
        );
    END IF;
END $$;
