-- ==============================================================================
-- SAMRUDDISAVE PRODUCTION CHIT FUND MANAGEMENT SYSTEM DATABASE SCHEMA
-- ==============================================================================
-- Comprehensive SQL migration creating all tables, indexes, constraints & RLS policies
-- ==============================================================================

-- 1. Users / Profiles Extension
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    dob DATE DEFAULT NULL,
    address TEXT DEFAULT NULL,
    occupation VARCHAR(100) DEFAULT NULL,
    pan_number VARCHAR(10) DEFAULT '',
    aadhaar_number VARCHAR(14) DEFAULT '',
    role VARCHAR(30) DEFAULT 'member', -- 'member', 'admin', 'staff', 'super_admin'
    kyc_status VARCHAR(30) DEFAULT 'unsubmitted', -- 'unsubmitted', 'pending', 'approved', 'rejected', 'correction_requested'
    onboarding_completed BOOLEAN DEFAULT FALSE,
    pipeline_stage VARCHAR(50) DEFAULT 'signup',
    ocr_confidence NUMERIC(5,2) DEFAULT 99.8,
    avatar_url TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Nominee Details Table
CREATE TABLE IF NOT EXISTS public.nominees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    nominee_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_nominee UNIQUE (user_id)
);

-- 3. Document Uploads Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doc_type VARCHAR(50) NOT NULL, -- 'aadhaar', 'pan', 'photo', 'passbook'
    doc_url TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Chit Groups Table
CREATE TABLE IF NOT EXISTS public.chit_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    total_value NUMERIC(12,2) NOT NULL,
    monthly_amount NUMERIC(12,2) NOT NULL,
    members_limit INT NOT NULL DEFAULT 20,
    duration_months INT NOT NULL DEFAULT 12,
    current_members_count INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'active', -- 'recruiting', 'active', 'completed'
    next_auction_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Chit Group Members Table
CREATE TABLE IF NOT EXISTS public.chit_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.chit_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    status VARCHAR(30) DEFAULT 'pending_approval', -- 'pending_approval', 'approved', 'active', 'completed'
    CONSTRAINT unique_group_user UNIQUE (group_id, user_id)
);

-- 6. Payments / Installments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.chit_groups(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL,
    month_number INT NOT NULL DEFAULT 1,
    payment_mode VARCHAR(50) NOT NULL, -- 'upi', 'netbanking', 'card', 'cash'
    status VARCHAR(30) DEFAULT 'PAID', -- 'PAID', 'PENDING', 'OVERDUE'
    receipt_number VARCHAR(100) NOT NULL,
    transaction_ref VARCHAR(100) NOT NULL,
    is_admin_cash BOOLEAN DEFAULT FALSE,
    recorded_by_admin_id UUID DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Ledger Entries Table
CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.chit_groups(id) ON DELETE SET NULL,
    month_number INT NOT NULL,
    debit NUMERIC(12,2) DEFAULT 0.00,
    credit NUMERIC(12,2) DEFAULT 0.00,
    balance NUMERIC(12,2) NOT NULL,
    fine_amount NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. Auctions / Bidding Table
CREATE TABLE IF NOT EXISTS public.auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.chit_groups(id) ON DELETE CASCADE,
    auction_month INT NOT NULL,
    auction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    winner_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    winning_discount_bid NUMERIC(12,2) DEFAULT 0.00,
    prize_amount NUMERIC(12,2) DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'scheduled', -- 'scheduled', 'live', 'completed', 'disbursed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 9. Individual Bids Table
CREATE TABLE IF NOT EXISTS public.bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    bid_discount_amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- 'due_date', 'payment_received', 'overdue', 'auction', 'kyc_approved', 'prize'
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 11. User Password Metadata Table (For Password Hashing & Security Lockouts)
CREATE TABLE IF NOT EXISTS public.user_password_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT DEFAULT NULL,
    password_last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    failed_login_attempts INT DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    lockout_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    requires_password_change BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Indexes for Ultra-Fast Queries
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments (user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_user_id ON public.ledger_entries (user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON public.chit_group_members (group_id);
CREATE INDEX IF NOT EXISTS idx_bids_auction ON public.bids (auction_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_password_meta_user ON public.user_password_metadata (user_id);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chit_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chit_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_password_metadata ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR USER DATA ISOLATION & ADMIN ACCESS
-- ==============================================================================

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.profiles;
CREATE POLICY "Users can view own profile or admins view all" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

DROP POLICY IF EXISTS "Users can update own profile or admins update all" ON public.profiles;
CREATE POLICY "Users can update own profile or admins update all" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

-- Payments Policies
DROP POLICY IF EXISTS "Users view own payments or admins view all" ON public.payments;
CREATE POLICY "Users view own payments or admins view all" ON public.payments
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

DROP POLICY IF EXISTS "Users insert own payments" ON public.payments;
CREATE POLICY "Users insert own payments" ON public.payments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

-- Ledger Entries Policies
DROP POLICY IF EXISTS "Users view own ledger or admins view all" ON public.ledger_entries;
CREATE POLICY "Users view own ledger or admins view all" ON public.ledger_entries
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

-- Chit Group Members Policies
DROP POLICY IF EXISTS "Users view own memberships or admins view all" ON public.chit_group_members;
CREATE POLICY "Users view own memberships or admins view all" ON public.chit_group_members
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

-- Notifications Policies
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Password Metadata Policies
DROP POLICY IF EXISTS "Users manage own password metadata" ON public.user_password_metadata;
CREATE POLICY "Users manage own password metadata" ON public.user_password_metadata
    FOR ALL USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );
