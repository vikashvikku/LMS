-- 037_announcements_management.sql

-- Modify existing announcements table to match the new requirements
ALTER TABLE public.announcements DROP CONSTRAINT IF EXISTS announcements_target_type_check;

ALTER TABLE public.announcements RENAME COLUMN content TO message;
ALTER TABLE public.announcements RENAME COLUMN target_type TO audience_type;
ALTER TABLE public.announcements RENAME COLUMN author_id TO created_by;

ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS set_announcements_updated_at ON public.announcements;
CREATE TRIGGER set_announcements_updated_at 
BEFORE UPDATE ON public.announcements 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
