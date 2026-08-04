-- ====================================================================
-- SAMRUDDISAVE DATABASE SCHEMA FOR SUPABASE / POSTGRESQL (IDEMPOTENT)
-- RBI Escrow Certified Monthly Gold & Appliance Savings Platform
-- ====================================================================

-- Enable UUID and PGCrypto extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. SAFE ENUM TYPE CREATIONS
-- ====================================================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('member', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE kyc_status AS ENUM ('unsubmitted', 'pending', 'approved', 'rejected', 'resubmit_requested');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE pipeline_stage AS ENUM ('signup', 'pending', 'approved', 'active', 'grace', 'hamper', 'payout', 'matured');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE membership_status AS ENUM ('active', 'pending_first_payment', 'grace_period', 'matured', 'disbursed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('PAID', 'PENDING', 'OVERDUE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('razorpay', 'offline_cash', 'offline_upi');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE maker_checker_status AS ENUM ('PENDING_MAKER', 'APPROVED_MAKER', 'PENDING_CHECKER', 'APPROVED_CHECKER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ====================================================================
-- 2. PROFILES TABLE (Linked with Supabase Auth or Standalone UUID)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    pan_number VARCHAR(20),
    aadhaar_number VARCHAR(20),
    role user_role DEFAULT 'member'::user_role NOT NULL,
    kyc_status kyc_status DEFAULT 'unsubmitted'::kyc_status NOT NULL,
    pipeline_stage pipeline_stage DEFAULT 'signup'::pipeline_stage NOT NULL,
    ocr_confidence NUMERIC(5,2) DEFAULT 0.00,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    bank_name TEXT,
    autopay_method TEXT DEFAULT 'gpay',
    allocated_hamper_id TEXT,
    avatar_url TEXT,
    submitted_at TIMESTAMPTZ,
    auto_approval_due_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Ensure column length safety and drop legacy foreign key constraint for seed compatibility
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

DO $$ BEGIN
    ALTER TABLE public.profiles ALTER COLUMN pan_number TYPE VARCHAR(20);
    ALTER TABLE public.profiles ALTER COLUMN aadhaar_number TYPE VARCHAR(20);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

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
    status membership_status DEFAULT 'pending_first_payment'::membership_status NOT NULL,
    allocated_hamper_id TEXT REFERENCES public.gift_hampers(id),
    bonus_amount NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    start_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    next_due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- 6. CONTRIBUTIONS & ESCROW LEDGER TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    membership_id UUID REFERENCES public.memberships(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    cycle_number INT NOT NULL CHECK (cycle_number BETWEEN 1 AND 12),
    due_date DATE NOT NULL,
    paid_date TIMESTAMPTZ,
    status payment_status DEFAULT 'PENDING'::payment_status NOT NULL,
    transaction_ref TEXT UNIQUE,
    payment_method payment_method DEFAULT 'razorpay'::payment_method,
    is_offline BOOLEAN DEFAULT false,
    reconciled_by_admin UUID REFERENCES public.profiles(id),
    admin_notes TEXT,
    escrow_batch_id TEXT DEFAULT 'ESC_BATCH_2026',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- 7. MATURITY PAYOUTS TABLE (Maker-Checker Workflow)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.maturity_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    membership_id UUID REFERENCES public.memberships(id) ON DELETE CASCADE NOT NULL,
    principal_amount NUMERIC(12,2) NOT NULL,
    bonus_amount NUMERIC(12,2) NOT NULL,
    total_disbursal_amount NUMERIC(12,2) NOT NULL,
    maker_status maker_checker_status DEFAULT 'PENDING_MAKER'::maker_checker_status NOT NULL,
    maker_admin_id UUID REFERENCES public.profiles(id),
    maker_timestamp TIMESTAMPTZ,
    checker_status maker_checker_status DEFAULT 'PENDING_CHECKER'::maker_checker_status NOT NULL,
    checker_admin_id UUID REFERENCES public.profiles(id),
    checker_timestamp TIMESTAMPTZ,
    hamper_id TEXT REFERENCES public.gift_hampers(id),
    hamper_name TEXT,
    hamper_dispatch_status TEXT DEFAULT 'PREPARING',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- 8. AUDIT LOGS TABLE (RBI Compliance & Security Tracking)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id TEXT NOT NULL,
    member_id TEXT,
    action TEXT NOT NULL,
    notes TEXT,
    details JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- 9. INDEXES FOR PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_kyc_status ON public.profiles(kyc_status);
CREATE INDEX IF NOT EXISTS idx_profiles_pipeline_stage ON public.profiles(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_membership_id ON public.contributions(membership_id);
CREATE INDEX IF NOT EXISTS idx_contributions_user_id ON public.contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- ====================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES (SAFE DROP & CREATE)
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_hampers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own profile or Admins read all" ON public.profiles;
CREATE POLICY "Users read own profile or Admins read all" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users update own profile or Admins update any" ON public.profiles;
CREATE POLICY "Users update own profile or Admins update any" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users read own contributions or Admins read all" ON public.contributions;
CREATE POLICY "Users read own contributions or Admins read all" ON public.contributions
    FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Public read savings plans" ON public.savings_plans;
CREATE POLICY "Public read savings plans" ON public.savings_plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read gift hampers" ON public.gift_hampers;
CREATE POLICY "Public read gift hampers" ON public.gift_hampers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins full access to audit logs" ON public.audit_logs;
CREATE POLICY "Admins full access to audit logs" ON public.audit_logs
    FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ====================================================================
-- 11. INITIAL SEED DATA
-- ====================================================================
INSERT INTO public.savings_plans (id, name, monthly_amount, cash_bonus_pct, duration_months, total_principal, bonus_amount, total_maturity_value, gift_hamper_tier)
VALUES
('plan-1000', 'Starter Smart Saver', 1000, 10.00, 12, 12000, 1200, 13200, 'Tier 1'),
('plan-2500', 'Executive Family Saver', 2500, 15.00, 12, 30000, 4500, 34500, 'Tier 2'),
('plan-5000', 'Royal Gold Accumulator', 5000, 20.00, 12, 60000, 12000, 72000, 'Tier 3')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.gift_hampers (id, name, tier, retail_value, description)
VALUES
('hamper-1', 'Smart Home & Kitchen Essentials Box', 'Tier 1', 3500.00, 'Philips Air Fryer, Smart Electric Kettle, and Stainless Steel Utensil Set'),
('hamper-2', 'Luxury Electronics & Gold Coin Box', 'Tier 2', 7500.00, 'Samsung Smart Galaxy Watch, Sony Earbuds, and 1g Certified 24K Gold Coin'),
('hamper-3', 'Grand Heritage Festival Hamper', 'Tier 3', 15000.00, '2g 24K Gold Coin, Premium Appliance Suite, and Luxury Festival Crockery')
ON CONFLICT (id) DO NOTHING;

-- Initial User Profiles (Rohit Sharma - Customer & Admin - Administrator)
INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone,
    pan_number,
    aadhaar_number,
    role,
    kyc_status,
    pipeline_stage,
    ocr_confidence,
    bank_account_number,
    bank_ifsc,
    bank_name,
    allocated_hamper_id
) VALUES 
(
    '00000000-0000-0000-0000-000000000001'::uuid,
    'karthickeyan M',
    'karthickeyan@gmail.com',
    '+91 98765 43210',
    'ABCDE1234F',
    '9876 5432 1098',
    'member'::user_role,
    'approved'::kyc_status,
    'active'::pipeline_stage,
    99.80,
    '50100293847123',
    'HDFC0001234',
    'HDFC Bank',
    'hamper-1'
),
(
    '00000000-0000-0000-0000-000000000002'::uuid,
    'Operations Admin',
    'admin@samruddisave.com',
    '+91 98765 00000',
    'ADM000000A',
    '0000 0000 0000',
    'admin'::user_role,
    'approved'::kyc_status,
    'active'::pipeline_stage,
    100.00,
    NULL,
    NULL,
    NULL,
    NULL
),
(
    '00000000-0000-0000-0000-000000000003'::uuid,
    'Sneha Roy',
    'sneha.roy@example.com',
    '+91 98111 22334',
    'BNKPI9876K',
    '4321 8765 2109',
    'member'::user_role,
    'pending'::kyc_status,
    'pending'::pipeline_stage,
    99.80,
    '9182374619028',
    'HDFC0001234',
    'HDFC Bank',
    NULL
),
(
    '00000000-0000-0000-0000-000000000004'::uuid,
    'Arjun Deshmukh',
    'arjun.deshmukh@example.com',
    '+91 98765 11223',
    'ARJPD9876M',
    '1234 5678 9012',
    'member'::user_role,
    'unsubmitted'::kyc_status,
    'signup'::pipeline_stage,
    0.00,
    NULL, NULL, NULL, NULL
),
(
    '00000000-0000-0000-0000-000000000005'::uuid,
    'Vikas Sharma',
    'vikas.sharma@example.com',
    '+91 91234 56789',
    'VIKPS1234K',
    '2345 6789 0123',
    'member'::user_role,
    'approved'::kyc_status,
    'approved'::pipeline_stage,
    99.80,
    NULL, NULL, NULL, NULL
),
(
    '00000000-0000-0000-0000-000000000006'::uuid,
    'Ananya Rao',
    'ananya.rao@example.com',
    '+91 90422 85132',
    'ANAPR4321R',
    '3456 7890 1234',
    'member'::user_role,
    'approved'::kyc_status,
    'active'::pipeline_stage,
    99.80,
    NULL, NULL, NULL, NULL
),
(
    '00000000-0000-0000-0000-000000000007'::uuid,
    'Rajesh Kumar',
    'rajesh.kumar@example.com',
    '+91 99887 76655',
    'RAJPK5678L',
    '4567 8901 2345',
    'member'::user_role,
    'approved'::kyc_status,
    'grace'::pipeline_stage,
    99.80,
    NULL, NULL, NULL, NULL
),
(
    '00000000-0000-0000-0000-000000000008'::uuid,
    'Vikramaditya S.',
    'vikramaditya@example.com',
    '+91 97654 32109',
    'VIKPV9012S',
    '5678 9012 3456',
    'member'::user_role,
    'approved'::kyc_status,
    'hamper'::pipeline_stage,
    99.80,
    NULL, NULL, NULL, 'hamper-1'
),
(
    '00000000-0000-0000-0000-000000000009'::uuid,
    'Meera Deshmukh',
    'meera.deshmukh@example.com',
    '+91 98111 99887',
    'MEEPM3456D',
    '6789 0123 4567',
    'member'::user_role,
    'approved'::kyc_status,
    'payout'::pipeline_stage,
    99.80,
    NULL, NULL, NULL, NULL
),
(
    '00000000-0000-0000-0000-000000000010'::uuid,
    'Priya Patel',
    'priya.patel@example.com',
    '+91 97654 88776',
    'PRYPP7890P',
    '7890 1234 5678',
    'member'::user_role,
    'approved'::kyc_status,
    'matured'::pipeline_stage,
    99.80,
    NULL, NULL, NULL, NULL
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    kyc_status = EXCLUDED.kyc_status,
    pipeline_stage = EXCLUDED.pipeline_stage;

-- Initial Membership for Rohit Sharma
INSERT INTO public.memberships (
    id,
    user_id,
    plan_id,
    monthly_amount,
    current_streak,
    bonus_amount,
    status,
    allocated_hamper_id
) VALUES (
    '11111111-1111-1111-1111-111111111111'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'plan-1000',
    1000.00,
    4,
    1200.00,
    'active'::membership_status,
    'hamper-1'
)
ON CONFLICT (id) DO NOTHING;

-- Initial 4 Paid Monthly Contributions for Rohit Sharma
INSERT INTO public.contributions (
    id,
    user_id,
    membership_id,
    amount,
    cycle_number,
    due_date,
    paid_date,
    status,
    transaction_ref,
    payment_method,
    escrow_batch_id
) VALUES
('22222222-2222-2222-2222-222222222201'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 1000.00, 1, '2026-04-05', '2026-04-04 12:00:00+00', 'PAID'::payment_status, 'PAY_SS_10928301', 'razorpay'::payment_method, 'ESC_BATCH_202604'),
('22222222-2222-2222-2222-222222222202'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 1000.00, 2, '2026-05-05', '2026-05-05 09:15:00+00', 'PAID'::payment_status, 'PAY_SS_10928302', 'razorpay'::payment_method, 'ESC_BATCH_202605'),
('22222222-2222-2222-2222-222222222203'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 1000.00, 3, '2026-06-05', '2026-06-03 16:20:00+00', 'PAID'::payment_status, 'PAY_SS_10928303', 'razorpay'::payment_method, 'ESC_BATCH_202606'),
('22222222-2222-2222-2222-222222222204'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 1000.00, 4, '2026-07-05', '2026-07-04 10:10:00+00', 'PAID'::payment_status, 'PAY_SS_10928304', 'razorpay'::payment_method, 'ESC_BATCH_202607')
ON CONFLICT (transaction_ref) DO NOTHING;

-- Initial Audit Logs
INSERT INTO public.audit_logs (
    id,
    admin_id,
    member_id,
    action,
    notes,
    details
) VALUES
('33333333-3333-3333-3333-333333333301'::uuid, '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'KYC_APPROVED', 'Admin approved KYC for karthickeyan M (PAN: ABCDE1234F, OCR Match: 99.8%)', '{"pan": "ABCDE1234F", "aadhaar": "9876 5432 1098"}'::jsonb),
('33333333-3333-3333-3333-333333333302'::uuid, '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'HAMPER_ALLOCATED', 'Allocated Smart Home & Kitchen Essentials Box to karthickeyan M maturity wallet', '{"hamper_id": "hamper-1"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- AUTOMATED USER CREATION TRIGGER & SAFE CONFLICT RESOLUTION
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    INSERT INTO public.profiles (id, full_name, email, role, kyc_status, pipeline_stage)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Member'),
      NEW.email,
      COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'member'::user_role),
      'unsubmitted'::kyc_status,
      'signup'::pipeline_stage
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- SEED ADMIN USER INTO SUPABASE AUTHENTICATION ENGINE (auth.users)
-- Installs Admin user directly into Supabase Auth Dashboard
-- (Customer accounts remain as separate member signups)
-- ====================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@samruddisave.com') THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            '00000000-0000-0000-0000-000000000002'::uuid,
            'authenticated',
            'authenticated',
            'admin@samruddisave.com',
            crypt('Admin@12345', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            '{"full_name": "Admin", "role": "admin"}'::jsonb,
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
    ELSE
        UPDATE auth.users 
        SET encrypted_password = crypt('Admin@12345', gen_salt('bf')),
            email_confirmed_at = NOW()
        WHERE email = 'admin@samruddisave.com';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = '00000000-0000-0000-0000-000000000002'::uuid) THEN
        INSERT INTO auth.identities (
            id,
            provider_id,
            user_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000002'::uuid,
            '00000000-0000-0000-0000-000000000002',
            '00000000-0000-0000-0000-000000000002'::uuid,
            format('{"sub":"%s","email":"%s"}', '00000000-0000-0000-0000-000000000002', 'admin@samruddisave.com')::jsonb,
            'email',
            NOW(),
            NOW(),
            NOW()
        );
    END IF;
END $$;
