-- 021_attendance_rls.sql

-- Policies for attendance_sessions
CREATE POLICY "Faculty can manage attendance sessions for their sections" ON public.attendance_sessions FOR ALL USING (public.is_faculty_for_section(section_id));
CREATE POLICY "Students can view attendance sessions for their enrolled sections" ON public.attendance_sessions FOR SELECT USING (public.is_student_enrolled(section_id));

-- Policies for attendance_records
CREATE POLICY "Faculty can manage attendance records for their sections" ON public.attendance_records FOR ALL USING (
    session_id IN (SELECT id FROM public.attendance_sessions WHERE section_id IN (SELECT section_id FROM public.faculty_assignments WHERE faculty_id = auth.uid()))
);
CREATE POLICY "Students can view their own attendance records" ON public.attendance_records FOR SELECT USING (
    student_id = auth.uid()
);
