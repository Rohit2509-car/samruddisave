-- ====================================================================
-- SAMRUDDISAVE COMPLETE SUPABASE POSTGRESQL SCHEMA (IDEMPOTENT)
-- RBI Escrow Certified Monthly Savings & Chit Fund Management System
-- ====================================================================

-- Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. ENUM TYPES CREATION
-- ====================================================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('member', 'admin', 'employee', 'finance_admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE kyc_status AS ENUM ('unsubmitted', 'pending', 'approved', 'rejected', 'resubmit_requested');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE pipeline_stage AS ENUM ('signup', 'pending', 'approved', 'active', 'grace', 'hamper', 'payout', 'matured');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE membership_status AS ENUM ('pending_first_payment', 'active', 'grace_period', 'defaulted', 'matured', 'disbursed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('PAID', 'MISSING', 'GRACE_PERIOD', 'DEFAULTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method_type AS ENUM ('razorpay', 'offline_cash', 'offline_upi', 'bank_transfer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('due_date', 'payment_success', 'announcement', 'reward', 'admin_message');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ====================================================================
-- 2. PROFILES TABLE (User Profiles & Member Accounts)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    login_id TEXT,
    pan_number VARCHAR(20),
    aadhaar_number VARCHAR(20),
    role user_role DEFAULT 'member'::user_role NOT NULL,
    kyc_status kyc_status DEFAULT 'unsubmitted'::kyc_status NOT NULL,
    pipeline_stage pipeline_stage DEFAULT 'signup'::pipeline_stage NOT NULL,
    ocr_confidence NUMERIC(5,2) DEFAULT 99.80,
    address TEXT,
    emergency_contact JSONB,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    bank_name TEXT,
    bank_upi_id TEXT,
    autopay_method TEXT DEFAULT 'gpay',
    allocated_hamper_id TEXT,
    allocated_by_admin TEXT,
    avatar_url TEXT,
    wallet_balance NUMERIC(12,2) DEFAULT 0.00,
    referral_code TEXT,
    join_date TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    auto_approval_due_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- 3. SAVINGS PLANS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.savings_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    monthly_amount NUMERIC(12,2) NOT NULL,
    cash_bonus_pct NUMERIC(5,2) NOT NULL,
    duration_months INT DEFAULT 12 NOT NULL,
    total_principal NUMERIC(12,2) NOT NULL,
    bonus_amount NUMERIC(12,2) NOT NULL,
    total_maturity_value NUMERIC(12,2) NOT NULL,
    gift_hamper_tier TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- 4. GIFT HAMPERS CATALOG TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.gift_hampers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tier TEXT NOT NULL,
    retail_value NUMERIC(12,2) NOT NULL,
    description TEXT,
    image_url TEXT,
    included_items JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- 5. MEMBERSHIPS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    plan_id TEXT REFERENCES public.savings_plans(id) NOT NULL,
    monthly_amount NUMERIC(12,2) NOT NULL,
    current_streak INT DEFAULT 0 NOT NULL,
    bonus_amount NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    status membership_status DEFAULT 'pending_first_payment'::membership_status NOT NULL,
    due_day INT DEFAULT 5 NOT NULL,
    grace_days_remaining INT DEFAULT 5 NOT NULL,
    next_due_date DATE,
    allocated_hamper_id TEXT REFERENCES public.gift_hampers(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- 6. CONTRIBUTIONS & ADMIN CASH COLLECTION TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    membership_id UUID REFERENCES public.memberships(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    cycle_number INT NOT NULL CHECK (cycle_number BETWEEN 1 AND 12),
    due_date DATE NOT NULL,
    paid_date TIMESTAMPTZ,
    status payment_status DEFAULT 'PAID'::payment_status NOT NULL,
    transaction_ref TEXT UNIQUE NOT NULL,
    payment_method payment_method_type DEFAULT 'offline_cash'::payment_method_type,
    payment_type TEXT DEFAULT 'cash',
    is_offline BOOLEAN DEFAULT true,
    reconciled_by_admin UUID REFERENCES public.profiles(id),
    reconciled_by_admin_name TEXT,
    remarks TEXT,
    admin_notes TEXT,
    reference_number TEXT,
    receipt_number TEXT UNIQUE,
    remaining_balance_after NUMERIC(12,2),
    escrow_batch_id TEXT DEFAULT 'ESC_BATCH_2026',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- 7. NOTIFICATIONS TABLE (Member Alerts & Real-time Messages)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- 8. MEMBER LEDGER VIEW (Chit Fund Passbook Statement)
-- ====================================================================
CREATE OR REPLACE VIEW public.member_ledger AS
SELECT 
    c.id AS ledger_id,
    c.membership_id,
    c.user_id,
    c.paid_date::date AS transaction_date,
    CONCAT('Installment #', c.cycle_number, ' Deposit (', UPPER(c.payment_type), ')') AS description,
    c.amount AS credit_amount,
    0.00 AS debit_amount,
    c.remaining_balance_after AS remaining_balance,
    c.receipt_number,
    c.transaction_ref
FROM public.contributions c
WHERE c.status = 'PAID'
ORDER BY c.paid_date ASC;

-- ====================================================================
-- 9. AUDIT LOGS TABLE (RBI Escrow Compliance Tracking)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id TEXT,
    user_id TEXT,
    member_id TEXT,
    user_role TEXT,
    action TEXT NOT NULL,
    notes TEXT,
    details JSONB,
    ip_address TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- 10. INDEXES FOR HIGH-PERFORMANCE SEARCH & QUERYING
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_search ON public.profiles(full_name, phone, email, login_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_user ON public.contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_receipt ON public.contributions(receipt_number);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- ====================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles access policy" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Public memberships access policy" ON public.memberships FOR ALL USING (true);
CREATE POLICY "Public contributions access policy" ON public.contributions FOR ALL USING (true);
CREATE POLICY "Public notifications access policy" ON public.notifications FOR ALL USING (true);
CREATE POLICY "Public audit logs access policy" ON public.audit_logs FOR ALL USING (true);

-- ====================================================================
-- 12. SEED INITIAL DATA FOR TESTING
-- ====================================================================
INSERT INTO public.savings_plans (id, name, monthly_amount, cash_bonus_pct, duration_months, total_principal, bonus_amount, total_maturity_value, gift_hamper_tier)
VALUES
('plan-1000', 'Starter Smart Saver', 1000, 10.00, 12, 12000, 1200, 13200, 'Tier 1'),
('plan-2500', 'Executive Family Saver', 2500, 15.00, 12, 30000, 4500, 34500, 'Tier 2'),
('plan-5000', 'Royal Gold Accumulator', 5000, 20.00, 12, 60000, 12000, 72000, 'Tier 3')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (
    id, full_name, email, phone, role, kyc_status, pipeline_stage, ocr_confidence
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'karthickeyan M',
    'karthickeyan@gmail.com',
    '+91 98765 43210',
    'member'::user_role,
    'approved'::kyc_status,
    'active'::pipeline_stage,
    99.80
), (
    '00000000-0000-0000-0000-000000000002'::uuid,
    'Operations Admin',
    'admin@samruddisave.com',
    '+91 98765 00000',
    'admin'::user_role,
    'approved'::kyc_status,
    'active'::pipeline_stage,
    100.00
) ON CONFLICT (id) DO NOTHING;
