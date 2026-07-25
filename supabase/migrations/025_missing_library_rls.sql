-- 025_missing_library_rls.sql
-- Fix the silent query failures caused by missing RLS SELECT policies on library tables

-- 1. Books (Organization-wide visibility)
CREATE POLICY "Users can read books" ON public.books FOR SELECT USING (organization_id = public.current_organization_id());

-- 2. Book Copies (Visible if book is in org)
CREATE POLICY "Users can read book_copies" ON public.book_copies FOR SELECT USING (
    book_id IN (SELECT id FROM public.books WHERE organization_id = public.current_organization_id())
);

-- 3. Library Loans (Students can read their own, Librarians can read all)
CREATE POLICY "Users can read their own loans" ON public.library_loans FOR SELECT USING (
    borrower_id = auth.uid() OR public.has_role('librarian') OR public.has_role('university_admin') OR public.has_role('super_admin')
);

-- 4. Library Fines (Students can read fines for their own loans)
CREATE POLICY "Users can read their own fines" ON public.library_fines FOR SELECT USING (
    loan_id IN (SELECT id FROM public.library_loans WHERE borrower_id = auth.uid()) OR public.has_role('librarian') OR public.has_role('university_admin') OR public.has_role('super_admin')
);
