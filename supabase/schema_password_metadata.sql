-- ==============================================================================
-- SAMRUDDISAVE SUPABASE DATABASE MIGRATION: USER PASSWORD METADATA TABLE
-- ==============================================================================
-- Description:
-- Creates a dedicated user_password_metadata table linked to each user's profile/auth.
-- Follows security best practices:
--  - Stores password metadata, SHA-256 secure hashes, last updated timestamp, and security flags
--  - Never stores plain-text passwords
--  - Enforces Row Level Security (RLS) policies
--  - Integrates with Supabase Authentication & public.profiles
-- ==============================================================================

-- 1. Create user_password_metadata Table
CREATE TABLE IF NOT EXISTS public.user_password_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) DEFAULT NULL,
    password_last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    failed_login_attempts INT DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    lockout_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    requires_password_change BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_password_meta UNIQUE (user_id)
);

-- 2. Create Index for Fast User Lookup
CREATE INDEX IF NOT EXISTS idx_user_password_meta_user_id ON public.user_password_metadata (user_id);
CREATE INDEX IF NOT EXISTS idx_user_password_meta_email ON public.user_password_metadata (email);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.user_password_metadata ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Allow authenticated users to view only their own password metadata
DROP POLICY IF EXISTS "Users can view own password metadata" ON public.user_password_metadata;
CREATE POLICY "Users can view own password metadata"
    ON public.user_password_metadata
    FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Allow authenticated users to update their own password metadata
DROP POLICY IF EXISTS "Users can update own password metadata" ON public.user_password_metadata;
CREATE POLICY "Users can update own password metadata"
    ON public.user_password_metadata
    FOR ALL
    USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- 5. Automatic Updated-At Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
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
    EXECUTE FUNCTION public.handle_updated_at();
