-- ==============================================================================
-- CAMPUS OS - SEED MULTIPLE ACADEMIC PROGRAMS & SECTIONS
-- ==============================================================================

DO $$
DECLARE
    v_org_id UUID;
    v_acad_year_id UUID;
    v_semester_id UUID;
    
    v_dept_cs UUID;
    v_dept_it UUID;
    v_dept_ece UUID;
    v_dept_ca UUID;
    
    -- Programs
    v_prog_cse UUID;
    v_prog_it UUID;
    v_prog_bca UUID;
    v_prog_mca UUID;
    v_prog_ece UUID;
    
    -- Courses
    v_course_cse UUID;
    v_course_it UUID;
    v_course_bca UUID;
    v_course_mca UUID;
    v_course_ece UUID;
    
    -- Subjects
    v_sub_cse1 UUID;
    v_sub_cse2 UUID;
    
    v_sub_it1 UUID;
    
    v_sub_bca1 UUID;
    
    v_sub_mca1 UUID;
    
    v_sub_ece1 UUID;
BEGIN
    -- 0. Find existing organization from BTECH-CSE program
    SELECT d.organization_id INTO v_org_id 
    FROM public.departments d 
    JOIN public.programs p ON p.department_id = d.id 
    WHERE p.code = 'BTECH-CSE' LIMIT 1;

    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Could not find existing organization from BTECH-CSE program.';
    END IF;

    -- 1. Ensure basic Academic Year & Semester
    SELECT id INTO v_acad_year_id FROM public.academic_years WHERE organization_id = v_org_id AND name = '2026-2027';
    IF v_acad_year_id IS NULL THEN
        INSERT INTO public.academic_years (organization_id, name, start_date, end_date, is_active)
        VALUES (v_org_id, '2026-2027', '2026-08-01', '2027-05-31', true) RETURNING id INTO v_acad_year_id;
    END IF;

    SELECT id INTO v_semester_id FROM public.semesters WHERE academic_year_id = v_acad_year_id AND name = 'Semester 1';
    IF v_semester_id IS NULL THEN
        INSERT INTO public.semesters (academic_year_id, name, start_date, end_date)
        VALUES (v_acad_year_id, 'Semester 1', '2026-08-01', '2026-12-15') RETURNING id INTO v_semester_id;
    END IF;

    -- 2. Departments
    SELECT id INTO v_dept_cs FROM public.departments WHERE organization_id = v_org_id AND code = 'CS';
    IF v_dept_cs IS NULL THEN INSERT INTO public.departments (organization_id, name, code) VALUES (v_org_id, 'Computer Science', 'CS') RETURNING id INTO v_dept_cs; END IF;

    SELECT id INTO v_dept_it FROM public.departments WHERE organization_id = v_org_id AND code = 'IT';
    IF v_dept_it IS NULL THEN INSERT INTO public.departments (organization_id, name, code) VALUES (v_org_id, 'Information Technology', 'IT') RETURNING id INTO v_dept_it; END IF;
    
    SELECT id INTO v_dept_ca FROM public.departments WHERE organization_id = v_org_id AND code = 'CA';
    IF v_dept_ca IS NULL THEN INSERT INTO public.departments (organization_id, name, code) VALUES (v_org_id, 'Computer Applications', 'CA') RETURNING id INTO v_dept_ca; END IF;
    
    SELECT id INTO v_dept_ece FROM public.departments WHERE organization_id = v_org_id AND code = 'ECE';
    IF v_dept_ece IS NULL THEN INSERT INTO public.departments (organization_id, name, code) VALUES (v_org_id, 'Electronics', 'ECE') RETURNING id INTO v_dept_ece; END IF;

    -- 3. Programs
    SELECT id INTO v_prog_cse FROM public.programs WHERE code = 'BTECH-CSE';
    IF v_prog_cse IS NULL THEN INSERT INTO public.programs (department_id, name, code) VALUES (v_dept_cs, 'B.Tech Computer Science and Engineering', 'BTECH-CSE') RETURNING id INTO v_prog_cse; END IF;

    SELECT id INTO v_prog_it FROM public.programs WHERE code = 'BTECH-IT';
    IF v_prog_it IS NULL THEN INSERT INTO public.programs (department_id, name, code) VALUES (v_dept_it, 'B.Tech Information Technology', 'BTECH-IT') RETURNING id INTO v_prog_it; END IF;

    SELECT id INTO v_prog_bca FROM public.programs WHERE code = 'BCA';
    IF v_prog_bca IS NULL THEN INSERT INTO public.programs (department_id, name, code) VALUES (v_dept_ca, 'Bachelor of Computer Applications', 'BCA') RETURNING id INTO v_prog_bca; END IF;

    SELECT id INTO v_prog_mca FROM public.programs WHERE code = 'MCA';
    IF v_prog_mca IS NULL THEN INSERT INTO public.programs (department_id, name, code) VALUES (v_dept_ca, 'Master of Computer Applications', 'MCA') RETURNING id INTO v_prog_mca; END IF;

    SELECT id INTO v_prog_ece FROM public.programs WHERE code = 'BTECH-ECE';
    IF v_prog_ece IS NULL THEN INSERT INTO public.programs (department_id, name, code) VALUES (v_dept_ece, 'B.Tech Electronics and Communication', 'BTECH-ECE') RETURNING id INTO v_prog_ece; END IF;

    -- 4. Courses (e.g., Year 1)
    SELECT id INTO v_course_cse FROM public.courses WHERE code = 'BTECH-CSE-1';
    IF v_course_cse IS NULL THEN INSERT INTO public.courses (program_id, title, code, credits) VALUES (v_prog_cse, 'B.Tech CSE - First Year', 'BTECH-CSE-1', 120) RETURNING id INTO v_course_cse; END IF;

    SELECT id INTO v_course_it FROM public.courses WHERE code = 'BTECH-IT-1';
    IF v_course_it IS NULL THEN INSERT INTO public.courses (program_id, title, code, credits) VALUES (v_prog_it, 'B.Tech IT - First Year', 'BTECH-IT-1', 120) RETURNING id INTO v_course_it; END IF;

    SELECT id INTO v_course_bca FROM public.courses WHERE code = 'BCA-1';
    IF v_course_bca IS NULL THEN INSERT INTO public.courses (program_id, title, code, credits) VALUES (v_prog_bca, 'BCA - First Year', 'BCA-1', 120) RETURNING id INTO v_course_bca; END IF;

    SELECT id INTO v_course_mca FROM public.courses WHERE code = 'MCA-1';
    IF v_course_mca IS NULL THEN INSERT INTO public.courses (program_id, title, code, credits) VALUES (v_prog_mca, 'MCA - First Year', 'MCA-1', 120) RETURNING id INTO v_course_mca; END IF;

    SELECT id INTO v_course_ece FROM public.courses WHERE code = 'BTECH-ECE-1';
    IF v_course_ece IS NULL THEN INSERT INTO public.courses (program_id, title, code, credits) VALUES (v_prog_ece, 'B.Tech ECE - First Year', 'BTECH-ECE-1', 120) RETURNING id INTO v_course_ece; END IF;

    -- 5. Subjects
    SELECT id INTO v_sub_cse1 FROM public.subjects WHERE code = 'CS101' AND course_id = v_course_cse;
    IF v_sub_cse1 IS NULL THEN INSERT INTO public.subjects (course_id, title, code) VALUES (v_course_cse, 'Intro to CSE', 'CS101') RETURNING id INTO v_sub_cse1; END IF;
    
    SELECT id INTO v_sub_cse2 FROM public.subjects WHERE code = 'CS102' AND course_id = v_course_cse;
    IF v_sub_cse2 IS NULL THEN INSERT INTO public.subjects (course_id, title, code) VALUES (v_course_cse, 'Data Structures', 'CS102') RETURNING id INTO v_sub_cse2; END IF;

    SELECT id INTO v_sub_it1 FROM public.subjects WHERE code = 'IT101' AND course_id = v_course_it;
    IF v_sub_it1 IS NULL THEN INSERT INTO public.subjects (course_id, title, code) VALUES (v_course_it, 'Intro to IT', 'IT101') RETURNING id INTO v_sub_it1; END IF;

    SELECT id INTO v_sub_bca1 FROM public.subjects WHERE code = 'BCA101' AND course_id = v_course_bca;
    IF v_sub_bca1 IS NULL THEN INSERT INTO public.subjects (course_id, title, code) VALUES (v_course_bca, 'BCA Basics', 'BCA101') RETURNING id INTO v_sub_bca1; END IF;

    SELECT id INTO v_sub_mca1 FROM public.subjects WHERE code = 'MCA101' AND course_id = v_course_mca;
    IF v_sub_mca1 IS NULL THEN INSERT INTO public.subjects (course_id, title, code) VALUES (v_course_mca, 'Advanced Computing', 'MCA101') RETURNING id INTO v_sub_mca1; END IF;

    SELECT id INTO v_sub_ece1 FROM public.subjects WHERE code = 'ECE101' AND course_id = v_course_ece;
    IF v_sub_ece1 IS NULL THEN INSERT INTO public.subjects (course_id, title, code) VALUES (v_course_ece, 'Circuits 101', 'ECE101') RETURNING id INTO v_sub_ece1; END IF;

    -- 6. Sections (Batches)
    -- BTECH-CSE: CSE-A, CSE-B, CSE-C, CSE-D
    INSERT INTO public.sections (subject_id, semester_id, name, capacity) VALUES 
        (v_sub_cse1, v_semester_id, 'CSE-A', 60), (v_sub_cse2, v_semester_id, 'CSE-A', 60),
        (v_sub_cse1, v_semester_id, 'CSE-B', 60), (v_sub_cse2, v_semester_id, 'CSE-B', 60),
        (v_sub_cse1, v_semester_id, 'CSE-C', 60), (v_sub_cse2, v_semester_id, 'CSE-C', 60),
        (v_sub_cse1, v_semester_id, 'CSE-D', 60), (v_sub_cse2, v_semester_id, 'CSE-D', 60)
    ON CONFLICT DO NOTHING;

    -- BTECH-IT: IT-A, IT-B, IT-C
    INSERT INTO public.sections (subject_id, semester_id, name, capacity) VALUES 
        (v_sub_it1, v_semester_id, 'IT-A', 60),
        (v_sub_it1, v_semester_id, 'IT-B', 60),
        (v_sub_it1, v_semester_id, 'IT-C', 60)
    ON CONFLICT DO NOTHING;

    -- BCA: BCA-A, BCA-B
    INSERT INTO public.sections (subject_id, semester_id, name, capacity) VALUES 
        (v_sub_bca1, v_semester_id, 'BCA-A', 60),
        (v_sub_bca1, v_semester_id, 'BCA-B', 60)
    ON CONFLICT DO NOTHING;

    -- MCA: MCA-A, MCA-B
    INSERT INTO public.sections (subject_id, semester_id, name, capacity) VALUES 
        (v_sub_mca1, v_semester_id, 'MCA-A', 60),
        (v_sub_mca1, v_semester_id, 'MCA-B', 60)
    ON CONFLICT DO NOTHING;

    -- BTECH-ECE: ECE-A, ECE-B, ECE-C
    INSERT INTO public.sections (subject_id, semester_id, name, capacity) VALUES 
        (v_sub_ece1, v_semester_id, 'ECE-A', 60),
        (v_sub_ece1, v_semester_id, 'ECE-B', 60),
        (v_sub_ece1, v_semester_id, 'ECE-C', 60)
    ON CONFLICT DO NOTHING;

END $$;
