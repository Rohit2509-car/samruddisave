-- ====================================================================
-- SAMRUDDISAVE DATABASE CLEANUP SCRIPT: DROP UNWANTED / REDUNDANT TABLES
-- Run this in your Supabase SQL Editor to remove legacy duplicate tables
-- ====================================================================

-- Drop unwanted redundant tables with CASCADE
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.auctions CASCADE;
DROP TABLE IF EXISTS public.bids CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.ledger_entries CASCADE;
DROP TABLE IF EXISTS public.nominees CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.kyc_records CASCADE;
DROP TABLE IF EXISTS public.maturity_payouts CASCADE;
DROP TABLE IF EXISTS public.user_password_metadata CASCADE;
DROP TABLE IF EXISTS public.chit_group_members CASCADE;

-- Verify remaining essential core tables:
-- 1. public.profiles
-- 2. public.savings_plans
-- 3. public.memberships
-- 4. public.contributions (and view public.member_ledger)
-- 5. public.chit_groups
-- 6. public.chit_bids
-- 7. public.notifications
