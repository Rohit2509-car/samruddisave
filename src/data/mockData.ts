import { UserProfile, SavingsPlan, GiftHamper, Membership, ContributionRecord, MaturityPayout, SupportTicket, SavingsCircle, AuditLog } from '../types';

export const SAVINGS_PLANS: SavingsPlan[] = [
  {
    id: 'plan-1000',
    name: 'Samruddi Starter Plan',
    monthly_amount: 1000,
    cash_bonus_pct: 5.0,
    duration_months: 12,
    total_principal: 12000,
    bonus_amount: 600,
    total_maturity_value: 12600,
    gift_hamper_tier: 'Silver Tier',
  },
  {
    id: 'plan-2000',
    name: 'Samruddi Harvest Plan',
    monthly_amount: 2000,
    cash_bonus_pct: 5.5,
    duration_months: 12,
    total_principal: 24000,
    bonus_amount: 1320,
    total_maturity_value: 25320,
    gift_hamper_tier: 'Gold Tier',
  },
  {
    id: 'plan-4000',
    name: 'Samruddi Premium Gold Plan',
    monthly_amount: 4000,
    cash_bonus_pct: 6.0,
    duration_months: 12,
    total_principal: 48000,
    bonus_amount: 2880,
    total_maturity_value: 50880,
    gift_hamper_tier: 'Platinum Tier',
  },
];

export const GIFT_HAMPERS: GiftHamper[] = [
  {
    id: 'hamper-1',
    name: 'Smart Home & Tech Box',
    category: 'Technology & Smart Living',
    retail_value: 4500,
    tier: 'Platinum Tier',
    description: 'A curated selection of modern smart home devices designed to upgrade your daily digital experience.',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80',
    included_items: [
      { name: 'Smart Voice Speaker (Gen 4)', price: 2200, description: 'Compact Alexa-enabled HD speaker with bass booster' },
      { name: 'True Wireless Earbuds with ANC', price: 1800, description: 'Active noise cancellation & 30h battery life' },
      { name: 'Desk Temperature-Control Smart Mug', price: 500, description: 'Keeps beverages warm at exact temperature' },
    ],
  },
  {
    id: 'hamper-2',
    name: 'Luxury Organic Wellness',
    category: 'Wellness & Aromatherapy',
    retail_value: 4500,
    tier: 'Gold Tier',
    description: 'Handcrafted organic self-care essentials sourced directly from Himalayan botanical gardens.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
    included_items: [
      { name: 'Pure Himalayan Organic Essential Oils', price: 1500, description: 'Lavender, Eucalyptus & Lemongrass cold-pressed extracts' },
      { name: 'Artisanal Herbal Spa & Bath Kit', price: 1800, description: 'Sulfate-free body butter, bath salts & scrub' },
      { name: 'Kashmiri Saffron & Whole Leaf Tea Selection', price: 1200, description: 'First-flush Darjeeling & Grade-A Mongra saffron' },
    ],
  },
  {
    id: 'hamper-3',
    name: 'Artisan Festive Fashion',
    category: 'Heritage & Lifestyle',
    retail_value: 4500,
    tier: 'Silver Tier',
    description: 'Heritage Indian textile craftsmanship paired with modern minimalist accessories for festive celebrations.',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80',
    included_items: [
      { name: 'Hand-Woven Pashmina Silk Stole', price: 2200, description: 'Authentic Kashmir weave with intricate borders' },
      { name: 'Classic Minimalist Chronograph Watch', price: 1500, description: 'Stainless steel mesh strap with Japanese quartz movement' },
      { name: 'Handcrafted Antique Brass Diya Pair', price: 800, description: 'Traditional oil lamps for festive elegance' },
    ],
  },
  {
    id: 'hamper-4',
    name: 'Handcrafted Home Decor',
    category: 'Home & Living',
    retail_value: 4500,
    tier: 'Gold Tier',
    description: 'Timeless interior artifacts crafted by master artisans to elevate modern living rooms.',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    included_items: [
      { name: 'Antiqued Brass Ganesha Statue (8-inch)', price: 1800, description: 'Solid brass casting with antique patina finish' },
      { name: 'Terracotta Sculpted Artisan Vase', price: 1500, description: 'Hand-molded clay with rustic matte glaze' },
      { name: 'Hand-Poured Scented Soy Candle Trio', price: 1200, description: 'Sandalwood, Vanilla & Jasmine infused wax' },
    ],
  },
];

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'user-member-1',
    full_name: 'Rohit Sharma',
    email: 'rohitxcvmhss@gmail.com',
    phone: '+91 98765 43210',
    pan_number: 'ABCDE1234F',
    aadhaar_number: '9876 5432 1098',
    role: 'member',
    kyc_status: 'approved',
    pipeline_stage: 'PAYMENT_ACTIVE',
    ocr_confidence: 99.8,
    ocr_details: {
      pan_name_match: true,
      photo_match_pct: 99.8,
      extracted_pan: 'ABCDE1234F',
      extracted_aadhaar: '9876 5432 1098',
      document_type: 'PAN Card & Aadhaar e-KYC',
    },
    bank_details: {
      account_number: '50100293847123',
      ifsc: 'HDFC0001234',
      bank_name: 'HDFC Bank',
      autopay_method: 'gpay',
      mandate_id: 'MNDT_HDFC_9928172',
      account_holder: 'Rohit Sharma',
    },
    allocated_hamper_id: 'hamper-1',
    allocated_by_admin: 'Admin',
    created_at: '2026-04-01T10:00:00Z',
  },
  {
    id: 'user-admin-1',
    full_name: 'Admin',
    email: 'admin@samruddisave.com',
    phone: '+91 98765 00000',
    pan_number: 'ADM000000A',
    aadhaar_number: '0000 0000 0000',
    role: 'admin',
    kyc_status: 'approved',
    pipeline_stage: 'PAYMENT_ACTIVE',
    ocr_confidence: 100,
    created_at: '2025-01-01T00:00:00Z',
  },
];

export const INITIAL_MEMBERSHIPS: Membership[] = [
  {
    id: 'm-rohit-01',
    user_id: 'user-member-1',
    plan_id: 'plan-1000',
    monthly_amount: 1000,
    current_streak: 4,
    bonus_amount: 600,
    status: 'active',
    due_day: 5,
    grace_days_remaining: 5,
    next_due_date: '2026-08-05',
    created_at: '2026-04-01T10:00:00Z',
  },
];

export const INITIAL_CONTRIBUTIONS: ContributionRecord[] = [
  { id: 'c-r-1', user_id: 'user-member-1', membership_id: 'm-rohit-01', amount: 1000, cycle_number: 1, due_date: '2026-04-05', paid_date: '2026-04-04T12:00:00Z', status: 'PAID', transaction_ref: 'PAY_SS_10928301', escrow_batch_id: 'ESC_BATCH_202604' },
  { id: 'c-r-2', user_id: 'user-member-1', membership_id: 'm-rohit-01', amount: 1000, cycle_number: 2, due_date: '2026-05-05', paid_date: '2026-05-05T09:15:00Z', status: 'PAID', transaction_ref: 'PAY_SS_10928302', escrow_batch_id: 'ESC_BATCH_202605' },
  { id: 'c-r-3', user_id: 'user-member-1', membership_id: 'm-rohit-01', amount: 1000, cycle_number: 3, due_date: '2026-06-05', paid_date: '2026-06-03T16:20:00Z', status: 'PAID', transaction_ref: 'PAY_SS_10928303', escrow_batch_id: 'ESC_BATCH_202606' },
  { id: 'c-r-4', user_id: 'user-member-1', membership_id: 'm-rohit-01', amount: 1000, cycle_number: 4, due_date: '2026-07-05', paid_date: '2026-07-04T10:10:00Z', status: 'PAID', transaction_ref: 'PAY_SS_10928304', escrow_batch_id: 'ESC_BATCH_202607' },
];

export const INITIAL_MATURITY_PAYOUTS: MaturityPayout[] = [];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'TICK-1088',
    user_id: 'user-member-1',
    user_name: 'Rohit Sharma',
    subject: 'Changing AutoPay Mandate from Google Pay to PhonePe',
    category: 'autopay',
    status: 'RESOLVED',
    priority: 'MEDIUM',
    messages: [
      {
        id: 'msg-101',
        sender: 'Rohit Sharma',
        sender_role: 'member',
        text: 'Can I update my monthly AutoPay method before the 5th of this month?',
        timestamp: '2026-07-20T14:10:00Z',
      },
      {
        id: 'msg-102',
        sender: 'Admin Support',
        sender_role: 'support_agent',
        text: 'Hi Rohit! You can update your mandate anytime from your Payment Setup tab before the monthly billing cycle triggers.',
        timestamp: '2026-07-20T14:45:00Z',
      },
    ],
    created_at: '2026-07-20T14:10:00Z',
  },
];

export const INITIAL_SAVINGS_CIRCLES: SavingsCircle[] = [
  {
    id: 'circle-1',
    name: 'Mumbai Gold Harvest Circle 2026',
    description: 'A dedicated group of disciplined micro-savers aiming for 100% 12-month completion and max cash bonus.',
    target_members: 10,
    current_members: 8,
    total_monthly_pool: 28000,
    streak_count: 5,
    reward_badge: 'Gold Shield Circle',
    members: [
      { name: 'Rohit Sharma', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', streak: 4, plan: '₹1,000 / mo' },
    ],
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-101',
    timestamp: '2026-08-03T01:40:00Z',
    user_id: 'user-member-1',
    user_role: 'member',
    action: 'PAYMENT_SUCCESS',
    details: 'Monthly contribution of ₹1,000 processed via GPay AutoPay mandate MNDT_HDFC_9928172',
    ip_address: '103.22.14.99',
  },
  {
    id: 'log-102',
    timestamp: '2026-08-02T16:20:00Z',
    user_id: 'user-admin-1',
    user_role: 'admin',
    action: 'KYC_APPROVED',
    details: 'Admin approved KYC for Rohit Sharma (PAN: ABCDE1234F, OCR Match: 99.8%)',
    ip_address: '10.14.0.52',
  },
  {
    id: 'log-103',
    timestamp: '2026-08-01T10:00:00Z',
    user_id: 'user-admin-1',
    user_role: 'admin',
    action: 'HAMPER_ALLOCATED',
    details: 'Allocated Smart Home & Tech Box (hamper-1) to Rohit Sharma maturity wallet',
    ip_address: '10.14.0.52',
  },
];
