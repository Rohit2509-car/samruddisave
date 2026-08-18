-- ====================================================================
-- SAMRUDDISAVE LEAN & STREAMLINED POSTGRESQL SCHEMA (6-TABLE ARCHITECTURE)
-- Minimizes dataflow overhead and consolidates user metadata into 6 core tables
-- ====================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('member', 'admin', 'employee', 'finance_admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE kyc_status AS ENUM ('unsubmitted', 'pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE pipeline_stage AS ENUM ('signup', 'pending', 'approved', 'active', 'grace', 'hamper', 'payout', 'matured');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method_type AS ENUM ('razorpay', 'offline_cash', 'offline_upi', 'bank_transfer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. PROFILES TABLE (Consolidated User Profile & Security Meta)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    login_id VARCHAR(100),
    pan_number VARCHAR(20) DEFAULT '',
    aadhaar_number VARCHAR(20) DEFAULT '',
    role user_role DEFAULT 'member'::user_role NOT NULL,
    kyc_status kyc_status DEFAULT 'unsubmitted'::kyc_status NOT NULL,
    pipeline_stage pipeline_stage DEFAULT 'signup'::pipeline_stage NOT NULL,
    ocr_confidence NUMERIC(5,2) DEFAULT 99.80,
    address TEXT,
    nominee_details JSONB,
    emergency_contact JSONB,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    bank_name TEXT,
    bank_upi_id TEXT,
    allocated_hamper_id TEXT,
    wallet_balance NUMERIC(12,2) DEFAULT 0.00,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255) DEFAULT NULL,
    failed_login_attempts INT DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    password_last_changed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Upgrade existing profiles table safely
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS login_id VARCHAR(100);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pan_number VARCHAR(20) DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS aadhaar_number VARCHAR(20) DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'member'::user_role;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_status kyc_status DEFAULT 'unsubmitted'::kyc_status;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pipeline_stage pipeline_stage DEFAULT 'signup'::pipeline_stage;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_ifsc TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_upi_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nominee_details JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS failed_login_attempts INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_last_changed_at TIMESTAMPTZ DEFAULT NOW();

-- 4. SAVINGS PLANS TABLE
CREATE TABLE IF NOT EXISTS public.savings_plans (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    monthly_amount NUMERIC(12,2) NOT NULL,
    cash_bonus_pct NUMERIC(5,2) NOT NULL,
    duration_months INT DEFAULT 12 NOT NULL,
    total_principal NUMERIC(12,2) NOT NULL,
    bonus_amount NUMERIC(12,2) NOT NULL,
    total_maturity_value NUMERIC(12,2) NOT NULL,
    gift_hamper_tier TEXT NOT NULL
);

-- 5. MEMBERSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    plan_id TEXT REFERENCES public.savings_plans(id) NOT NULL,
    monthly_amount NUMERIC(12,2) NOT NULL,
    current_streak INT DEFAULT 0 NOT NULL,
    bonus_amount NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    status VARCHAR(30) DEFAULT 'active' NOT NULL,
    due_day INT DEFAULT 5 NOT NULL,
    grace_days_remaining INT DEFAULT 5 NOT NULL,
    next_due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. CONTRIBUTIONS TABLE (Unified Online & Offline Payments)
CREATE TABLE IF NOT EXISTS public.contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    membership_id UUID REFERENCES public.memberships(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    cycle_number INT NOT NULL CHECK (cycle_number BETWEEN 1 AND 12),
    due_date DATE NOT NULL,
    paid_date TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'PAID' NOT NULL,
    transaction_ref TEXT UNIQUE NOT NULL,
    payment_method payment_method_type DEFAULT 'offline_cash'::payment_method_type,
    payment_type TEXT DEFAULT 'cash',
    is_offline BOOLEAN DEFAULT true,
    reconciled_by_admin UUID REFERENCES public.profiles(id),
    receipt_number TEXT UNIQUE,
    remaining_balance_after NUMERIC(12,2),
    escrow_batch_id TEXT DEFAULT 'ESC_BATCH_2026',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Upgrade existing contributions table safely
ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS payment_method payment_method_type DEFAULT 'offline_cash'::payment_method_type;
ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'cash';
ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS remaining_balance_after NUMERIC(12,2);
ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS receipt_number TEXT;
ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS escrow_batch_id TEXT DEFAULT 'ESC_BATCH_2026';

-- 7. PASSBOOK LEDGER VIEW
CREATE OR REPLACE VIEW public.member_ledger AS
SELECT 
    c.id AS ledger_id,
    c.membership_id,
    c.user_id,
    c.paid_date::date AS transaction_date,
    CONCAT(
      'Installment #', c.cycle_number, 
      ' Deposit (', UPPER(COALESCE(c.payment_method::text, c.payment_type, 'OFFLINE')), ')'
    ) AS description,
    c.amount AS credit_amount,
    0.00 AS debit_amount,
    c.remaining_balance_after AS remaining_balance,
    c.receipt_number,
    c.transaction_ref
FROM public.contributions c
WHERE c.status = 'PAID'
ORDER BY c.paid_date ASC;

-- 8. CHIT GROUPS & BIDS TABLE
CREATE TABLE IF NOT EXISTS public.chit_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    total_value NUMERIC(12,2) NOT NULL,
    monthly_amount NUMERIC(12,2) NOT NULL,
    members_limit INT NOT NULL DEFAULT 20,
    duration_months INT NOT NULL DEFAULT 12,
    current_members_count INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'active',
    winner_user_id UUID REFERENCES public.profiles(id),
    winning_bid_amount NUMERIC(12,2) DEFAULT 0.00,
    next_auction_date TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.chit_bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES public.chit_groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    bid_discount_amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. INDEXES FOR FAST SEARCH
CREATE INDEX IF NOT EXISTS idx_profiles_search ON public.profiles(full_name, phone, email, login_id);
CREATE INDEX IF NOT EXISTS idx_contributions_user ON public.contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON public.memberships(user_id);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chit_groups ENABLE ROW LEVEL SECURITY;

-- Secure RLS Policies for Profiles
DROP POLICY IF EXISTS "Profiles access policy" ON public.profiles;
CREATE POLICY "Profiles select policy" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin() OR auth.role() = 'authenticated');
CREATE POLICY "Profiles insert policy" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin() OR auth.role() = 'service_role');
CREATE POLICY "Profiles update policy" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin() OR auth.role() = 'service_role');
CREATE POLICY "Profiles delete policy" ON public.profiles FOR DELETE USING (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Memberships access policy" ON public.memberships FOR ALL USING (true);
CREATE POLICY "Contributions access policy" ON public.contributions FOR ALL USING (true);
CREATE POLICY "Chit groups access policy" ON public.chit_groups FOR ALL USING (true);

-- Seed Initial Plans
INSERT INTO public.savings_plans (id, name, monthly_amount, cash_bonus_pct, duration_months, total_principal, bonus_amount, total_maturity_value, gift_hamper_tier)
VALUES
('plan-1000', 'Starter Smart Saver', 1000, 10.00, 12, 12000, 1200, 13200, 'Tier 1'),
('plan-2500', 'Executive Family Saver', 2500, 15.00, 12, 30000, 4500, 34500, 'Tier 2'),
('plan-5000', 'Royal Gold Accumulator', 5000, 20.00, 12, 60000, 12000, 72000, 'Tier 3')
ON CONFLICT (id) DO NOTHING;
