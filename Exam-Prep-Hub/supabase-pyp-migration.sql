-- Previous Year Papers / Mock papers — admin-curated, global.
-- Stored as a single row per paper with the full questions array embedded
-- as JSONB. Listing endpoints strip the questions field server-side; only
-- the detail endpoint returns the full payload so we don't ship hundreds
-- of MCQs to clients that just want to browse the catalogue.

CREATE TABLE IF NOT EXISTS pyps (
  id               TEXT PRIMARY KEY,
  title            TEXT NOT NULL,
  exam_type        TEXT NOT NULL,          -- "NEET" / "JEE" / "BOARD"
  year             INTEGER NOT NULL,
  subject          TEXT,                    -- optional, e.g. "Physics"
  duration_minutes INTEGER,                 -- optional suggested time
  questions        JSONB NOT NULL,          -- Question[] payload
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quick filter on the student-side catalogue: by exam and year, newest first.
CREATE INDEX IF NOT EXISTS pyps_exam_year_idx
  ON pyps (exam_type, year DESC);
