-- Payments ledger for subscription purchases.
-- Run this in the Supabase SQL editor when STORAGE=supabase.
--
-- Every verified Razorpay payment is appended here so the admin panel can show
-- subscription history + revenue without re-querying Razorpay. Columns are
-- snake_case to match the storage layer's toSnakeCase()/toCamelCase() mapping.

create table if not exists public.payments (
  id            text primary key,
  user_id       text not null,
  email         text,
  name          text,
  role          text,
  plan          text,
  plan_label    text,
  amount        numeric(12,2) not null default 0,   -- in major units (INR)
  amount_paise  integer,
  currency      text not null default 'INR',
  order_id      text,
  payment_id    text,
  status        text not null default 'captured',
  valid_until   timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists payments_user_id_idx     on public.payments (user_id);
create index if not exists payments_created_at_idx   on public.payments (created_at desc);
create index if not exists payments_email_idx        on public.payments (lower(email));
create unique index if not exists payments_payment_id_uidx on public.payments (payment_id) where payment_id is not null;

-- The backend uses the service role key, which bypasses RLS. We still enable
-- RLS so the table is never publicly readable through the anon key.
alter table public.payments enable row level security;

-- No anon/public policies are created on purpose: only the service role (admin
-- backend) may read/write this table.
