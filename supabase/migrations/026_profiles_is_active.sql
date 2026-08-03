-- 026_profiles_is_active.sql
ALTER TABLE public.profiles 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Update RLS to factor in is_active where necessary, or keep it simple: 
-- Generally, if a profile is inactive, we might still want admins to read it.
-- But the student shouldn't be able to log in or see their own dashboard.
-- We handle the dashboard access at the Auth trigger level or application layout level.
