-- ==============================================================================
-- CAMPUS OS - ACADEMIC TEST DATA SEED SCRIPT (IDEMPOTENT & DYNAMIC)
-- ==============================================================================
-- Run locally:  npx supabase db query --local --file supabase/seed_test_academic_data.sql
-- Run remotely: npx supabase db query --linked --file supabase/seed_test_academic_data.sql
-- ==============================================================================

DO $$
DECLARE
    -- ========================================================================
    -- CONFIGURATION:
    -- Update these emails to match your test users in Supabase Auth.
    -- ========================================================================
    v_student_email TEXT := 'vikkuvikash79097@gmail.com';
    v_faculty_email TEXT := 'mohit@gmail.com';

    -- ========================================================================
    -- INTERNAL VARIABLES
    -- ========================================================================
    v_student_id UUID;
    v_faculty_id UUID;
    v_org_id UUID;
    
    v_acad_year_id UUID;
    v_semester_id UUID;
    v_dept_id UUID;
    v_prog_id UUID;
    v_course_id UUID;
    v_sub_dbms_id UUID;
    v_sub_cn_id UUID;
    v_sub_os_id UUID;
    v_sub_web_id UUID;
    v_sec_dbms_id UUID;
    v_sec_cn_id UUID;
    v_sec_os_id UUID;
    v_sec_web_id UUID;
    v_room_id UUID;
    v_att_sess_1 UUID;
    v_att_sess_2 UUID;
    v_att_sess_3 UUID;
    v_assign_dbms UUID;
    v_assign_cn UUID;
    v_assign_web UUID;
    v_submission_cn UUID;

BEGIN
    ---------------------------------------------------------------------------
    -- 1. PROFILE DISCOVERY & VALIDATION
    ---------------------------------------------------------------------------
    
    -- Find Student Profile
    SELECT u.id, p.organization_id 
    INTO v_student_id, v_org_id
    FROM auth.users u
    JOIN public.profiles p ON u.id = p.id
    WHERE u.email = v_student_email;

    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Student not found for email: %', v_student_email;
    END IF;

    -- Validate Student Role
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_student_id AND role = 'student') THEN
        RAISE EXCEPTION 'The profile for % exists but does not have the "student" role.', v_student_email;
    END IF;

    -- Find Faculty Profile
    SELECT u.id 
    INTO v_faculty_id
    FROM auth.users u
    JOIN public.profiles p ON u.id = p.id
    WHERE u.email = v_faculty_email;

    IF v_faculty_id IS NULL THEN
        RAISE EXCEPTION 'Faculty not found for email: %', v_faculty_email;
    END IF;

    -- Validate Faculty Role & Organization Match
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = v_faculty_id 
        AND role = 'faculty' 
        AND organization_id = v_org_id
    ) THEN
        RAISE EXCEPTION 'The profile for % exists but is either not "faculty" or is in a different organization than the student.', v_faculty_email;
    END IF;

    RAISE NOTICE 'Profiles discovered successfully! Org: %, Student: %, Faculty: %', v_org_id, v_student_id, v_faculty_id;

    ---------------------------------------------------------------------------
    -- 2. ACADEMIC STRUCTURE (IDEMPOTENT)
    ---------------------------------------------------------------------------
    
    -- Academic Year
    SELECT id INTO v_acad_year_id FROM public.academic_years WHERE organization_id = v_org_id AND name = '2026-2027';
    IF v_acad_year_id IS NULL THEN
        INSERT INTO public.academic_years (organization_id, name, start_date, end_date, is_active)
        VALUES (v_org_id, '2026-2027', '2026-08-01', '2027-05-31', true)
        RETURNING id INTO v_acad_year_id;
    END IF;

    -- Semester
    SELECT id INTO v_semester_id FROM public.semesters WHERE academic_year_id = v_acad_year_id AND name = 'Semester 1';
    IF v_semester_id IS NULL THEN
        INSERT INTO public.semesters (academic_year_id, name, start_date, end_date)
        VALUES (v_acad_year_id, 'Semester 1', '2026-08-01', '2026-12-15')
        RETURNING id INTO v_semester_id;
    END IF;

    -- Department
    SELECT id INTO v_dept_id FROM public.departments WHERE organization_id = v_org_id AND code = 'CS';
    IF v_dept_id IS NULL THEN
        INSERT INTO public.departments (organization_id, name, code)
        VALUES (v_org_id, 'Computer Science', 'CS')
        RETURNING id INTO v_dept_id;
    END IF;

    -- Program
    SELECT id INTO v_prog_id FROM public.programs WHERE department_id = v_dept_id AND code = 'BTECH-CSE';
    IF v_prog_id IS NULL THEN
        INSERT INTO public.programs (department_id, name, code)
        VALUES (v_dept_id, 'B.Tech Computer Science and Engineering', 'BTECH-CSE')
        RETURNING id INTO v_prog_id;
    END IF;

    -- Course
    SELECT id INTO v_course_id FROM public.courses WHERE program_id = v_prog_id AND code = 'BTECH-CSE-1';
    IF v_course_id IS NULL THEN
        INSERT INTO public.courses (program_id, title, code, credits)
        VALUES (v_prog_id, 'B.Tech CSE - First Year', 'BTECH-CSE-1', 120)
        RETURNING id INTO v_course_id;
    END IF;

    -- Subjects
    SELECT id INTO v_sub_dbms_id FROM public.subjects WHERE course_id = v_course_id AND code = 'CS301';
    IF v_sub_dbms_id IS NULL THEN INSERT INTO public.subjects (course_id, title, code) VALUES (v_course_id, 'Database Management Systems', 'CS301') RETURNING id INTO v_sub_dbms_id; END IF;

    SELECT id INTO v_sub_cn_id FROM public.subjects WHERE course_id = v_course_id AND code = 'CS302';
    IF v_sub_cn_id IS NULL THEN INSERT INTO public.subjects (course_id, title, code) VALUES (v_course_id, 'Computer Networks', 'CS302') RETURNING id INTO v_sub_cn_id; END IF;

    SELECT id INTO v_sub_os_id FROM public.subjects WHERE course_id = v_course_id AND code = 'CS303';
    IF v_sub_os_id IS NULL THEN INSERT INTO public.subjects (course_id, title, code) VALUES (v_course_id, 'Operating Systems', 'CS303') RETURNING id INTO v_sub_os_id; END IF;

    SELECT id INTO v_sub_web_id FROM public.subjects WHERE course_id = v_course_id AND code = 'CS304';
    IF v_sub_web_id IS NULL THEN INSERT INTO public.subjects (course_id, title, code) VALUES (v_course_id, 'Web Development', 'CS304') RETURNING id INTO v_sub_web_id; END IF;

    -- Sections
    SELECT id INTO v_sec_dbms_id FROM public.sections WHERE subject_id = v_sub_dbms_id AND semester_id = v_semester_id AND name = 'CSE-A';
    IF v_sec_dbms_id IS NULL THEN INSERT INTO public.sections (subject_id, semester_id, name, capacity) VALUES (v_sub_dbms_id, v_semester_id, 'CSE-A', 60) RETURNING id INTO v_sec_dbms_id; END IF;

    SELECT id INTO v_sec_cn_id FROM public.sections WHERE subject_id = v_sub_cn_id AND semester_id = v_semester_id AND name = 'CSE-A';
    IF v_sec_cn_id IS NULL THEN INSERT INTO public.sections (subject_id, semester_id, name, capacity) VALUES (v_sub_cn_id, v_semester_id, 'CSE-A', 60) RETURNING id INTO v_sec_cn_id; END IF;

    SELECT id INTO v_sec_os_id FROM public.sections WHERE subject_id = v_sub_os_id AND semester_id = v_semester_id AND name = 'CSE-A';
    IF v_sec_os_id IS NULL THEN INSERT INTO public.sections (subject_id, semester_id, name, capacity) VALUES (v_sub_os_id, v_semester_id, 'CSE-A', 60) RETURNING id INTO v_sec_os_id; END IF;

    SELECT id INTO v_sec_web_id FROM public.sections WHERE subject_id = v_sub_web_id AND semester_id = v_semester_id AND name = 'CSE-A';
    IF v_sec_web_id IS NULL THEN INSERT INTO public.sections (subject_id, semester_id, name, capacity) VALUES (v_sub_web_id, v_semester_id, 'CSE-A', 60) RETURNING id INTO v_sec_web_id; END IF;

    ---------------------------------------------------------------------------
    -- 3. ENROLLMENTS & ASSIGNMENTS (IDEMPOTENT via ON CONFLICT)
    ---------------------------------------------------------------------------
    
    INSERT INTO public.student_enrollments (student_id, section_id, status)
    VALUES 
        (v_student_id, v_sec_dbms_id, 'active'),
        (v_student_id, v_sec_cn_id, 'active'),
        (v_student_id, v_sec_os_id, 'active'),
        (v_student_id, v_sec_web_id, 'active')
    ON CONFLICT (student_id, section_id) DO NOTHING;

    INSERT INTO public.faculty_assignments (faculty_id, section_id, is_primary)
    VALUES 
        (v_faculty_id, v_sec_dbms_id, true),
        (v_faculty_id, v_sec_cn_id, true),
        (v_faculty_id, v_sec_os_id, true),
        (v_faculty_id, v_sec_web_id, true)
    ON CONFLICT (faculty_id, section_id) DO NOTHING;

    ---------------------------------------------------------------------------
    -- 4. TIMETABLE
    ---------------------------------------------------------------------------
    SELECT id INTO v_room_id FROM public.rooms WHERE organization_id = v_org_id AND name = 'Lecture Hall A1';
    IF v_room_id IS NULL THEN INSERT INTO public.rooms (organization_id, name, capacity) VALUES (v_org_id, 'Lecture Hall A1', 100) RETURNING id INTO v_room_id; END IF;

    -- Avoid duplicate timetable entries by checking first.
    IF NOT EXISTS (SELECT 1 FROM public.timetable_entries WHERE section_id = v_sec_dbms_id AND day_of_week = 1) THEN
        INSERT INTO public.timetable_entries (section_id, faculty_id, room_id, day_of_week, start_time, end_time) VALUES
        (v_sec_dbms_id, v_faculty_id, v_room_id, 1, '09:00:00', '10:00:00'),
        (v_sec_cn_id, v_faculty_id, v_room_id, 1, '11:00:00', '12:00:00'),
        (v_sec_os_id, v_faculty_id, v_room_id, 2, '10:00:00', '11:00:00'),
        (v_sec_web_id, v_faculty_id, v_room_id, 3, '13:00:00', '14:00:00'),
        (v_sec_dbms_id, v_faculty_id, v_room_id, 4, '09:00:00', '10:00:00'),
        (v_sec_cn_id, v_faculty_id, v_room_id, 5, '11:00:00', '12:00:00');
    END IF;

    ---------------------------------------------------------------------------
    -- 5. ATTENDANCE (Using specific dates to prevent endless duplicates)
    ---------------------------------------------------------------------------
    SELECT id INTO v_att_sess_1 FROM public.attendance_sessions WHERE section_id = v_sec_dbms_id AND session_date = (CURRENT_DATE - INTERVAL '14 days')::date;
    IF v_att_sess_1 IS NULL THEN 
        INSERT INTO public.attendance_sessions (section_id, faculty_id, session_date, start_time, end_time) 
        VALUES (v_sec_dbms_id, v_faculty_id, (CURRENT_DATE - INTERVAL '14 days')::date, '09:00:00', '10:00:00') RETURNING id INTO v_att_sess_1;
        INSERT INTO public.attendance_records (session_id, student_id, status, marked_by) VALUES (v_att_sess_1, v_student_id, 'present', v_faculty_id);
    END IF;

    SELECT id INTO v_att_sess_2 FROM public.attendance_sessions WHERE section_id = v_sec_cn_id AND session_date = (CURRENT_DATE - INTERVAL '7 days')::date;
    IF v_att_sess_2 IS NULL THEN 
        INSERT INTO public.attendance_sessions (section_id, faculty_id, session_date, start_time, end_time) 
        VALUES (v_sec_cn_id, v_faculty_id, (CURRENT_DATE - INTERVAL '7 days')::date, '11:00:00', '12:00:00') RETURNING id INTO v_att_sess_2;
        INSERT INTO public.attendance_records (session_id, student_id, status, marked_by) VALUES (v_att_sess_2, v_student_id, 'present', v_faculty_id);
    END IF;

    SELECT id INTO v_att_sess_3 FROM public.attendance_sessions WHERE section_id = v_sec_os_id AND session_date = (CURRENT_DATE - INTERVAL '5 days')::date;
    IF v_att_sess_3 IS NULL THEN 
        INSERT INTO public.attendance_sessions (section_id, faculty_id, session_date, start_time, end_time) 
        VALUES (v_sec_os_id, v_faculty_id, (CURRENT_DATE - INTERVAL '5 days')::date, '10:00:00', '11:00:00') RETURNING id INTO v_att_sess_3;
        INSERT INTO public.attendance_records (session_id, student_id, status, marked_by) VALUES (v_att_sess_3, v_student_id, 'absent', v_faculty_id);
    END IF;

    ---------------------------------------------------------------------------
    -- 6. LMS (Assignments, Submissions, Grades)
    ---------------------------------------------------------------------------
    SELECT id INTO v_assign_dbms FROM public.assignments WHERE section_id = v_sec_dbms_id AND title = 'DBMS Assignment 1';
    IF v_assign_dbms IS NULL THEN
        INSERT INTO public.assignments (section_id, faculty_id, title, description, due_date, max_marks, is_published)
        VALUES (v_sec_dbms_id, v_faculty_id, 'DBMS Assignment 1', 'Normalization and SQL Queries', CURRENT_TIMESTAMP + INTERVAL '7 days', 20, true)
        RETURNING id INTO v_assign_dbms;
    END IF;

    SELECT id INTO v_assign_cn FROM public.assignments WHERE section_id = v_sec_cn_id AND title = 'Computer Networks Assignment 1';
    IF v_assign_cn IS NULL THEN
        INSERT INTO public.assignments (section_id, faculty_id, title, description, due_date, max_marks, is_published)
        VALUES (v_sec_cn_id, v_faculty_id, 'Computer Networks Assignment 1', 'TCP/IP and Routing', CURRENT_TIMESTAMP - INTERVAL '2 days', 25, true)
        RETURNING id INTO v_assign_cn;
    END IF;

    SELECT id INTO v_assign_web FROM public.assignments WHERE section_id = v_sec_web_id AND title = 'Web Development Project';
    IF v_assign_web IS NULL THEN
        INSERT INTO public.assignments (section_id, faculty_id, title, description, due_date, max_marks, is_published)
        VALUES (v_sec_web_id, v_faculty_id, 'Web Development Project', 'Next.js Application', CURRENT_TIMESTAMP + INTERVAL '14 days', 30, false)
        RETURNING id INTO v_assign_web;
    END IF;

    -- Create Submission and Grade (ONLY IF they don't exist yet)
    SELECT id INTO v_submission_cn FROM public.submissions WHERE assignment_id = v_assign_cn AND student_id = v_student_id;
    IF v_submission_cn IS NULL THEN
        INSERT INTO public.submissions (assignment_id, student_id, status, submitted_at, is_late)
        VALUES (v_assign_cn, v_student_id, 'graded', CURRENT_TIMESTAMP - INTERVAL '3 days', false)
        RETURNING id INTO v_submission_cn;
        
        INSERT INTO public.grades (submission_id, marks_obtained, feedback, graded_by, is_released)
        VALUES (v_submission_cn, 22.5, 'Great understanding of TCP/IP layers.', v_faculty_id, true)
        ON CONFLICT (submission_id) DO NOTHING;
    END IF;

    RAISE NOTICE '✅ SEED SCRIPT COMPLETED SUCCESSFULLY.';
END $$;
