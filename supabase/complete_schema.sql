-- ====================================================================
-- SAMRUDDISAVE COMPLETE SUPABASE POSTGRESQL PRODUCTION SCHEMA
-- RBI Escrow Certified Monthly Savings & Chit Fund Management System
-- Connections: Admin Portal <---> Customer Portal
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 2. ENUM TYPES
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
-- 3. PROFILES TABLE (Core User Accounts connecting Admin & Customer)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    onboarding_completed BOOLEAN DEFAULT FALSE,
    join_date TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    auto_approval_due_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Guarantee existing profiles table has all required columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS login_id VARCHAR(100);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pan_number VARCHAR(20) DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS aadhaar_number VARCHAR(20) DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'member'::user_role;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_status kyc_status DEFAULT 'unsubmitted'::kyc_status;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pipeline_stage pipeline_stage DEFAULT 'signup'::pipeline_stage;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ocr_confidence NUMERIC(5,2) DEFAULT 99.80;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_ifsc TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_upi_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS autopay_method TEXT DEFAULT 'gpay';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS allocated_hamper_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS allocated_by_admin TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC(12,2) DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- ====================================================================
-- 4. USER PASSWORD METADATA TABLE (Authentication & Security)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.user_password_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) DEFAULT NULL,
    password_last_changed_at TIMESTAMPTZ DEFAULT NOW(),
    password_last_updated TIMESTAMPTZ DEFAULT NOW(),
    password_reset_required BOOLEAN DEFAULT FALSE,
    requires_password_change BOOLEAN DEFAULT FALSE,
    failed_login_attempts INT DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    lockout_until TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Guarantee existing user_password_metadata table has all columns
ALTER TABLE public.user_password_metadata ADD COLUMN IF NOT EXISTS password_last_changed_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.user_password_metadata ADD COLUMN IF NOT EXISTS password_last_updated TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.user_password_metadata ADD COLUMN IF NOT EXISTS password_reset_required BOOLEAN DEFAULT FALSE;
ALTER TABLE public.user_password_metadata ADD COLUMN IF NOT EXISTS requires_password_change BOOLEAN DEFAULT FALSE;

-- ====================================================================
-- 5. SAVINGS PLANS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.savings_plans (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
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
-- 6. GIFT HAMPERS CATALOG TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.gift_hampers (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tier VARCHAR(50) NOT NULL,
    retail_value NUMERIC(12,2) NOT NULL,
    description TEXT,
    image_url TEXT,
    included_items JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- 7. MEMBERSHIPS TABLE (Customer Subscriptions)
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
-- 8. CONTRIBUTIONS TABLE (Payments & Cash Collections)
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

-- Guarantee existing contributions table has all columns even if created previously
ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS payment_method payment_method_type DEFAULT 'offline_cash'::payment_method_type;
ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'cash';
ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS remaining_balance_after NUMERIC(12,2);
ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS receipt_number TEXT;
ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS escrow_batch_id TEXT DEFAULT 'ESC_BATCH_2026';

-- ====================================================================
-- 9. MEMBER LEDGER VIEW (Chit Fund Passbook Statement)
-- ====================================================================
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

-- ====================================================================
-- 10. CHIT GROUPS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.chit_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    total_value NUMERIC(12,2) NOT NULL,
    monthly_amount NUMERIC(12,2) NOT NULL,
    members_limit INT NOT NULL DEFAULT 20,
    duration_months INT NOT NULL DEFAULT 12,
    current_members_count INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'active', -- 'recruiting', 'active', 'completed'
    next_auction_date TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- 11. CHIT GROUP MEMBERS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.chit_group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.chit_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    join_date TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(30) DEFAULT 'pending_approval',
    CONSTRAINT unique_group_user UNIQUE (group_id, user_id)
);

-- ====================================================================
-- 12. AUCTIONS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.auctions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.chit_groups(id) ON DELETE CASCADE,
    auction_month INT NOT NULL,
    auction_date TIMESTAMPTZ NOT NULL,
    winner_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    winning_discount_bid NUMERIC(12,2) DEFAULT 0.00,
    prize_amount NUMERIC(12,2) DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- 13. INDIVIDUAL BIDS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    bid_discount_amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- 14. NOMINEES TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.nominees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    nominee_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_nominee UNIQUE (user_id)
);

-- ====================================================================
-- 15. DOCUMENT UPLOADS TABLE (KYC Verification)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doc_type VARCHAR(50) NOT NULL, -- 'aadhaar', 'pan', 'photo', 'passbook'
    doc_url TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'pending',
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- 16. NOTIFICATIONS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- 18. INDEXES FOR PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_search ON public.profiles(full_name, phone, email, login_id);
CREATE INDEX IF NOT EXISTS idx_password_meta_user ON public.user_password_metadata (user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_user ON public.contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_receipt ON public.contributions(receipt_number);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);

-- ====================================================================
-- 19. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_password_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chit_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chit_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Non-recursive Allow-All / Admin RLS policies
CREATE POLICY "Profiles access policy" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Password metadata access policy" ON public.user_password_metadata FOR ALL USING (true);
CREATE POLICY "Memberships access policy" ON public.memberships FOR ALL USING (true);
CREATE POLICY "Contributions access policy" ON public.contributions FOR ALL USING (true);
CREATE POLICY "Chit groups access policy" ON public.chit_groups FOR ALL USING (true);
CREATE POLICY "Chit group members access policy" ON public.chit_group_members FOR ALL USING (true);
CREATE POLICY "Auctions access policy" ON public.auctions FOR ALL USING (true);
CREATE POLICY "Bids access policy" ON public.bids FOR ALL USING (true);
CREATE POLICY "Nominees access policy" ON public.nominees FOR ALL USING (true);
CREATE POLICY "Documents access policy" ON public.documents FOR ALL USING (true);
CREATE POLICY "Notifications access policy" ON public.notifications FOR ALL USING (true);

-- ====================================================================
-- 20. INITIAL SEED DATA
-- ====================================================================
INSERT INTO public.savings_plans (id, name, monthly_amount, cash_bonus_pct, duration_months, total_principal, bonus_amount, total_maturity_value, gift_hamper_tier)
VALUES
('plan-1000', 'Starter Smart Saver', 1000, 10.00, 12, 12000, 1200, 13200, 'Tier 1'),
('plan-2500', 'Executive Family Saver', 2500, 15.00, 12, 30000, 4500, 34500, 'Tier 2'),
('plan-5000', 'Royal Gold Accumulator', 5000, 20.00, 12, 60000, 12000, 72000, 'Tier 3')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.gift_hampers (id, name, tier, retail_value, description, included_items)
VALUES
('hamper-tier1', 'Smart Home Essentials', 'Tier 1', 1500.00, 'Premium Kitchenware & Appliance Combo', '[{"name":"Electric Kettle","price":800},{"name":"Dry Iron","price":700}]'::jsonb),
('hamper-tier2', 'Family Comfort Pack', 'Tier 2', 4000.00, 'Luxury Home & Dining Appliances', '[{"name":"Air Fryer 4L","price":2500},{"name":"Mixer Grinder","price":1500}]'::jsonb),
('hamper-tier3', 'Royal Festive Gold Box', 'Tier 3', 10000.00, '2 Gram 24K Pure Gold Coin + Appliance Set', '[{"name":"24K Gold Coin 2g","price":7500},{"name":"Smart Microwave","price":2500}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed Admin Profile
INSERT INTO public.profiles (
    id, full_name, email, phone, role, kyc_status, pipeline_stage, onboarding_completed
) VALUES (
    '00000000-0000-0000-0000-000000000002'::uuid,
    'Operations Admin',
    'admin@samruddisave.com',
    '+91 98765 00000',
    'admin'::user_role,
    'approved'::kyc_status,
    'active'::pipeline_stage,
    true
) ON CONFLICT (id) DO UPDATE SET role = 'admin', kyc_status = 'approved';

-- Seed Admin Password Metadata (Hash for password: 'admin123')
INSERT INTO public.user_password_metadata (
    user_id, email, password_hash, password_last_updated
) VALUES (
    '00000000-0000-0000-0000-000000000002'::uuid,
    'admin@samruddisave.com',
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET password_hash = EXCLUDED.password_hash;
