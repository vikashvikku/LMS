-- 024_seed_library_communications.sql
-- Seed script to populate Library, Announcements, and Notifications for demonstration
-- Safe to re-run: gracefully replaces its own demo data without breaking constraints.

DO $$
DECLARE
    v_org_id UUID;
    v_student_id UUID;
    v_sysadmin_id UUID;
    v_faculty_id UUID;
    
    -- Library vars
    v_book1 UUID;
    v_book2 UUID;
    v_book3 UUID;
    v_book4 UUID;
    
    v_copy1 UUID;
    v_copy2 UUID;
    v_copy3 UUID;
    v_copy4 UUID;
    
    v_loan1 UUID;
    v_loan2 UUID;
    v_loan3 UUID;
    v_loan4 UUID;
BEGIN
    -- 1. Get the target IDs by joining with auth.users for email
    -- Email is strictly unique, LIMIT 1 guarantees exactly one row.
    SELECT p.id, p.organization_id INTO v_student_id, v_org_id 
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE u.email = 'vikkuvikash79097@gmail.com'
    LIMIT 1;
    
    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Target student not found. Seed aborted.';
    END IF;

    -- Email is strictly unique, LIMIT 1 guarantees exactly one row.
    SELECT p.id INTO v_faculty_id 
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE u.email = 'mohit@gmail.com'
    LIMIT 1;

    -- Pick any admin as author, or fallback to faculty, or student himself if none
    -- LIMIT 1 guarantees exactly one row.
    SELECT id INTO v_sysadmin_id 
    FROM public.profiles 
    WHERE role IN ('university_admin', 'super_admin') AND organization_id = v_org_id
    LIMIT 1;

    IF v_sysadmin_id IS NULL THEN
        v_sysadmin_id := v_faculty_id;
    END IF;

    IF v_sysadmin_id IS NULL THEN
        v_sysadmin_id := v_student_id;
    END IF;

    -------------------------------------------------
    -- CLEANUP PREVIOUS SEEDS (Idempotency)
    -------------------------------------------------
    -- Because of ON DELETE CASCADE, deleting books removes copies, loans, and fines.
    DELETE FROM public.books 
    WHERE organization_id = v_org_id 
    AND title IN (
        'Database System Concepts', 
        'Computer Networks', 
        'Operating System Concepts', 
        'Introduction to Algorithms'
    );

    DELETE FROM public.announcements 
    WHERE organization_id = v_org_id 
    AND title IN (
        'Mid-Semester Examination Schedule Released',
        'University Library Extended Hours',
        'Web Development Workshop Registration Open'
    );

    DELETE FROM public.notifications 
    WHERE recipient_id = v_student_id 
    AND title IN (
        'New Assignment Published',
        'Grade Released',
        'Attendance Update',
        'New Announcement'
    );

    -------------------------------------------------
    -- 2. SEED LIBRARY
    -------------------------------------------------
    
    -- Insert Book 1 & Copy 1 & Loan 1
    INSERT INTO public.books (organization_id, title, author, isbn)
    VALUES (v_org_id, 'Database System Concepts', 'Abraham Silberschatz', '978-0073523323')
    RETURNING id INTO v_book1;
    
    INSERT INTO public.book_copies (book_id, accession_number, status)
    VALUES (v_book1, 'ACC-1001', 'borrowed')
    RETURNING id INTO v_copy1;
    
    INSERT INTO public.library_loans (borrower_id, copy_id, issued_at, due_at, status)
    VALUES (v_student_id, v_copy1, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '9 days', 'active')
    RETURNING id INTO v_loan1;


    -- Insert Book 2 & Copy 2 & Loan 2
    INSERT INTO public.books (organization_id, title, author, isbn)
    VALUES (v_org_id, 'Computer Networks', 'Andrew S. Tanenbaum', '978-0132126953')
    RETURNING id INTO v_book2;

    INSERT INTO public.book_copies (book_id, accession_number, status)
    VALUES (v_book2, 'ACC-1002', 'borrowed')
    RETURNING id INTO v_copy2;

    INSERT INTO public.library_loans (borrower_id, copy_id, issued_at, due_at, status)
    VALUES (v_student_id, v_copy2, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '12 days', 'active')
    RETURNING id INTO v_loan2;


    -- Insert Book 3 & Copy 3 & Loan 3 (Historical)
    INSERT INTO public.books (organization_id, title, author, isbn)
    VALUES (v_org_id, 'Operating System Concepts', 'Abraham Silberschatz', '978-1118063330')
    RETURNING id INTO v_book3;

    INSERT INTO public.book_copies (book_id, accession_number, status)
    VALUES (v_book3, 'ACC-1003', 'available')
    RETURNING id INTO v_copy3;

    INSERT INTO public.library_loans (borrower_id, copy_id, issued_at, due_at, returned_at, status)
    VALUES (v_student_id, v_copy3, CURRENT_DATE - INTERVAL '40 days', CURRENT_DATE - INTERVAL '26 days', CURRENT_DATE - INTERVAL '28 days', 'returned')
    RETURNING id INTO v_loan3;


    -- Insert Book 4 & Copy 4 & Loan 4 & Fine (Historical Overdue)
    INSERT INTO public.books (organization_id, title, author, isbn)
    VALUES (v_org_id, 'Introduction to Algorithms', 'Thomas H. Cormen', '978-0262033848')
    RETURNING id INTO v_book4;

    INSERT INTO public.book_copies (book_id, accession_number, status)
    VALUES (v_book4, 'ACC-1004', 'available')
    RETURNING id INTO v_copy4;

    INSERT INTO public.library_loans (borrower_id, copy_id, issued_at, due_at, returned_at, status)
    VALUES (v_student_id, v_copy4, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '46 days', CURRENT_DATE - INTERVAL '44 days', 'returned')
    RETURNING id INTO v_loan4;

    -- Fine for the overdue historical loan 4
    INSERT INTO public.library_fines (loan_id, amount, status)
    VALUES (v_loan4, 50.00, 'paid');


    -------------------------------------------------
    -- 3. SEED ANNOUNCEMENTS
    -------------------------------------------------
    INSERT INTO public.announcements (organization_id, title, content, author_id, target_type, created_at)
    VALUES 
        (v_org_id, 'Mid-Semester Examination Schedule Released', 'The timetable for the upcoming mid-semester examinations has been published on the notice board. Exams will commence in two weeks.', v_sysadmin_id, 'organization', NOW() - INTERVAL '1 day'),
        (v_org_id, 'University Library Extended Hours', 'During the examination period, the central library will remain open 24/7 starting next Monday to support your preparation.', v_sysadmin_id, 'organization', NOW() - INTERVAL '3 days'),
        (v_org_id, 'Web Development Workshop Registration Open', 'A hands-on workshop on modern Web Development will be held this Saturday. Seats are limited. Register via the portal.', v_sysadmin_id, 'organization', NOW() - INTERVAL '5 days');

    -------------------------------------------------
    -- 4. SEED NOTIFICATIONS
    -------------------------------------------------
    INSERT INTO public.notifications (recipient_id, title, message, type, target_url, is_read, created_at)
    VALUES 
        (v_student_id, 'New Assignment Published', 'DBMS Assignment 1 has been published.', 'assignment', '/student/assignments', false, NOW() - INTERVAL '2 hours'),
        (v_student_id, 'Grade Released', 'Your Computer Networks Assignment 1 has been graded.', 'grade', '/student/grades', false, NOW() - INTERVAL '1 day'),
        (v_student_id, 'Attendance Update', 'Your attendance has been updated for Operating Systems.', 'attendance', '/student/attendance', true, NOW() - INTERVAL '2 days'),
        (v_student_id, 'New Announcement', 'Mid-Semester Examination Schedule Released.', 'announcement', '/student/announcements', true, NOW() - INTERVAL '3 days');

END $$;
