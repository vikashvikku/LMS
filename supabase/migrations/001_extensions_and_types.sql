-- 001_extensions_and_types.sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector"; -- for AI/RAG

CREATE TYPE user_role AS ENUM (
  'super_admin',
  'university_admin',
  'department_head',
  'faculty',
  'student',
  'finance',
  'librarian',
  'parent'
);

CREATE TYPE attendance_status AS ENUM (
  'present', 'absent', 'late', 'excused'
);

CREATE TYPE submission_status AS ENUM (
  'draft', 'submitted', 'graded', 'returned'
);

CREATE TYPE exam_type AS ENUM (
  'midterm', 'final', 'quiz', 'practical'
);

-- Reusable updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
