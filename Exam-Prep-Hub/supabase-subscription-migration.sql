-- Subscription state on the profile.
-- Run this in the Supabase SQL editor when STORAGE=supabase.
--
-- The payment-verify endpoint writes profile.subscription =
--   { active, plan, validUntil, razorpayPaymentId }
-- which the storage layer maps to the snake_case column `subscription`.
-- Without this column the upsert fails and paid users never get activated.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subscription JSONB DEFAULT '{}'::jsonb;

-- Helps the admin Subscriptions list filter active plans quickly.
CREATE INDEX IF NOT EXISTS profiles_subscription_active_idx
  ON profiles ((subscription->>'active'));
