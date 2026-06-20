-- =============================================================
--  Gurtron : Referral & Commission System schema
--  Run AFTER the base migration (supabase-migration.sql).
--
--  NOTE: This app uses a CUSTOM express-session auth (not Supabase
--  Auth), and the backend talks to Supabase using the SERVICE ROLE
--  key which bypasses RLS. So policies here mirror the existing
--  "allow all" pattern used by profiles/attempts/papers/questions.
--  Authorisation is enforced in the Express backend (referral-routes.js
--  + admin-routes.js), e.g. self-referral / duplicate blocking and
--  commission state transitions.
-- =============================================================

-- ----- profiles: referral columns -------------------------------------------
-- Every user gets a unique referral_code (e.g. "GURU-MUKUL"). referred_by
-- stores the referral_code that brought them in (immutable once set).
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by   TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mobile        TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS class_level   TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subject       TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS school        TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_referral_code
  ON profiles (upper(referral_code));

-- ----- referrals (referrer -> referred user, permanent) ----------------------
CREATE TABLE IF NOT EXISTS referrals (
  id                TEXT PRIMARY KEY,               -- backend generated (ref_...)
  referrer_id       TEXT NOT NULL,                  -- references profiles.id
  referred_user_id  TEXT NOT NULL UNIQUE,           -- one referrer per user (no duplicates)
  referral_code     TEXT NOT NULL,                  -- code used at signup
  referrer_role     TEXT,                           -- snapshot: 'teacher' | 'student'
  referred_role     TEXT,                           -- snapshot: 'teacher' | 'student'
  source            TEXT DEFAULT 'code',            -- 'code' | 'url'
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals (referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code     ON referrals (upper(referral_code));

-- ----- commission_transactions ----------------------------------------------
-- Created when a referred user makes a successful purchase and the referrer is
-- eligible for cash commission (teacher referrers). Lifecycle:
--   pending  -> created at order time
--   approved -> refund window complete
--   paid     -> admin paid out
--   cancelled-> order refunded
CREATE TABLE IF NOT EXISTS commission_transactions (
  id                  TEXT PRIMARY KEY,             -- backend generated (com_...)
  referrer_id         TEXT NOT NULL,                -- references profiles.id
  buyer_id            TEXT NOT NULL,                -- references profiles.id
  order_id            TEXT,                         -- payment/order id
  purchase_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,   -- in INR
  commission_percent  NUMERIC(5,2)  NOT NULL DEFAULT 10,
  commission_amount   NUMERIC(12,2) NOT NULL DEFAULT 0,   -- in INR
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','approved','paid','cancelled')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commission_referrer ON commission_transactions (referrer_id);
CREATE INDEX IF NOT EXISTS idx_commission_buyer    ON commission_transactions (buyer_id);
CREATE INDEX IF NOT EXISTS idx_commission_status   ON commission_transactions (status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_commission_order ON commission_transactions (order_id);

-- ----- payouts (admin pays a teacher their approved earnings) ----------------
CREATE TABLE IF NOT EXISTS payouts (
  id                TEXT PRIMARY KEY,               -- backend generated (pay_...)
  user_id           TEXT NOT NULL,                  -- references profiles.id (the referrer)
  amount            NUMERIC(12,2) NOT NULL DEFAULT 0,
  transaction_note  TEXT,
  paid_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payouts_user ON payouts (user_id);

-- ----- student_rewards (coins / premium days for student->student referrals) -
CREATE TABLE IF NOT EXISTS student_rewards (
  id            TEXT PRIMARY KEY,                   -- backend generated (rew_...)
  user_id       TEXT NOT NULL,                      -- references profiles.id
  coins         INTEGER NOT NULL DEFAULT 0,
  premium_days  INTEGER NOT NULL DEFAULT 0,
  reason        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_rewards_user ON student_rewards (user_id);

-- ----- Row Level Security (permissive, like the rest of this project) --------
ALTER TABLE referrals               ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_rewards         ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on referrals" ON referrals;
CREATE POLICY "Allow all operations on referrals" ON referrals FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on commission_transactions" ON commission_transactions;
CREATE POLICY "Allow all operations on commission_transactions" ON commission_transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on payouts" ON payouts;
CREATE POLICY "Allow all operations on payouts" ON payouts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on student_rewards" ON student_rewards;
CREATE POLICY "Allow all operations on student_rewards" ON student_rewards FOR ALL USING (true) WITH CHECK (true);

-- =============================================================
--  Done. The backend generates ids and referral codes; commission
--  state transitions are enforced in admin-routes.js.
-- =============================================================
