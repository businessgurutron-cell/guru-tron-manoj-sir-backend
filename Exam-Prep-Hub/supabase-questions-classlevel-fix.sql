-- =============================================================
--  Allow primary classes (1–8) in the questions table.
--  The original constraint only allowed '9'..'12', which blocked
--  CBSE Class 1–5 question imports.
--  Run this once in the Supabase SQL Editor.
-- =============================================================

ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_class_level_check;

ALTER TABLE questions
  ADD CONSTRAINT questions_class_level_check
  CHECK (class_level IN ('1','2','3','4','5','6','7','8','9','10','11','12'));

-- (type + board constraints already allow what we need:
--  type IN ('MCQ','True-False','Fill-in-the-Blank','Assertion-Reason','Numerical')
--  board IN ('CBSE','ICSE','State','Other') )
