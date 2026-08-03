-- 039_audit_rls_and_triggers.sql

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for audit_logs
-- Admins can READ audit logs for their organization
CREATE POLICY "Admins can read audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (
    organization_id = (
        SELECT organization_id FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('super_admin', 'university_admin')
    )
);

-- NO INSERT, UPDATE, or DELETE policies are created. 
-- The table is read-only to clients.
-- Triggers will write to it using SECURITY DEFINER functions.

-- Create the robust generic audit trigger function
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    v_actor_id UUID;
    v_org_id UUID;
    v_entity_type TEXT;
    v_entity_id UUID;
    v_action TEXT;
    v_metadata JSONB;
    v_row JSONB;
BEGIN
    -- Get actor from auth context
    v_actor_id := auth.uid();
    v_action := TG_OP;
    v_entity_type := TG_TABLE_NAME;

    -- Capture the appropriate row state
    IF TG_OP = 'DELETE' THEN
        v_entity_id := OLD.id;
        v_row := to_jsonb(OLD);
    ELSE
        v_entity_id := NEW.id;
        v_row := to_jsonb(NEW);
    END IF;

    -- Clean up sensitive data in metadata if they ever happen to exist
    v_metadata := v_row - 'password' - 'access_token' - 'refresh_token' - 'secret' - 'key';

    -- Dynamically resolve organization_id across the CampusOS hierarchy
    IF v_row ? 'organization_id' THEN
        v_org_id := (v_row->>'organization_id')::UUID;
    ELSIF v_entity_type = 'programs' THEN
        SELECT organization_id INTO v_org_id FROM public.departments WHERE id = (v_row->>'department_id')::UUID;
    ELSIF v_entity_type = 'courses' THEN
        SELECT d.organization_id INTO v_org_id 
        FROM public.programs p 
        JOIN public.departments d ON p.department_id = d.id 
        WHERE p.id = (v_row->>'program_id')::UUID;
    ELSIF v_entity_type = 'subjects' THEN
        SELECT d.organization_id INTO v_org_id 
        FROM public.courses c
        JOIN public.programs p ON c.program_id = p.id 
        JOIN public.departments d ON p.department_id = d.id 
        WHERE c.id = (v_row->>'course_id')::UUID;
    ELSIF v_entity_type = 'sections' THEN
        SELECT d.organization_id INTO v_org_id 
        FROM public.subjects s
        JOIN public.courses c ON s.course_id = c.id
        JOIN public.programs p ON c.program_id = p.id 
        JOIN public.departments d ON p.department_id = d.id 
        WHERE s.id = (v_row->>'subject_id')::UUID;
    END IF;

    -- Fallback to actor's organization if entity is detached but actor is known
    IF v_org_id IS NULL AND v_actor_id IS NOT NULL THEN
        SELECT organization_id INTO v_org_id FROM public.profiles WHERE id = v_actor_id;
    END IF;

    -- Only log if we can safely attribute it to an organization
    IF v_org_id IS NOT NULL THEN
        INSERT INTO public.audit_logs (organization_id, actor_id, action, entity_type, entity_id, metadata)
        VALUES (v_org_id, v_actor_id, v_action, v_entity_type, v_entity_id, v_metadata);
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach triggers to important admin-facing entities

-- Profiles (Students, Faculty, Admins)
DROP TRIGGER IF EXISTS audit_profiles ON public.profiles;
CREATE TRIGGER audit_profiles
AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Student Enrollments
DROP TRIGGER IF EXISTS audit_student_enrollments ON public.student_enrollments;
CREATE TRIGGER audit_student_enrollments
AFTER INSERT OR UPDATE OR DELETE ON public.student_enrollments
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Faculty Assignments
DROP TRIGGER IF EXISTS audit_faculty_assignments ON public.faculty_assignments;
CREATE TRIGGER audit_faculty_assignments
AFTER INSERT OR UPDATE OR DELETE ON public.faculty_assignments
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Programs
DROP TRIGGER IF EXISTS audit_programs ON public.programs;
CREATE TRIGGER audit_programs
AFTER INSERT OR UPDATE OR DELETE ON public.programs
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Courses
DROP TRIGGER IF EXISTS audit_courses ON public.courses;
CREATE TRIGGER audit_courses
AFTER INSERT OR UPDATE OR DELETE ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Subjects
DROP TRIGGER IF EXISTS audit_subjects ON public.subjects;
CREATE TRIGGER audit_subjects
AFTER INSERT OR UPDATE OR DELETE ON public.subjects
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Sections
DROP TRIGGER IF EXISTS audit_sections ON public.sections;
CREATE TRIGGER audit_sections
AFTER INSERT OR UPDATE OR DELETE ON public.sections
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Timetable
DROP TRIGGER IF EXISTS audit_timetable_entries ON public.timetable_entries;
CREATE TRIGGER audit_timetable_entries
AFTER INSERT OR UPDATE OR DELETE ON public.timetable_entries
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Fees (Structures and Payments)
DROP TRIGGER IF EXISTS audit_fee_structures ON public.fee_structures;
CREATE TRIGGER audit_fee_structures
AFTER INSERT OR UPDATE OR DELETE ON public.fee_structures
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS audit_payments ON public.payments;
CREATE TRIGGER audit_payments
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Announcements
DROP TRIGGER IF EXISTS audit_announcements ON public.announcements;
CREATE TRIGGER audit_announcements
AFTER INSERT OR UPDATE OR DELETE ON public.announcements
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Force Schema Cache reload
NOTIFY pgrst, 'reload schema';
