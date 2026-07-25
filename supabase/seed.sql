-- Seed Data for Development
-- supabase/seed.sql

-- Example Org
INSERT INTO public.organizations (id, name, domain) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo University', 'demo.edu')
ON CONFLICT DO NOTHING;

-- NOTE: Since profiles reference auth.users, and we cannot easily mock auth.users in seed.sql without invoking GoTrue endpoints, 
-- actual profile seeding requires either a server-side script using the Supabase Admin API to create users, 
-- or manual signup in the development environment.

-- Example Academic Structure (These don't rely on auth.users except for dept heads)
INSERT INTO public.academic_years (id, organization_id, name, start_date, end_date, is_active)
VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '2026-2027', '2026-08-01', '2027-05-31', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.departments (id, organization_id, name, code)
VALUES ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Computer Science', 'CS')
ON CONFLICT DO NOTHING;

INSERT INTO public.programs (id, department_id, name, code)
VALUES ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'Bachelor of Science in Computer Science', 'BSCS')
ON CONFLICT DO NOTHING;
