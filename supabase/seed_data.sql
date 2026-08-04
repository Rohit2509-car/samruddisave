-- ====================================================================
-- SAMRUDDISAVE INITIAL SEED DATA FOR SUPABASE
-- Run this in Supabase SQL Editor after running schema.sql
-- ====================================================================

-- 1. Insert Initial Profiles (Rohit Sharma - Customer & Admin - Administrator)
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
    'Rohit Sharma',
    'rohitxcvmhss@gmail.com',
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
    'Admin',
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
)
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    kyc_status = EXCLUDED.kyc_status,
    pipeline_stage = EXCLUDED.pipeline_stage;

-- 2. Insert Active Membership for Rohit Sharma
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

-- 3. Insert 4 Paid Monthly Contributions for Rohit Sharma
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
(
    '22222222-2222-2222-2222-222222222201'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    1000.00,
    1,
    '2026-04-05',
    '2026-04-04 12:00:00+00',
    'PAID'::payment_status,
    'PAY_SS_10928301',
    'razorpay'::payment_method,
    'ESC_BATCH_202604'
),
(
    '22222222-2222-2222-2222-222222222202'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    1000.00,
    2,
    '2026-05-05',
    '2026-05-05 09:15:00+00',
    'PAID'::payment_status,
    'PAY_SS_10928302',
    'razorpay'::payment_method,
    'ESC_BATCH_202605'
),
(
    '22222222-2222-2222-2222-222222222203'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    1000.00,
    3,
    '2026-06-05',
    '2026-06-03 16:20:00+00',
    'PAID'::payment_status,
    'PAY_SS_10928303',
    'razorpay'::payment_method,
    'ESC_BATCH_202606'
),
(
    '22222222-2222-2222-2222-222222222204'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    1000.00,
    4,
    '2026-07-05',
    '2026-07-04 10:10:00+00',
    'PAID'::payment_status,
    'PAY_SS_10928304',
    'razorpay'::payment_method,
    'ESC_BATCH_202607'
)
ON CONFLICT (transaction_ref) DO NOTHING;

-- 4. Insert Compliance Audit Logs
INSERT INTO public.audit_logs (
    id,
    admin_id,
    member_id,
    action,
    notes,
    details
) VALUES
(
    '33333333-3333-3333-3333-333333333301'::uuid,
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'KYC_APPROVED',
    'Admin approved KYC for Rohit Sharma (PAN: ABCDE1234F, OCR Match: 99.8%)',
    '{"pan": "ABCDE1234F", "aadhaar": "9876 5432 1098"}'::jsonb
),
(
    '33333333-3333-3333-3333-333333333302'::uuid,
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'HAMPER_ALLOCATED',
    'Allocated Smart Home & Kitchen Essentials Box to Rohit Sharma maturity wallet',
    '{"hamper_id": "hamper-1"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
