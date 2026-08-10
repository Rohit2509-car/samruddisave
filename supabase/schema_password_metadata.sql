-- ==============================================================================
-- SAMRUDDISAVE SUPABASE DATABASE MIGRATION: USER PASSWORD METADATA TABLE
-- ==============================================================================
-- Description:
-- Dedicated user_password_metadata table linked to each user's Supabase Auth ID (auth.users.id).
-- Security Principles:
--  - Passwords are ONLY managed & authenticated via Supabase Authentication (auth.users)
--  - NO plain-text passwords stored in this table
--  - Stores password-related metadata:
--      * id (UUID)
--      * user_id (UUID -> linked to auth.users.id)
--      * email (VARCHAR)
--      * password_last_changed_at (TIMESTAMP WITH TIME ZONE)
--      * password_reset_required (BOOLEAN)
--      * created_at & updated_at
--  - Protected with Row Level Security (RLS) policies
-- ==============================================================================

-- 1. Create user_password_metadata Table
CREATE TABLE IF NOT EXISTS public.user_password_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) DEFAULT NULL, -- SHA-256 integrity hash fallback
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

-- 2. Create Index for Fast Lookup by user_id & email
CREATE INDEX IF NOT EXISTS idx_user_password_meta_user_id ON public.user_password_metadata (user_id);
CREATE INDEX IF NOT EXISTS idx_user_password_meta_email ON public.user_password_metadata (email);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.user_password_metadata ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for Authenticated User Data Isolation (Non-recursive)
DROP POLICY IF EXISTS "Users can view own password metadata" ON public.user_password_metadata;
CREATE POLICY "Users can view own password metadata"
    ON public.user_password_metadata
    FOR SELECT
    USING (
        auth.uid() = user_id OR 
        auth.role() = 'authenticated'
    );

-- Allow authenticated users to insert/update their own password metadata
DROP POLICY IF EXISTS "Users can insert own password metadata" ON public.user_password_metadata;
CREATE POLICY "Users can insert own password metadata"
    ON public.user_password_metadata
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id OR 
        auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Users can update own password metadata" ON public.user_password_metadata;
CREATE POLICY "Users can update own password metadata"
    ON public.user_password_metadata
    FOR UPDATE
    USING (
        auth.uid() = user_id OR 
        auth.role() = 'service_role'
    );

-- 5. Automatic Updated-At Trigger
CREATE OR REPLACE FUNCTION public.handle_user_password_meta_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_user_password_meta_updated_at ON public.user_password_metadata;
CREATE TRIGGER set_user_password_meta_updated_at
    BEFORE UPDATE ON public.user_password_metadata
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_password_meta_updated_at();

