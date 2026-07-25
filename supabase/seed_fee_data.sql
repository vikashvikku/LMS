DO $$
DECLARE
    v_student_id uuid;
    v_org_id uuid;
    v_academic_year_id uuid;
    v_fee_structure_id uuid;
    v_student_fee_id uuid;
    v_payment1_id uuid;
    v_payment2_id uuid;
BEGIN

    -- 1. Find student from auth account
    SELECT id
    INTO v_student_id
    FROM auth.users
    WHERE email = 'vikkuvikash79097@gmail.com'
    LIMIT 1;

    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Student account not found';
    END IF;


    -- 2. Get student's organization
    SELECT organization_id
    INTO v_org_id
    FROM public.profiles
    WHERE id = v_student_id
    LIMIT 1;

    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Organization not found for student';
    END IF;


    -- 3. Existing academic year
    v_academic_year_id :=
        'a145a037-c9f8-467e-ac11-45944dc2efb3'::uuid;


    -- 4. Create fee structure
    -- program_id is nullable, so we don't need enrollment/program lookup
    INSERT INTO public.fee_structures (
        organization_id,
        program_id,
        name,
        base_amount
    )
    VALUES (
        v_org_id,
        NULL,
        'B.Tech CSE Academic Fee 2026-27',
        120000
    )
    RETURNING id INTO v_fee_structure_id;


    -- 5. Assign fee to student
    INSERT INTO public.student_fees (
        student_id,
        fee_structure_id,
        academic_year_id,
        total_amount,
        discount_amount,
        due_date,
        status
    )
    VALUES (
        v_student_id,
        v_fee_structure_id,
        v_academic_year_id,
        120000,
        10000,
        '2026-08-15',
        'partial'
    )
    RETURNING id INTO v_student_fee_id;


    -- 6. First payment
    INSERT INTO public.payments (
        student_fee_id,
        amount_paid,
        payment_method,
        reference_number,
        paid_at
    )
    VALUES (
        v_student_fee_id,
        50000,
        'UPI',
        'CAMPUS-UPI-2026-001',
        '2026-07-10 10:30:00+00'
    )
    RETURNING id INTO v_payment1_id;


    -- 7. First payment transaction
    INSERT INTO public.payment_transactions (
        payment_id,
        gateway_reference,
        gateway_status
    )
    VALUES (
        v_payment1_id,
        'TXN-CAMPUS-2026-001',
        'success'
    );


    -- 8. Second payment
    INSERT INTO public.payments (
        student_fee_id,
        amount_paid,
        payment_method,
        reference_number,
        paid_at
    )
    VALUES (
        v_student_fee_id,
        25000,
        'Card',
        'CAMPUS-CARD-2026-002',
        '2026-07-20 14:15:00+00'
    )
    RETURNING id INTO v_payment2_id;


    -- 9. Second payment transaction
    INSERT INTO public.payment_transactions (
        payment_id,
        gateway_reference,
        gateway_status
    )
    VALUES (
        v_payment2_id,
        'TXN-CAMPUS-2026-002',
        'success'
    );


    RAISE NOTICE 'Fee data successfully created';

END $$;