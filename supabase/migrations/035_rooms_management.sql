-- 035_rooms_management.sql

ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS room_type TEXT,
ADD COLUMN IF NOT EXISTS building TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Add RLS for Admins on rooms if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage rooms' AND polrelid = 'public.rooms'::regclass
    ) THEN
        CREATE POLICY "Admins can manage rooms" ON public.rooms
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
END $$;
