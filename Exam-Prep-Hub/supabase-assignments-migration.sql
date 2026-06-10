-- =============================================================
--  Exam-Prep-Hub : Paper Assignments (teacher -> class)
--  Run after supabase-classes-migration.sql.
--  Follows the same permissive RLS pattern as the rest of the
--  project (backend uses the SERVICE ROLE key; authorisation is
--  enforced in backend/src/index.js).
-- =============================================================

CREATE TABLE IF NOT EXISTS assignments (
  id             TEXT PRIMARY KEY,                  -- e.g. asn_...
  paper_id       TEXT NOT NULL,                     -- generated paper id (no FK; lives per-user)
  paper_title    TEXT,
  class_id       TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  class_code     TEXT,
  class_name     TEXT,
  assigned_by    TEXT NOT NULL,                     -- profiles.id of the teacher
  assigned_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (class_id, paper_id)
);

CREATE INDEX IF NOT EXISTS idx_assignments_class    ON assignments (class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_paper    ON assignments (paper_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher  ON assignments (assigned_by);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on assignments" ON assignments;
CREATE POLICY "Allow all operations on assignments" ON assignments
  FOR ALL USING (true) WITH CHECK (true);
