-- 017_storage.sql
-- Create storage buckets

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('assignment-files', 'assignment-files', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('submission-files', 'submission-files', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('course-materials', 'course-materials', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('exam-documents', 'exam-documents', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('student-documents', 'student-documents', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('library-assets', 'library-assets', false) ON CONFLICT DO NOTHING;

-- 1. Avatars
CREATE POLICY "Authenticated users can read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can manage their own avatar" ON storage.objects FOR ALL USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 2. Submission Files
CREATE POLICY "Students can upload submission files" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'submission-files' AND EXISTS (SELECT 1 FROM public.submissions s WHERE s.id::text = (storage.foldername(name))[1] AND s.student_id = auth.uid())
);
CREATE POLICY "Students can read own submission files" ON storage.objects FOR SELECT USING (
    bucket_id = 'submission-files' AND EXISTS (SELECT 1 FROM public.submissions s WHERE s.id::text = (storage.foldername(name))[1] AND s.student_id = auth.uid())
);
CREATE POLICY "Faculty can read section submissions" ON storage.objects FOR SELECT USING (
    bucket_id = 'submission-files' AND EXISTS (SELECT 1 FROM public.submissions s JOIN public.assignments a ON s.assignment_id = a.id WHERE s.id::text = (storage.foldername(name))[1] AND public.is_faculty_for_section(a.section_id))
);

-- 3. Assignment Files
CREATE POLICY "Faculty can manage assignment files" ON storage.objects FOR ALL USING (
    bucket_id = 'assignment-files' AND EXISTS (SELECT 1 FROM public.assignments a WHERE a.id::text = (storage.foldername(name))[1] AND public.is_faculty_for_section(a.section_id))
);
CREATE POLICY "Enrolled students can read assignment files" ON storage.objects FOR SELECT USING (
    bucket_id = 'assignment-files' AND EXISTS (SELECT 1 FROM public.assignments a WHERE a.id::text = (storage.foldername(name))[1] AND public.is_student_enrolled(a.section_id))
);

-- 4. Course Materials
CREATE POLICY "Faculty can manage course materials" ON storage.objects FOR ALL USING (
    bucket_id = 'course-materials' AND EXISTS (SELECT 1 FROM public.course_materials m JOIN public.sections s ON m.section_id = s.id WHERE m.id::text = (storage.foldername(name))[1] AND public.is_faculty_for_section(m.section_id))
);
CREATE POLICY "Enrolled students can read course materials" ON storage.objects FOR SELECT USING (
    bucket_id = 'course-materials' AND EXISTS (SELECT 1 FROM public.course_materials m JOIN public.sections s ON m.section_id = s.id WHERE m.id::text = (storage.foldername(name))[1] AND public.is_student_enrolled(m.section_id))
);

-- 5. Exam Documents
CREATE POLICY "Faculty can manage exam documents" ON storage.objects FOR ALL USING (
    bucket_id = 'exam-documents' AND EXISTS (SELECT 1 FROM public.exams e WHERE e.id::text = (storage.foldername(name))[1] AND public.is_faculty_for_section(e.section_id))
);
-- Students cannot read exam documents generally via storage unless through an active exam session API. Default DENY.

-- 6. Student Documents (e.g., transcripts, ID cards)
CREATE POLICY "Students can read own documents" ON storage.objects FOR SELECT USING (
    bucket_id = 'student-documents' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "University Admins can manage student documents" ON storage.objects FOR ALL USING (
    bucket_id = 'student-documents' AND public.has_role('university_admin')
);

-- 7. Library Assets
CREATE POLICY "Librarians can manage library assets" ON storage.objects FOR ALL USING (
    bucket_id = 'library-assets' AND public.has_role('librarian')
);
CREATE POLICY "Authenticated users can read library assets" ON storage.objects FOR SELECT USING (
    bucket_id = 'library-assets' AND auth.role() = 'authenticated'
);
