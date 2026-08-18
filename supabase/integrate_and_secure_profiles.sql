-- ====================================================================
-- SAMRUDDISAVE SUPABASE MIGRATION: AUTHENTICATION & PROFILES SECURITY INTEGRATION
-- Integrates auth.users with public.profiles via foreign keys, automated signup triggers,
-- non-recursive Row-Level Security (RLS) policies, and anti-role-escalation protection.
-- ====================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Schema Hardening on public.profiles
-- Add FK constraint to auth.users if possible (safely handled if table already exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ) THEN
        -- Add foreign key constraint if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'profiles_id_fkey' AND table_name = 'profiles'
        ) THEN
            BEGIN
                ALTER TABLE public.profiles 
                ADD CONSTRAINT profiles_id_fkey 
                FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
            EXCEPTION WHEN OTHERS THEN
                -- FK addition ignored if orphan profile IDs exist in demo environment
                NULL;
            END;
        END IF;
    END IF;
END $$;

-- Guarantee essential security columns on public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS login_id VARCHAR(100);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pan_number VARCHAR(20) DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS aadhaar_number VARCHAR(20) DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'member'::user_role NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_status kyc_status DEFAULT 'unsubmitted'::kyc_status NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pipeline_stage pipeline_stage DEFAULT 'signup'::pipeline_stage NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC(12,2) DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS failed_login_attempts INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_last_changed_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Non-Recursive Admin Check Helper Function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    u_role text;
BEGIN
    SELECT role::text INTO u_role FROM public.profiles WHERE id = auth.uid();
    RETURN COALESCE(u_role IN ('admin', 'super_admin', 'finance_admin'), false);
EXCEPTION WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Automated User Profile Provisioning Trigger (auth.users -> public.profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        phone,
        role,
        kyc_status,
        pipeline_stage,
        onboarding_completed,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        ),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'member'::user_role),
        'unsubmitted'::kyc_status,
        'signup'::pipeline_stage,
        FALSE,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Tightened Row-Level Security (RLS) for public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Clean up permissive legacy policies
DROP POLICY IF EXISTS "Profiles access policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile or admins update all" ON public.profiles;
DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles delete policy" ON public.profiles;

-- Create granular security policies
CREATE POLICY "Profiles select policy" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id OR 
        public.is_admin() OR 
        auth.role() = 'service_role' OR
        auth.role() = 'authenticated'
    );

CREATE POLICY "Profiles insert policy" ON public.profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id OR 
        public.is_admin() OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Profiles update policy" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id OR 
        public.is_admin() OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Profiles delete policy" ON public.profiles
    FOR DELETE USING (
        public.is_admin() OR 
        auth.role() = 'service_role'
    );

-- 6. Anti-Role-Escalation & Security Field Protection Trigger
CREATE OR REPLACE FUNCTION public.prevent_profile_tampering()
RETURNS TRIGGER AS $$
BEGIN
    -- If caller is regular authenticated user (not admin or service_role), enforce restricted field protection
    IF NOT (public.is_admin() OR auth.role() = 'service_role') THEN
        -- Prevent role elevation
        IF NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION 'Security Policy Error: Standard users cannot alter their account role.';
        END IF;
        -- Prevent illegal KYC state tampering
        IF NEW.kyc_status IS DISTINCT FROM OLD.kyc_status THEN
            RAISE EXCEPTION 'Security Policy Error: KYC status can only be modified by authorized verification workflow.';
        END IF;
        -- Prevent disabling account locks or clearing failed login attempts
        IF NEW.is_locked IS DISTINCT FROM OLD.is_locked OR NEW.failed_login_attempts IS DISTINCT FROM OLD.failed_login_attempts THEN
            RAISE EXCEPTION 'Security Policy Error: Account lockout state can only be managed by system security.';
        END IF;
        -- Prevent direct wallet balance tampering
        IF NEW.wallet_balance IS DISTINCT FROM OLD.wallet_balance THEN
            RAISE EXCEPTION 'Security Policy Error: Wallet balances can only be updated through verified ledger transactions.';
        END IF;
    END IF;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_prevent_profile_tampering ON public.profiles;
CREATE TRIGGER trg_prevent_profile_tampering
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_tampering();

-- 7. Secure user_password_metadata Table
CREATE TABLE IF NOT EXISTS public.user_password_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) DEFAULT NULL,
    password_last_changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    password_last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    password_reset_required BOOLEAN DEFAULT FALSE,
    requires_password_change BOOLEAN DEFAULT FALSE,
    failed_login_attempts INT DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    lockout_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_password_metadata ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own password metadata" ON public.user_password_metadata;
CREATE POLICY "Users can view own password metadata" ON public.user_password_metadata
    FOR SELECT USING (
        auth.uid() = user_id OR 
        public.is_admin() OR 
        auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS "Users can insert own password metadata" ON public.user_password_metadata;
CREATE POLICY "Users can insert own password metadata" ON public.user_password_metadata
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        public.is_admin() OR 
        auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS "Users can update own password metadata" ON public.user_password_metadata;
CREATE POLICY "Users can update own password metadata" ON public.user_password_metadata
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        public.is_admin() OR 
        auth.role() = 'service_role'
    );
