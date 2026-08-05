export type UserRole = 'member' | 'admin';

export type KYCStatus = 'unsubmitted' | 'pending' | 'approved' | 'rejected' | 'resubmit_requested';

export type PipelineStage = 
  | 'signup'
  | 'pending'
  | 'ACTIVE_SAVING'
  | 'PAYMENT_DUE'
  | 'GRACE_PERIOD'
  | 'MATURED'
  | 'PAYOUT_COMPLETED'
  | 'active'
  | 'grace'
  | 'hamper'
  | 'completed'
  | 'payout';

export interface UserPasswordMetadata {
  id?: string;
  user_id: string;
  email: string;
  password_hash?: string;
  password_last_updated?: string;
  failed_login_attempts?: number;
  is_locked?: boolean;
  lockout_until?: string | null;
  requires_password_change?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  pan_number: string;
  aadhaar_number: string;
  role: UserRole;
  kyc_status: KYCStatus;
  pipeline_stage: PipelineStage;
  ocr_confidence: number;
  login_id?: string;
  address?: string;
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  ocr_details?: {
    pan_name_match: boolean;
    photo_match_pct: number;
    extracted_pan: string;
    extracted_aadhaar: string;
    document_type?: string;
  };
  bank_details?: {
    account_number: string;
    ifsc: string;
    bank_name: string;
    autopay_method: 'gpay' | 'phonepe' | 'paytm' | 'netbanking';
    mandate_id: string;
    account_holder?: string;
    upi_id?: string;
  };
  allocated_hamper_id?: string;
  allocated_by_admin?: string;
  avatar_url?: string;
  wallet_balance?: number;
  referral_code?: string;
  join_date?: string;
  submitted_at?: string;
  auto_approval_due_at?: string;
  created_at: string;
}

export interface SavingsPlan {
  id: string;
  name: string;
  monthly_amount: number;
  cash_bonus_pct: number;
  duration_months: number;
  total_principal: number;
  bonus_amount: number;
  total_maturity_value: number;
  gift_hamper_tier: string;
}

export interface Membership {
  id: string;
  user_id: string;
  plan_id: string;
  monthly_amount: number;
  current_streak: number;
  bonus_amount: number;
  status: 'pending_first_payment' | 'active' | 'grace_period' | 'defaulted' | 'matured' | 'disbursed';
  due_day: number;
  grace_days_remaining: number;
  next_due_date: string;
  created_at: string;
}

export interface ContributionRecord {
  id: string;
  user_id: string;
  membership_id: string;
  amount: number;
  cycle_number: number; // 1 to 12
  due_date: string;
  paid_date?: string;
  status: 'PAID' | 'MISSING' | 'GRACE_PERIOD' | 'DEFAULTED';
  transaction_ref: string;
  payment_method?: 'razorpay' | 'offline_cash' | 'offline_upi' | 'bank_transfer';
  payment_type?: 'cash' | 'upi' | 'razorpay' | 'online' | 'bank_transfer';
  reconciled_by_admin?: string;
  reconciled_by_admin_name?: string;
  remarks?: string;
  admin_notes?: string;
  reference_number?: string;
  receipt_number?: string;
  remaining_balance_after?: number;
  is_offline?: boolean;
  escrow_batch_id?: string;
  created_at?: string;
}

export interface RazorpayOrder {
  id: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  membership_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'created' | 'paid' | 'failed';
  notes: {
    membership_id: string;
    user_id: string;
    [key: string]: any;
  };
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: 'due_date' | 'payment_success' | 'announcement' | 'reward' | 'admin_message';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface MemberLedgerEntry {
  id: string;
  membership_id: string;
  user_id: string;
  date: string;
  description: string;
  opening_balance: number;
  installment_amount: number;
  credit: number;
  debit: number;
  remaining_balance: number;
  closing_balance: number;
  payment_method?: string;
  receipt_ref?: string;
}

export interface HamperItem {
  name: string;
  price: number;
  description: string;
}

export interface GiftHamper {
  id: string;
  name: string;
  category: string;
  retail_value: number;
  description: string;
  image: string;
  included_items: HamperItem[];
  tier: string;
}

export interface MaturityPayout {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  membership_id: string;
  principal_amount: number;
  bonus_amount: number;
  total_disbursal_amount: number;
  maker_status: 'PENDING_MAKER' | 'VERIFIED_BY_MAKER' | 'REJECTED';
  maker_verified_by?: string;
  maker_verified_at?: string;
  checker_status: 'PENDING_CHECKER' | 'DISBURSED' | 'REJECTED';
  checker_disbursed_by?: string;
  checker_disbursed_at?: string;
  bank_transaction_ref?: string;
  hamper_id?: string;
  hamper_name?: string;
  hamper_dispatch_status: 'PREPARING' | 'DISPATCHED' | 'DELIVERED';
}

export interface TicketMessage {
  id: string;
  sender: string;
  sender_role: UserRole;
  text: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  user_name: string;
  subject: string;
  category: 'payments' | 'kyc' | 'hampers' | 'autopay' | 'general';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  messages: TicketMessage[];
  created_at: string;
}

export interface CircleMember {
  name: string;
  avatar: string;
  streak: number;
  plan: string;
}

export interface SavingsCircle {
  id: string;
  name: string;
  description: string;
  target_members: number;
  current_members: number;
  total_monthly_pool: number;
  streak_count: number;
  reward_badge: string;
  members: CircleMember[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  admin_id?: string;
  user_id?: string;
  member_id?: string;
  user_role?: string;
  action: string;
  notes?: string;
  details?: Record<string, any> | string;
  ip_address?: string;
}
