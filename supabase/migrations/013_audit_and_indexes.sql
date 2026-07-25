-- 013_audit_and_indexes.sql
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 014: Indexes for Performance and Foreign Keys
CREATE INDEX idx_profiles_org_id ON public.profiles(organization_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);

CREATE INDEX idx_enrollments_student ON public.student_enrollments(student_id);
CREATE INDEX idx_enrollments_section ON public.student_enrollments(section_id);

CREATE INDEX idx_assignments_section ON public.assignments(section_id);
CREATE INDEX idx_submissions_student ON public.submissions(student_id);
CREATE INDEX idx_submissions_assignment ON public.submissions(assignment_id);

CREATE INDEX idx_attendance_session ON public.attendance_records(session_id);
CREATE INDEX idx_attendance_student ON public.attendance_records(student_id);

CREATE INDEX idx_fee_student ON public.student_fees(student_id);
CREATE INDEX idx_payments_fee ON public.payments(student_fee_id);

CREATE INDEX idx_timetable_section ON public.timetable_entries(section_id);
CREATE INDEX idx_timetable_faculty ON public.timetable_entries(faculty_id);
CREATE INDEX idx_timetable_room ON public.timetable_entries(room_id);

CREATE INDEX idx_audit_logs_org ON public.audit_logs(organization_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- GIN indexes for metadata
CREATE INDEX idx_ai_documents_metadata ON public.ai_documents USING GIN (metadata);
CREATE INDEX idx_audit_logs_metadata ON public.audit_logs USING GIN (metadata);

-- Vector index using HNSW for fast similarity search
CREATE INDEX idx_ai_chunks_embedding ON public.ai_document_chunks USING hnsw (embedding vector_cosine_ops);
