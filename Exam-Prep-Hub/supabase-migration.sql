-- Supabase SQL Queries for Exam-Prep-Hub Migration

-- 1. Create profiles table
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  name TEXT,
  role TEXT,
  target_exam TEXT,
  streak INTEGER DEFAULT 0,
  last_quiz_date TEXT,
  total_points INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  rank INTEGER DEFAULT 0,
  is_onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create attempts table
CREATE TABLE attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id TEXT,
  title TEXT,
  subject TEXT,
  exam_type TEXT,
  score INTEGER,
  total_questions INTEGER,
  time_spent INTEGER,
  date TIMESTAMPTZ DEFAULT NOW(),
  answers JSONB DEFAULT '[]'::jsonb,
  weak_topics TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create papers table
CREATE TABLE papers (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  exam_type TEXT,
  subject TEXT,
  topic TEXT,
  difficulty TEXT,
  questions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create questions table
CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  subject TEXT,
  topic TEXT,
  text TEXT,
  options JSONB DEFAULT '[]'::jsonb,
  correct_index INTEGER,
  explanation TEXT,
  difficulty TEXT,
  type TEXT,
  exam_type JSONB DEFAULT '[]'::jsonb,
  year INTEGER,
  -- Class level: '9' | '10' | '11' | '12'
  class_level TEXT,
  -- Board: 'CBSE' | 'ICSE' | 'State' | 'Other'
  board TEXT,
  -- Whether the question is from NCERT textbook
  is_ncert BOOLEAN DEFAULT FALSE,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- If the questions table already exists, run this instead to add the new columns:
-- ALTER TABLE questions ADD COLUMN IF NOT EXISTS class_level TEXT;
-- ALTER TABLE questions ADD COLUMN IF NOT EXISTS board TEXT;
-- ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_ncert BOOLEAN DEFAULT FALSE;

-- Enable Row Level Security (RLS) - optional but recommended
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth setup)
-- For now, allow all operations (you'll want to restrict this later)
CREATE POLICY "Allow all operations on profiles" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations on attempts" ON attempts FOR ALL USING (true);
CREATE POLICY "Allow all operations on papers" ON papers FOR ALL USING (true);
CREATE POLICY "Allow all operations on questions" ON questions FOR ALL USING (true);

-- Insert seed questions
INSERT INTO questions (id, subject, topic, text, options, correct_index, explanation, difficulty, type, exam_type, year, source) VALUES
('q1', 'Physics', 'Electrostatics', 'Two point charges +4μC and -4μC are placed 20 cm apart. What is the electric potential at the midpoint?', '["Zero", "720 kV", "-720 kV", "360 kV"]'::jsonb, 0, 'At the midpoint, V = kq/r + k(-q)/r = 0. The potentials due to equal and opposite charges cancel.', 'Easy', 'MCQ', '["NEET", "JEE"]'::jsonb, 2023, 'seed'),
('q2', 'Physics', 'Electrostatics', 'A parallel plate capacitor has plate area 100 cm² and separation 2 mm. The capacitance is:', '["4.43 pF", "44.3 pF", "0.443 pF", "443 pF"]'::jsonb, 0, 'C = ε₀A/d = (8.85×10⁻¹²)(100×10⁻⁴)/(2×10⁻³) = 4.43 pF', 'Moderate', 'MCQ', '["JEE"]'::jsonb, NULL, 'seed'),
('q3', 'Physics', 'Thermodynamics', 'In a Carnot cycle, the efficiency of the engine is 40%. If the heat rejected is 600 J, the work done by the engine is:', '["400 J", "240 J", "600 J", "1000 J"]'::jsonb, 0, 'Q_rejected = 600J, efficiency = 0.4. Q_absorbed = 1000J, W = 400J', 'Moderate', 'MCQ', '["JEE", "NEET"]'::jsonb, NULL, 'seed'),
('q4', 'Physics', 'Optics', 'A convex lens has focal length 20 cm. An object is placed 30 cm away. The image distance is:', '["60 cm", "-60 cm", "30 cm", "40 cm"]'::jsonb, 0, '1/v - 1/u = 1/f → 1/v = 1/20 + 1/(-30) → v = 60 cm', 'Easy', 'MCQ', '["NEET", "JEE", "BOARD"]'::jsonb, 2022, 'seed'),
('q5', 'Physics', 'Modern Physics', 'The de Broglie wavelength of an electron moving with velocity v is λ. If the velocity is doubled, the wavelength becomes:', '["λ/2", "2λ", "λ/4", "4λ"]'::jsonb, 0, 'λ = h/mv. If v doubles, λ becomes h/(m·2v) = λ/2', 'Easy', 'MCQ', '["NEET", "JEE"]'::jsonb, 2021, 'seed'),
('q6', 'Chemistry', 'Organic Chemistry', 'Which of the following is the product of Markovnikov addition of HBr to propene?', '["2-bromopropane", "1-bromopropane", "1,2-dibromopropane", "2,2-dibromopropane"]'::jsonb, 0, 'By Markovnikov''s rule, H adds to the carbon with more H atoms (C1), and Br adds to C2 giving 2-bromopropane.', 'Easy', 'MCQ', '["NEET", "JEE", "BOARD"]'::jsonb, 2023, 'seed'),
('q7', 'Chemistry', 'Electrochemistry', 'The standard EMF of a cell with E°(cathode) = +0.80 V and E°(anode) = -0.44 V is:', '["1.24 V", "0.36 V", "-1.24 V", "1.80 V"]'::jsonb, 0, 'E°cell = E°cathode - E°anode = 0.80 - (-0.44) = 1.24 V', 'Easy', 'MCQ', '["JEE", "NEET"]'::jsonb, NULL, 'seed'),
('q8', 'Chemistry', 'Chemical Kinetics', 'For a first-order reaction, the half-life is 60 s. What fraction of the reactant remains after 3 half-lives?', '["1/8", "1/4", "1/16", "1/2"]'::jsonb, 0, 'After 3 half-lives: (1/2)³ = 1/8 of the original amount remains.', 'Easy', 'MCQ', '["NEET", "JEE"]'::jsonb, 2022, 'seed'),
('q9', 'Chemistry', 'Periodic Table', 'Assertion: Ionization energy of Be is greater than B. Reason: Be has a completely filled 2s orbital which is extra stable.', '["Both A and R are true and R is the correct explanation of A", "Both A and R are true but R is not the correct explanation", "A is true but R is false", "A is false but R is true"]'::jsonb, 0, 'Be (1s²2s²) has a completely filled 2s subshell which is more stable, requiring more energy to remove an electron than B (1s²2s²2p¹).', 'Moderate', 'Assertion-Reason', '["NEET", "JEE"]'::jsonb, NULL, 'seed'),
('q10', 'Biology', 'Cell Biology', 'Which organelle is known as the ''powerhouse of the cell''?', '["Mitochondria", "Ribosome", "Golgi apparatus", "Lysosome"]'::jsonb, 0, 'Mitochondria produce ATP through cellular respiration (oxidative phosphorylation), hence called the powerhouse.', 'Easy', 'MCQ', '["NEET", "BOARD"]'::jsonb, 2023, 'seed'),
('q11', 'Biology', 'Genetics', 'In a monohybrid cross between Tt × Tt, what is the probability of getting tall plants with Tt genotype?', '["50%", "25%", "75%", "100%"]'::jsonb, 0, 'Tt × Tt gives: TT (25%), Tt (50%), tt (25%). So Tt genotype = 50%', 'Easy', 'MCQ', '["NEET", "BOARD"]'::jsonb, NULL, 'seed'),
('q12', 'Biology', 'Plant Physiology', 'Which process is responsible for the movement of water from cell to cell in plants through osmosis?', '["Plasmolysis", "Imbibition", "Osmosis", "Transpiration"]'::jsonb, 2, 'Osmosis is the movement of water molecules across a semipermeable membrane from a region of higher water potential to lower water potential.', 'Easy', 'MCQ', '["NEET"]'::jsonb, 2021, 'seed'),
('q13', 'Biology', 'Human Physiology', 'Which enzyme in the stomach initiates protein digestion?', '["Pepsin", "Trypsin", "Amylase", "Lipase"]'::jsonb, 0, 'Pepsin, secreted as pepsinogen and activated by HCl in the stomach, begins protein digestion.', 'Easy', 'MCQ', '["NEET"]'::jsonb, 2022, 'seed'),
('q14', 'Mathematics', 'Calculus', 'The value of ∫₀¹ x²dx is:', '["1/3", "1/2", "1", "2/3"]'::jsonb, 0, '∫x²dx = x³/3. Evaluating from 0 to 1: 1/3 - 0 = 1/3', 'Easy', 'MCQ', '["JEE", "BOARD"]'::jsonb, NULL, 'seed'),
('q15', 'Mathematics', 'Coordinate Geometry', 'The equation of a circle with center (2, -3) and radius 4 is:', '["(x-2)² + (y+3)² = 16", "(x+2)² + (y-3)² = 16", "(x-2)² + (y-3)² = 4", "(x+2)² + (y+3)² = 16"]'::jsonb, 0, 'Standard form: (x-h)² + (y-k)² = r². With h=2, k=-3, r=4: (x-2)² + (y+3)² = 16', 'Easy', 'MCQ', '["JEE", "BOARD"]'::jsonb, NULL, 'seed'),
('q16', 'Mathematics', 'Algebra', 'If the roots of 2x² - 5x + k = 0 are equal, then k =', '["25/8", "5/2", "5/4", "25/4"]'::jsonb, 0, 'For equal roots, discriminant = 0. b² - 4ac = 25 - 8k = 0 → k = 25/8', 'Moderate', 'MCQ', '["JEE"]'::jsonb, NULL, 'seed'),
('q17', 'Physics', 'Waves', 'A string of length 1 m is fixed at both ends. The fundamental frequency is 100 Hz. What is the wave speed?', '["200 m/s", "100 m/s", "50 m/s", "400 m/s"]'::jsonb, 0, 'f₁ = v/2L → v = 2Lf₁ = 2 × 1 × 100 = 200 m/s', 'Moderate', 'MCQ', '["JEE", "NEET"]'::jsonb, NULL, 'seed'),
('q18', 'Chemistry', 'Atomic Structure', 'The maximum number of electrons in a subshell with l = 3 is:', '["14", "10", "6", "18"]'::jsonb, 0, 'For l=3 (f subshell), m ranges from -3 to +3 (7 values). Each orbital holds 2 electrons: 2 × 7 = 14 electrons.', 'Moderate', 'MCQ', '["NEET", "JEE"]'::jsonb, 2020, 'seed'),
('q19', 'Biology', 'Ecology', 'Which of the following is a primary producer in an aquatic ecosystem?', '["Phytoplankton", "Zooplankton", "Fish", "Decomposers"]'::jsonb, 0, 'Phytoplankton are photosynthetic organisms that form the base of the aquatic food chain (primary producers).', 'Easy', 'MCQ', '["NEET"]'::jsonb, NULL, 'seed'),
('q20', 'Physics', 'Magnetism', 'A current of 5A flows through a circular loop of radius 10 cm. The magnetic field at the center is:', '["10π μT", "5π μT", "20π μT", "25π μT"]'::jsonb, 0, 'B = μ₀I/2r = (4π×10⁻⁷ × 5)/(2 × 0.1) = 10π × 10⁻⁶ T = 10π μT', 'Moderate', 'MCQ', '["JEE", "NEET"]'::jsonb, NULL, 'seed');