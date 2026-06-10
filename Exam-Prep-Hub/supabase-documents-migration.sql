-- Migration: add `documents` table for storing uploaded PDF metadata,
-- and link extracted questions back to their source document.
-- Run this in Supabase SQL editor.

-- 1. documents table
CREATE TABLE IF NOT EXISTS documents (
  id              TEXT PRIMARY KEY,
  filename        TEXT NOT NULL,
  storage_path    TEXT NOT NULL,           -- e.g. papers/<id>/<file>.pdf  OR  local fs path
  storage_backend TEXT NOT NULL DEFAULT 'supabase', -- 'supabase' | 'local'
  size_bytes      BIGINT,
  page_count      INTEGER,
  text_length     INTEGER,
  is_scanned      BOOLEAN DEFAULT FALSE,
  parser          TEXT,                    -- 'groq' | 'heuristic' | 'gemini'
  status          TEXT DEFAULT 'ready',    -- pending | extracting | ready | failed
  uploaded_by     TEXT,                    -- profile id (admin id) for now
  subject         TEXT,
  exam_type       TEXT,
  class_level     TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_subject     ON documents(subject);
CREATE INDEX IF NOT EXISTS idx_documents_created_at  ON documents(created_at DESC);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Permissive policy for now (tighten when you add proper auth)
DROP POLICY IF EXISTS "Allow all operations on documents" ON documents;
CREATE POLICY "Allow all operations on documents" ON documents FOR ALL USING (true);

-- 2. link questions back to source document
ALTER TABLE questions ADD COLUMN IF NOT EXISTS document_id     TEXT REFERENCES documents(id) ON DELETE SET NULL;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS page_number     INTEGER;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS has_figure      BOOLEAN DEFAULT FALSE;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS page_image_url  TEXT;

-- Admins can add custom values via the UI ("+ Add more type", "+ Add more exam"),
-- so the rigid CHECK constraints from the original schema would block valid input.
-- Drop them — validation happens in the API layer.
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_type_check;
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_difficulty_check;
CREATE INDEX IF NOT EXISTS idx_questions_document_id ON questions(document_id);
CREATE INDEX IF NOT EXISTS idx_questions_has_figure  ON questions(has_figure);

-- 3. Storage bucket
-- Run this once in Supabase Dashboard -> Storage:
--   Create a private bucket named "papers"
-- Or via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('papers', 'papers', false)
ON CONFLICT (id) DO NOTHING;

-- Allow service role full access to papers bucket (already true by default for service_role).
-- If you use anon key from server (not recommended), add a permissive policy here.
