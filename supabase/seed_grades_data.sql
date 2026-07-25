-- ==============================================================================
-- CAMPUS OS - GRADES TEST DATA SEED SCRIPT
-- ==============================================================================
-- Safely seeds additional graded assessments for the existing student.
-- ==============================================================================

DO $$
DECLARE
    v_student_email TEXT := 'vikkuvikash79097@gmail.com';
    v_faculty_email TEXT := 'mohit@gmail.com';

    v_student_id UUID;
    v_faculty_id UUID;
    
    v_sec_dbms_id UUID;
    v_sec_cn_id UUID;
    v_sec_os_id UUID;
    
    -- Submissions
    v_sub UUID;
BEGIN
    -- 1. Find Users
    SELECT p.id INTO v_student_id
    FROM auth.users u
    JOIN public.profiles p ON u.id = p.id
    WHERE u.email = v_student_email
    LIMIT 1;

    SELECT p.id INTO v_faculty_id
    FROM auth.users u
    JOIN public.profiles p ON u.id = p.id
    WHERE u.email = v_faculty_email
    LIMIT 1;

    -- 2. Find Sections (reusing seeded names)
    SELECT s.id INTO v_sec_dbms_id
    FROM public.sections s
    JOIN public.subjects sub ON s.subject_id = sub.id
    WHERE sub.code = 'CS301' AND s.name = 'CSE-A' LIMIT 1;

    SELECT s.id INTO v_sec_cn_id
    FROM public.sections s
    JOIN public.subjects sub ON s.subject_id = sub.id
    WHERE sub.code = 'CS302' AND s.name = 'CSE-A' LIMIT 1;

    SELECT s.id INTO v_sec_os_id
    FROM public.sections s
    JOIN public.subjects sub ON s.subject_id = sub.id
    WHERE sub.code = 'CS303' AND s.name = 'CSE-A' LIMIT 1;

    ---------------------------------------------------------------------------
    -- HELPER FUNCTION: Add Graded Assessment
    ---------------------------------------------------------------------------
    -- We can just inline the inserts safely with DO blocks or IF NOT EXISTS
    -- Since plpgsql doesn't allow nested DO without defining functions easily, we just use IF.

    -- ==========================================
    -- COMPUTER NETWORKS
    -- ==========================================
    
    -- CN: Assignment 2 (max 20, score 18)
    IF NOT EXISTS (SELECT 1 FROM public.assignments WHERE section_id = v_sec_cn_id AND title = 'Computer Networks Assignment 2') THEN
        WITH new_assign AS (
            INSERT INTO public.assignments (section_id, faculty_id, title, description, due_date, max_marks, is_published, created_at)
            VALUES (v_sec_cn_id, v_faculty_id, 'Computer Networks Assignment 2', 'Subnetting and VLANs', CURRENT_TIMESTAMP - INTERVAL '15 days', 20, true, CURRENT_TIMESTAMP - INTERVAL '20 days')
            RETURNING id
        ), new_sub AS (
            INSERT INTO public.submissions (assignment_id, student_id, status, submitted_at, is_late)
            SELECT id, v_student_id, 'graded', CURRENT_TIMESTAMP - INTERVAL '16 days', false FROM new_assign
            RETURNING id
        )
        INSERT INTO public.grades (submission_id, marks_obtained, feedback, graded_by, is_released, graded_at)
        SELECT id, 18, 'Good work on subnet calculations.', v_faculty_id, true, CURRENT_TIMESTAMP - INTERVAL '14 days' FROM new_sub;
    END IF;

    -- CN: Mid Term (max 50, score 42)
    IF NOT EXISTS (SELECT 1 FROM public.assignments WHERE section_id = v_sec_cn_id AND title = 'CN Mid Term Examination') THEN
        WITH new_assign AS (
            INSERT INTO public.assignments (section_id, faculty_id, title, description, due_date, max_marks, is_published, created_at)
            VALUES (v_sec_cn_id, v_faculty_id, 'CN Mid Term Examination', 'Mid Term', CURRENT_TIMESTAMP - INTERVAL '10 days', 50, true, CURRENT_TIMESTAMP - INTERVAL '10 days')
            RETURNING id
        ), new_sub AS (
            INSERT INTO public.submissions (assignment_id, student_id, status, submitted_at, is_late)
            SELECT id, v_student_id, 'graded', CURRENT_TIMESTAMP - INTERVAL '10 days', false FROM new_assign
            RETURNING id
        )
        INSERT INTO public.grades (submission_id, marks_obtained, feedback, graded_by, is_released, graded_at)
        SELECT id, 42, 'Solid performance.', v_faculty_id, true, CURRENT_TIMESTAMP - INTERVAL '8 days' FROM new_sub;
    END IF;


    -- ==========================================
    -- DBMS
    -- ==========================================
    
    -- DBMS: Assignment 1 (max 20, score 17) (Wait, earlier script might have created this unsubmitted? Let's check. It created DBMS Assignment 1 but no submission.)
    -- Let's just create the submission if it doesn't exist.
    IF EXISTS (SELECT 1 FROM public.assignments WHERE section_id = v_sec_dbms_id AND title = 'DBMS Assignment 1') THEN
        -- Assignment exists. Check if submission exists.
        SELECT id INTO v_sub FROM public.submissions 
        WHERE assignment_id = (SELECT id FROM public.assignments WHERE section_id = v_sec_dbms_id AND title = 'DBMS Assignment 1' LIMIT 1) 
        AND student_id = v_student_id;
        
        IF v_sub IS NULL THEN
            WITH new_sub AS (
                INSERT INTO public.submissions (assignment_id, student_id, status, submitted_at, is_late)
                SELECT id, v_student_id, 'graded', CURRENT_TIMESTAMP - INTERVAL '5 days', false 
                FROM public.assignments WHERE section_id = v_sec_dbms_id AND title = 'DBMS Assignment 1' LIMIT 1
                RETURNING id
            )
            INSERT INTO public.grades (submission_id, marks_obtained, feedback, graded_by, is_released, graded_at)
            SELECT id, 17, 'Watch out for normal form violations.', v_faculty_id, true, CURRENT_TIMESTAMP - INTERVAL '4 days' FROM new_sub;
        END IF;
    END IF;

    -- DBMS: Quiz 1 (max 10, score 9)
    IF NOT EXISTS (SELECT 1 FROM public.assignments WHERE section_id = v_sec_dbms_id AND title = 'DBMS Quiz 1') THEN
        WITH new_assign AS (
            INSERT INTO public.assignments (section_id, faculty_id, title, description, due_date, max_marks, is_published, created_at)
            VALUES (v_sec_dbms_id, v_faculty_id, 'DBMS Quiz 1', 'Relational Algebra', CURRENT_TIMESTAMP - INTERVAL '25 days', 10, true, CURRENT_TIMESTAMP - INTERVAL '25 days')
            RETURNING id
        ), new_sub AS (
            INSERT INTO public.submissions (assignment_id, student_id, status, submitted_at, is_late)
            SELECT id, v_student_id, 'graded', CURRENT_TIMESTAMP - INTERVAL '25 days', false FROM new_assign
            RETURNING id
        )
        INSERT INTO public.grades (submission_id, marks_obtained, feedback, graded_by, is_released, graded_at)
        SELECT id, 9, 'Excellent.', v_faculty_id, true, CURRENT_TIMESTAMP - INTERVAL '24 days' FROM new_sub;
    END IF;

    -- DBMS: Mid Term (max 50, score 38)
    IF NOT EXISTS (SELECT 1 FROM public.assignments WHERE section_id = v_sec_dbms_id AND title = 'DBMS Mid Term Examination') THEN
        WITH new_assign AS (
            INSERT INTO public.assignments (section_id, faculty_id, title, description, due_date, max_marks, is_published, created_at)
            VALUES (v_sec_dbms_id, v_faculty_id, 'DBMS Mid Term Examination', 'Mid Term', CURRENT_TIMESTAMP - INTERVAL '10 days', 50, true, CURRENT_TIMESTAMP - INTERVAL '10 days')
            RETURNING id
        ), new_sub AS (
            INSERT INTO public.submissions (assignment_id, student_id, status, submitted_at, is_late)
            SELECT id, v_student_id, 'graded', CURRENT_TIMESTAMP - INTERVAL '10 days', false FROM new_assign
            RETURNING id
        )
        INSERT INTO public.grades (submission_id, marks_obtained, feedback, graded_by, is_released, graded_at)
        SELECT id, 38, 'Good performance overall.', v_faculty_id, true, CURRENT_TIMESTAMP - INTERVAL '8 days' FROM new_sub;
    END IF;


    -- ==========================================
    -- OPERATING SYSTEMS
    -- ==========================================
    
    -- OS: Assignment 1 (max 25, score 23)
    IF NOT EXISTS (SELECT 1 FROM public.assignments WHERE section_id = v_sec_os_id AND title = 'OS Assignment 1') THEN
        WITH new_assign AS (
            INSERT INTO public.assignments (section_id, faculty_id, title, description, due_date, max_marks, is_published, created_at)
            VALUES (v_sec_os_id, v_faculty_id, 'OS Assignment 1', 'Process Scheduling Algorithms', CURRENT_TIMESTAMP - INTERVAL '12 days', 25, true, CURRENT_TIMESTAMP - INTERVAL '18 days')
            RETURNING id
        ), new_sub AS (
            INSERT INTO public.submissions (assignment_id, student_id, status, submitted_at, is_late)
            SELECT id, v_student_id, 'graded', CURRENT_TIMESTAMP - INTERVAL '13 days', false FROM new_assign
            RETURNING id
        )
        INSERT INTO public.grades (submission_id, marks_obtained, feedback, graded_by, is_released, graded_at)
        SELECT id, 23, 'Optimal algorithm selection.', v_faculty_id, true, CURRENT_TIMESTAMP - INTERVAL '11 days' FROM new_sub;
    END IF;

    -- OS: Quiz 1 (max 15, score 12)
    IF NOT EXISTS (SELECT 1 FROM public.assignments WHERE section_id = v_sec_os_id AND title = 'OS Quiz 1') THEN
        WITH new_assign AS (
            INSERT INTO public.assignments (section_id, faculty_id, title, description, due_date, max_marks, is_published, created_at)
            VALUES (v_sec_os_id, v_faculty_id, 'OS Quiz 1', 'Deadlocks', CURRENT_TIMESTAMP - INTERVAL '6 days', 15, true, CURRENT_TIMESTAMP - INTERVAL '6 days')
            RETURNING id
        ), new_sub AS (
            INSERT INTO public.submissions (assignment_id, student_id, status, submitted_at, is_late)
            SELECT id, v_student_id, 'graded', CURRENT_TIMESTAMP - INTERVAL '6 days', false FROM new_assign
            RETURNING id
        )
        INSERT INTO public.grades (submission_id, marks_obtained, feedback, graded_by, is_released, graded_at)
        SELECT id, 12, 'Review Banker algorithm.', v_faculty_id, true, CURRENT_TIMESTAMP - INTERVAL '5 days' FROM new_sub;
    END IF;

END $$;
