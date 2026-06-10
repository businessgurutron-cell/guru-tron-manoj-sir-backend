-- topics — first-class topic catalogue, managed from the admin Questions
-- drill view. Independent of the questions table so admins can pre-create
-- empty topics (which then show up in the teacher's Paper Generation flow
-- before any questions are added), and so deleting a topic doesn't have to
-- cascade-delete every related question.

CREATE TABLE IF NOT EXISTS topics (
  id          TEXT PRIMARY KEY,
  subject     TEXT NOT NULL,
  class_level TEXT,                -- nullable: topic may be class-agnostic
  exam_type   TEXT,                -- optional: e.g. "NEET" / "JEE" / "BOARD"
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Case-insensitive uniqueness within the (subject, class, exam) bucket so we
-- don't end up with "Mechanics" / "mechanics" duplicates. COALESCE keeps the
-- index usable when class_level / exam_type are NULL.
CREATE UNIQUE INDEX IF NOT EXISTS topics_unique_idx
  ON topics (
    LOWER(subject),
    COALESCE(LOWER(class_level), ''),
    COALESCE(LOWER(exam_type), ''),
    LOWER(name)
  );

-- Lookup index for the common filter path: by subject + class.
CREATE INDEX IF NOT EXISTS topics_subject_class_idx
  ON topics (subject, class_level);
