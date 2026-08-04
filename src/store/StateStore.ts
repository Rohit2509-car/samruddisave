  import {
  UserProfile,
  UserRole,
  KYCStatus,
  Membership,
  ContributionRecord,
  MaturityPayout,
  SupportTicket,
  SavingsCircle,
  AuditLog,
  GiftHamper
} from '../types';
import {
  INITIAL_PROFILES,
  INITIAL_MEMBERSHIPS,
  INITIAL_CONTRIBUTIONS,
  INITIAL_MATURITY_PAYOUTS,
  INITIAL_TICKETS,
  INITIAL_SAVINGS_CIRCLES,
  INITIAL_AUDIT_LOGS,
  SAVINGS_PLANS,
  GIFT_HAMPERS
} from '../data/mockData';

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'samruddisave_current_user_id',
  PROFILES: 'samruddisave_profiles',
  MEMBERSHIPS: 'samruddisave_memberships',
  CONTRIBUTIONS: 'samruddisave_contributions',
  PAYOUTS: 'samruddisave_payouts',
  TICKETS: 'samruddisave_tickets',
  CIRCLES: 'samruddisave_circles',
  AUDIT_LOGS: 'samruddisave_audit_logs',
  ESCROW_BALANCE: 'samruddisave_escrow_balance',
};

import { supabase } from '../lib/supabase';

type Listener = () => void;

class StateStore {
  private listeners: Set<Listener> = new Set();
  private profiles: UserProfile[] = [];
  private memberships: Membership[] = [];
  private contributions: ContributionRecord[] = [];
  private payouts: MaturityPayout[] = [];
  private tickets: SupportTicket[] = [];
  private circles: SavingsCircle[] = [];
  private auditLogs: AuditLog[] = [];
  private escrowBalance: number = 4850000;
  private currentUserId: string = 'user-member-1';

  constructor() {
    this.loadFromStorage();
    this.syncWithSupabase();
  }

  private async syncWithSupabase() {
    try {
      // Seed all 10 profiles (9 Members + 1 Admin) to Supabase
      await this.pushAllProfilesToSupabase();

      const { data: dbProfiles, error: profileErr } = await supabase.from('profiles').select('*');
      if (!profileErr && dbProfiles && dbProfiles.length > 0) {
        dbProfiles.forEach((dbP: any) => {
          const idx = this.profiles.findIndex((p) => p.id === dbP.id || p.email === dbP.email);
          const mapped: UserProfile = {
            id: dbP.id,
            full_name: dbP.full_name || 'Member',
            email: dbP.email || '',
            phone: dbP.phone || '+91 98765 43210',
            pan_number: dbP.pan_number || 'ABCDE1234F',
            aadhaar_number: dbP.aadhaar_number || '9876 5432 1098',
            role: dbP.role || 'member',
            kyc_status: dbP.kyc_status || 'approved',
            pipeline_stage: dbP.pipeline_stage || 'ACTIVE_SAVING',
            ocr_confidence: dbP.ocr_confidence || 99.8,
            avatar_url: dbP.avatar_url,
            created_at: dbP.created_at,
          };
          if (idx >= 0) {
            this.profiles[idx] = { ...this.profiles[idx], ...mapped };
          } else {
            this.profiles.push(mapped);
          }
        });
        this.saveToStorage();
      }
    } catch (e) {
      console.warn('Supabase initial fetch fallback:', e);
    }
  }

  public async pushAllProfilesToSupabase() {
    try {
      const dbRows = this.profiles.map((p) => ({
        full_name: p.full_name,
        email: p.email,
        phone: p.phone,
        pan_number: p.pan_number,
        aadhaar_number: p.aadhaar_number,
        role: p.role,
        kyc_status: p.kyc_status,
        pipeline_stage: (p as any).pipeline_stage || 'active',
        ocr_confidence: p.ocr_confidence || 99.8,
        avatar_url: p.avatar_url,
      }));

      await supabase.from('profiles').upsert(dbRows, { onConflict: 'email' });
      console.log('Successfully synced all member profiles to Supabase DB!');
    } catch (e) {
      console.warn('Supabase auto-seed warning:', e);
    }
  }

  private loadFromStorage() {
    try {
      const storedProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
      let loadedProfiles: UserProfile[] = storedProfiles ? JSON.parse(storedProfiles) : INITIAL_PROFILES;

      // Sanitize: If localStorage contains legacy invalid entries, clean up
      const isLegacy = loadedProfiles.some((p) => p.id === 'user-member-2' || (p.role !== 'member' && p.role !== 'admin'));
      if (isLegacy) {
        localStorage.clear();
        loadedProfiles = INITIAL_PROFILES;
      } else {
        // Merge missing seed profiles (e.g. pending KYC Sneha Roy) if not already present
        INITIAL_PROFILES.forEach((initP) => {
          if (!loadedProfiles.some((p) => p.id === initP.id || p.email === initP.email)) {
            loadedProfiles.push(initP);
          }
        });
      }

      // Ensure karthickeyan M profile is a member/customer profile
      loadedProfiles.forEach((p) => {
        if (p.id === 'user-member-1' || p.email === 'karthic@samruddisave.com' || p.email === 'karthickeyan@gmail.com' || p.full_name === 'karthickeyan M') {
          p.id = 'user-member-1';
          p.role = 'member';
          p.full_name = 'karthickeyan M';
          p.email = 'karthickeyan@gmail.com';
        }
      });

      // Ensure dedicated Admin profile exists
      let adminProfile = loadedProfiles.find((p) => p.role === 'admin' || p.email === 'admin@samruddisave.com');
      if (!adminProfile) {
        adminProfile = {
          id: 'user-admin-1',
          full_name: 'Operations Admin',
          email: 'admin@samruddisave.com',
          phone: '+91 98765 00000',
          pan_number: 'ADM000000A',
          aadhaar_number: '0000 0000 0000',
          role: 'admin',
          kyc_status: 'approved',
          pipeline_stage: 'ACTIVE_SAVING',
          ocr_confidence: 100,
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          created_at: '2025-01-01T00:00:00Z',
        };
        loadedProfiles.push(adminProfile);
      } else {
        adminProfile.id = 'user-admin-1';
        adminProfile.role = 'admin';
        adminProfile.email = 'admin@samruddisave.com';
      }

      this.profiles = loadedProfiles;

      const storedMemberships = localStorage.getItem(STORAGE_KEYS.MEMBERSHIPS);
      this.memberships = storedMemberships && !isLegacy ? JSON.parse(storedMemberships) : INITIAL_MEMBERSHIPS;

      const storedContributions = localStorage.getItem(STORAGE_KEYS.CONTRIBUTIONS);
      this.contributions =   storedContributions && !isLegacy ? JSON.parse(storedContributions) : INITIAL_CONTRIBUTIONS;

      const storedPayouts = localStorage.getItem(STORAGE_KEYS.PAYOUTS);
      this.payouts = storedPayouts && !isLegacy ? JSON.parse(storedPayouts) : INITIAL_MATURITY_PAYOUTS;

      const storedTickets = localStorage.getItem(STORAGE_KEYS.TICKETS);
      this.tickets = storedTickets && !isLegacy ? JSON.parse(storedTickets) : INITIAL_TICKETS;

      const storedCircles = localStorage.getItem(STORAGE_KEYS.CIRCLES);
      this.circles = storedCircles && !isLegacy ? JSON.parse(storedCircles) : INITIAL_SAVINGS_CIRCLES;

      const storedLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      this.auditLogs = storedLogs && !isLegacy ? JSON.parse(storedLogs) : INITIAL_AUDIT_LOGS;

      const storedUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      const validUserIds = this.profiles.map((p) => p.id);
      this.currentUserId = storedUserId && validUserIds.includes(storedUserId) ? storedUserId : 'user-member-1';
    } catch (e) {
      console.error('Failed to parse state from localStorage, using initial mock data', e);
      this.profiles = INITIAL_PROFILES;
      this.memberships = INITIAL_MEMBERSHIPS;
      this.contributions = INITIAL_CONTRIBUTIONS;
      this.payouts = INITIAL_MATURITY_PAYOUTS;
      this.tickets = INITIAL_TICKETS;
      this.circles = INITIAL_SAVINGS_CIRCLES;
      this.auditLogs = INITIAL_AUDIT_LOGS;
      this.currentUserId = 'user-member-1';
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(this.profiles));
      localStorage.setItem(STORAGE_KEYS.MEMBERSHIPS, JSON.stringify(this.memberships));
      localStorage.setItem(STORAGE_KEYS.CONTRIBUTIONS, JSON.stringify(this.contributions));
      localStorage.setItem(STORAGE_KEYS.PAYOUTS, JSON.stringify(this.payouts));
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(this.tickets));
      localStorage.setItem(STORAGE_KEYS.CIRCLES, JSON.stringify(this.circles));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
      localStorage.setItem(STORAGE_KEYS.ESCROW_BALANCE, this.escrowBalance.toString());
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
    this.notify();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // --- Getters ---
  public getCurrentUser(): UserProfile {
    const user = this.profiles.find((p) => p.id === this.currentUserId);
    if (user) return user;
    return this.profiles[0] || INITIAL_PROFILES[0];
  }

  public getProfiles(): UserProfile[] {
    return [...this.profiles];
  }

  public getMemberships(): Membership[] {
    return [...this.memberships];
  }

  public getUserMembership(userId: string): Membership | undefined {
    return this.memberships.find((m) => m.user_id === userId);
  }

  public getUserContributions(userId: string): ContributionRecord[] {
    return this.contributions.filter((c) => c.user_id === userId);
  }

  public getContributions(): ContributionRecord[] {
    return [...this.contributions];
  }

  public getOfflineContributions(): ContributionRecord[] {
    return this.contributions.filter(
      (c) => c.is_offline || c.payment_method === 'offline_cash' || c.payment_method === 'offline_upi' || c.payment_method === 'bank_transfer'
    );
  }

  public getUserOfflineContributions(userId: string): ContributionRecord[] {
    return this.getOfflineContributions().filter((c) => c.user_id === userId);
  }

  public getPayouts(): MaturityPayout[] {
    return this.payouts;
  }

  public getTickets(): SupportTicket[] {
    return this.tickets;
  }

  public getCircles(): SavingsCircle[] {
    return this.circles;
  }

  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  public getEscrowBalance(): number {
    return this.escrowBalance;
  }

  // --- Actions ---
  public setCurrentUser(userId: string) {
    this.currentUserId = userId;
    this.saveToStorage();
  }

  public adminLogin(email: string, _password: string): boolean {
    let admin = this.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase() && p.role === 'admin');
    if (!admin) {
      admin = this.profiles.find((p) => p.role === 'admin');
    }
    if (admin) {
      this.currentUserId = admin.id;
      this.recordAuditLog({
        admin_id: admin.id,
        action: 'ADMIN_LOGIN',
        notes: `Admin ${admin.full_name} logged into Admin Console`,
        details: { email, timestamp: new Date().toISOString() }
      });
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public switchRole(role: UserRole) {
    const rep = this.profiles.find((p) => p.role === role);
    if (rep) {
      this.currentUserId = rep.id;
    }
    this.saveToStorage();
  }

  public processMonthlyDeposit(userId: string, amount: number) {
    const membership = this.getUserMembership(userId);
    if (membership) {
      this.recordPaymentWithMembership(
        membership.id,
        `PAY_SS_${Math.floor(10000000 + Math.random() * 90000000)}`,
        'razorpay',
        undefined,
        `Monthly deposit of ₹${amount}`
      );
    }
  }

  // Record Offline Payment with Backend API Synchronization
  public async recordOfflinePaymentBackend(payload: {
    userId: string;
    membershipId: string;
    amount: number;
    paymentMethod: 'offline_cash' | 'offline_upi' | 'bank_transfer';
    transactionRef?: string;
    notes?: string;
    adminId: string;
    adminName?: string;
  }): Promise<ContributionRecord | null> {
    const adminUser = this.profiles.find((p) => p.id === payload.adminId);
    const adminName = payload.adminName || adminUser?.full_name || 'Admin';

    // 1. Send POST request to backend Express REST API
    try {
      const response = await fetch('/api/payments/offline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          adminName,
        }),
      });

      if (!response.ok) {
        console.warn('Backend API returned non-OK response for offline payment, completing local state sync');
      } else {
        const data = await response.json();
        console.log('Backend Express API successfully recorded offline payment:', data);
      }
    } catch (e) {
      console.warn('Network call to backend /api/payments/offline failed, executing resilient local state update:', e);
    }

    // 2. Local State Sync for instant visual update
    return this.recordPaymentWithMembership(
      payload.membershipId,
      payload.transactionRef || `OFFLINE_${payload.paymentMethod === 'offline_cash' ? 'CASH' : 'UPI'}_${Date.now().toString().slice(-6)}`,
      payload.paymentMethod,
      payload.adminId,
      payload.notes || `Admin manually reconciled offline payment (${payload.paymentMethod.replace('_', ' ')})`,
      adminName
    );
  }

  // Task 2 & Task 7: Record Payment Linked to Membership ID (Online & Offline Manual Reconciliation)
  public recordPaymentWithMembership(
    membershipId: string,
    paymentRef: string,
    method: 'razorpay' | 'offline_cash' | 'offline_upi' | 'bank_transfer' = 'razorpay',
    adminId?: string,
    notes?: string,
    adminName?: string
  ): ContributionRecord | null {
    const membership = this.memberships.find((m) => m.id === membershipId);
    if (!membership) return null;

    const userContribs = this.contributions.filter((c) => c.membership_id === membershipId);
    const paidCount = userContribs.filter((c) => c.status === 'PAID').length;
    const nextCycle = Math.min(paidCount + 1, 12);
    const isOffline = method !== 'razorpay';

    const txRef = paymentRef || `${isOffline ? 'OFFLINE' : 'PAY_SS'}_${Math.floor(10000000 + Math.random() * 90000000)}`;
    const adminObj = adminId ? this.profiles.find((p) => p.id === adminId) : undefined;
    const adminNameResolved = adminName || adminObj?.full_name || (adminId ? 'Admin' : undefined);

    const newContrib: ContributionRecord = {
      id: `c-${membership.user_id.slice(-4)}-${nextCycle}-${Date.now().toString().slice(-4)}`,
      user_id: membership.user_id,
      membership_id: membership.id,
      amount: membership.monthly_amount,
      cycle_number: nextCycle,
      due_date: new Date().toISOString().split('T')[0],
      paid_date: new Date().toISOString(),
      status: 'PAID',
      transaction_ref: txRef,
      payment_method: method,
      is_offline: isOffline,
      reconciled_by_admin: adminId,
      reconciled_by_admin_name: adminNameResolved,
      admin_notes: notes || (isOffline ? `Admin manually reconciled ${method.replace('_', ' ')} deposit` : undefined),
      escrow_batch_id: `ESC_BATCH_${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}`,
      created_at: new Date().toISOString(),
    };

    this.contributions.push(newContrib);
    membership.current_streak += 1;
    membership.status = 'active';
    membership.grace_days_remaining = 5;
    membership.next_due_date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    this.escrowBalance += membership.monthly_amount;

    const profile = this.profiles.find((p) => p.id === membership.user_id);
    if (profile) {
      profile.pipeline_stage = 'ACTIVE_SAVING';
    }

    if (nextCycle === 12) {
      membership.status = 'matured';
      if (profile) profile.pipeline_stage = 'MATURED';

      const hamper = GIFT_HAMPERS.find((h) => h.id === profile?.allocated_hamper_id) || GIFT_HAMPERS[0];
      const newPayout: MaturityPayout = {
        id: `pay-${membership.user_id.slice(-4)}-12`,
        user_id: membership.user_id,
        user_name: profile?.full_name || 'Member',
        user_email: profile?.email || '',
        membership_id: membership.id,
        principal_amount: membership.monthly_amount * 12,
        bonus_amount: membership.bonus_amount,
        total_disbursal_amount: membership.monthly_amount * 12 + membership.bonus_amount,
        maker_status: 'PENDING_MAKER',
        checker_status: 'PENDING_CHECKER',
        hamper_id: hamper.id,
        hamper_name: hamper.name,
        hamper_dispatch_status: 'PREPARING',
      };
      this.payouts.push(newPayout);
    }

    // Task 7: Log audit trail if manual admin reconciliation
    if (adminId) {
      this.recordAuditLog({
        admin_id: adminId,
        member_id: membership.user_id,
        action: 'MANUAL_PAYMENT_RECONCILIATION',
        notes: notes || `Admin (${adminNameResolved}) manually reconciled offline payment (${method})`,
        details: {
          membership_id: membershipId,
          transaction_ref: txRef,
          cycle_number: nextCycle,
          amount: membership.monthly_amount,
          payment_method: method,
          admin_name: adminNameResolved
        }
      });
    } else {
      this.recordAuditLog({
        admin_id: 'system',
        member_id: membership.user_id,
        action: 'RAZORPAY_WEBHOOK_PAYMENT',
        notes: `Automated Razorpay order payment verified for membership ${membershipId}`,
        details: { membership_id: membershipId, transaction_ref: txRef, cycle_number: nextCycle }
      });
    }

    this.saveToStorage();
    return newContrib;
  }

  public async updateKYCStatus(userId: string, status: KYCStatus, adminId: string, notes?: string) {
    const profile = this.profiles.find((p) => p.id === userId);
    if (profile) {
      profile.kyc_status = status;
      if (status === 'approved') {
        profile.pipeline_stage = 'ACTIVE_SAVING';
      }

      try {
        await supabase.from('profiles').upsert({
          full_name: profile.full_name,
          email: profile.email,
          kyc_status: status,
          pipeline_stage: profile.pipeline_stage,
          avatar_url: profile.avatar_url,
        });
      } catch (e) {
        console.warn('Supabase profile update fallback:', e);
      }

      try {
        await fetch('/api/kyc/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, status, adminId }),
        });
      } catch (e) {
        console.warn('Backend /api/kyc/approve fallback:', e);
      }

      this.recordAuditLog({
        admin_id: adminId,
        member_id: userId,
        action: 'KYC_APPROVAL_UPDATE',
        notes: notes || `Admin updated KYC status to ${status}`,
        details: { user_id: userId, new_status: status }
      });
      this.saveToStorage();
    }
  }

  public async updateMemberPipelineStage(userId: string, newStage: string, adminId: string, notes?: string) {
    const profile = this.profiles.find((p) => p.id === userId);
    if (profile) {
      (profile as any).pipeline_stage = newStage;

      try {
        await supabase.from('profiles').update({ pipeline_stage: newStage }).eq('id', userId);
      } catch (e) {
        console.warn('Supabase pipeline stage update fallback:', e);
      }

      this.recordAuditLog({
        admin_id: adminId,
        member_id: userId,
        action: 'PIPELINE_STAGE_UPDATE',
        notes: notes || `Admin moved ${profile.full_name} to pipeline stage ${newStage}`,
        details: { user_id: userId, new_stage: newStage }
      });
      this.saveToStorage();
    }
  }

  // Submit or Update KYC for Approval with 12-Hour SLA Auto-Verification Guarantee
  public async submitKYCForApproval(userId: string, kycData: Partial<UserProfile>): Promise<UserProfile> {
    let profile = this.profiles.find((p) => p.id === userId || p.email === kycData.email);
    const now = new Date();
    const twelveHoursLater = new Date(now.getTime() + 12 * 60 * 60 * 1000);

    if (profile) {
      profile.kyc_status = 'pending';
      (profile as any).pipeline_stage = 'pending';
      profile.submitted_at = now.toISOString();
      profile.auto_approval_due_at = twelveHoursLater.toISOString();
      if (kycData.full_name) profile.full_name = kycData.full_name;
      if (kycData.email) profile.email = kycData.email;
      if (kycData.phone) profile.phone = kycData.phone;
      if (kycData.pan_number) profile.pan_number = kycData.pan_number;
      if (kycData.aadhaar_number) profile.aadhaar_number = kycData.aadhaar_number;
      if (kycData.ocr_confidence) profile.ocr_confidence = kycData.ocr_confidence;
      if (kycData.ocr_details) profile.ocr_details = kycData.ocr_details;
      if (kycData.bank_details) profile.bank_details = kycData.bank_details;
      if (kycData.avatar_url) profile.avatar_url = kycData.avatar_url;
    } else {
      profile = {
        id: `user-${Date.now()}`,
        full_name: kycData.full_name || 'Member',
        email: kycData.email || '',
        phone: kycData.phone || '',
        pan_number: kycData.pan_number || 'ABCDE1234F',
        aadhaar_number: kycData.aadhaar_number || '9876 5432 1098',
        role: 'member',
        kyc_status: 'pending',
        pipeline_stage: 'pending' as any,
        ocr_confidence: kycData.ocr_confidence || 99.8,
        avatar_url: kycData.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        submitted_at: now.toISOString(),
        auto_approval_due_at: twelveHoursLater.toISOString(),
        created_at: now.toISOString(),
        ...kycData,
      };
      this.profiles.push(profile);
      this.currentUserId = profile.id;
    }

    try {
      await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.id,
          fullName: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          panNumber: profile.pan_number,
          aadhaarNumber: profile.aadhaar_number,
          ocrConfidence: profile.ocr_confidence,
          avatarUrl: profile.avatar_url,
          bankDetails: profile.bank_details,
        }),
      });
    } catch (e) {
      console.warn('Backend /api/kyc/submit fallback:', e);
    }

    this.recordAuditLog({
      admin_id: 'system',
      member_id: profile.id,
      action: 'KYC_SUBMITTED_12H_SLA',
      notes: `Member ${profile.full_name} submitted e-KYC OCR documents with 12-Hour SLA Auto-Verification Guarantee`,
      details: { user_id: profile.id, pan: profile.pan_number, auto_approval_due_at: profile.auto_approval_due_at }
    });

    this.saveToStorage();
    return profile;
  }

  // Fast-Forward 12-Hour SLA Auto-Approval (Triggers Auto Verification Without Admin Intervention)
  public async fastForward12HourAutoApproval(userId?: string) {
    try {
      await fetch('/api/kyc/fast-forward-auto-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
    } catch (e) {
      console.warn('Backend fast-forward fallback:', e);
    }

    let approvedCount = 0;
    this.profiles.forEach((p) => {
      if ((!userId || p.id === userId) && (p.kyc_status === 'pending' || (p as any).pipeline_stage === 'pending')) {
        p.kyc_status = 'approved';
        (p as any).pipeline_stage = 'ACTIVE_SAVING';
        approvedCount++;

        this.recordAuditLog({
          admin_id: 'SYSTEM_12H_SLA_WORKER',
          member_id: p.id,
          action: 'AUTO_KYC_VERIFIED_EXPIRED_12H',
          notes: `System auto-verified member ${p.full_name} account because Admin did not approve within 12-hour SLA window`,
          details: { user_id: p.id, sla_hours: 12, status: 'approved' }
        });
      }
    });

    this.saveToStorage();
    return approvedCount;
  }

  public allocateHamper(userId: string, hamperId: string, adminId: string) {
    const profile = this.profiles.find((p) => p.id === userId);
    const hamper = GIFT_HAMPERS.find((h) => h.id === hamperId);
    if (profile && hamper) {
      profile.allocated_hamper_id = hamperId;
      profile.allocated_by_admin = adminId;

      const payout = this.payouts.find((p) => p.user_id === userId);
      if (payout) {
        payout.hamper_id = hamperId;
        payout.hamper_name = hamper.name;
      }

      this.recordAuditLog({
        admin_id: adminId,
        member_id: userId,
        action: 'HAMPER_ALLOCATED',
        notes: `Admin allocated gift hamper "${hamper.name}" to ${profile.full_name}`,
        details: { hamper_id: hamperId, hamper_name: hamper.name }
      });
      this.saveToStorage();
    }
  }

  public recordAuditLog(logData: {
    admin_id: string;
    member_id?: string;
    action: string;
    notes?: string;
    details?: Record<string, any>;
  }) {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      admin_id: logData.admin_id,
      member_id: logData.member_id,
      action: logData.action,
      notes: logData.notes,
      details: logData.details || {},
      ip_address: '10.14.0.1'
    };
    this.auditLogs.unshift(newLog);
    this.saveToStorage();
  }

  public addAuditLog(action: string, notes?: string, details?: any) {
    this.recordAuditLog({
      admin_id: this.currentUserId,
      action,
      notes,
      details,
    });
  }

  public verifyMakerPayout(payoutId: string, adminId: string) {
    const payout = this.payouts.find((p) => p.id === payoutId);
    if (payout) {
      payout.maker_status = 'VERIFIED_BY_MAKER';
      payout.maker_verified_by = adminId;
      payout.maker_verified_at = new Date().toISOString();
      this.addAuditLog('MAKER_PAYOUT_VERIFIED', `Maker admin verified payout ${payoutId}`, { payoutId });
      this.saveToStorage();
    }
  }

  public disburseCheckerPayout(payoutId: string, adminId: string, txnRef: string) {
    const payout = this.payouts.find((p) => p.id === payoutId);
    if (payout) {
      payout.checker_status = 'DISBURSED';
      payout.checker_disbursed_by = adminId;
      payout.checker_disbursed_at = new Date().toISOString();
      payout.bank_transaction_ref = txnRef;
      this.addAuditLog('CHECKER_PAYOUT_DISBURSED', `Checker admin disbursed payout ${payoutId}`, { payoutId, txnRef });
      this.saveToStorage();
    }
  }

  public registerMember(profileData: Partial<UserProfile>): UserProfile {
    const newProfile: UserProfile = {
      id: `user-${Date.now()}`,
      full_name: profileData.full_name || 'Member',
      email: profileData.email || '',
      phone: profileData.phone || '',
      pan_number: profileData.pan_number || '',
      aadhaar_number: profileData.aadhaar_number || '',
      role: 'member',
      kyc_status: 'pending',
      pipeline_stage: 'ACTIVE_SAVING',
      ocr_confidence: profileData.ocr_confidence || 99.8,
      created_at: new Date().toISOString(),
      ...profileData,
    };

    this.profiles.push(newProfile);
    this.saveToStorage();
    return newProfile;
  }

  public createSupportTicket(
    ticketDataOrSubject: Partial<SupportTicket> | string,
    category?: any,
    initialMessage?: string
  ): SupportTicket {
    const user = this.getCurrentUser();
    let newTicket: SupportTicket;

    if (typeof ticketDataOrSubject === 'string') {
      newTicket = {
        id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
        user_id: this.currentUserId,
        user_name: user.full_name,
        subject: ticketDataOrSubject,
        category: category || 'general',
        status: 'OPEN',
        priority: 'MEDIUM',
        messages: initialMessage
          ? [
              {
                id: `msg-${Date.now()}`,
                sender: user.full_name,
                sender_role: user.role,
                text: initialMessage,
                timestamp: new Date().toISOString(),
              },
            ]
          : [],
        created_at: new Date().toISOString(),
      };
    } else {
      newTicket = {
        id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
        user_id: this.currentUserId,
        user_name: user.full_name,
        subject: ticketDataOrSubject.subject || 'Support Query',
        category: ticketDataOrSubject.category || 'general',
        status: 'OPEN',
        priority: ticketDataOrSubject.priority || 'MEDIUM',
        messages: ticketDataOrSubject.messages || [],
        created_at: new Date().toISOString(),
      };
    }

    this.tickets.unshift(newTicket);
    this.saveToStorage();
    return newTicket;
  }

  public replySupportTicket(
    ticketId: string,
    text: string,
    sender?: string,
    senderRole?: UserRole
  ) {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    const user = this.getCurrentUser();
    if (ticket) {
      ticket.messages.push({
        id: `msg-${Date.now()}`,
        sender: sender || user.full_name,
        sender_role: senderRole || user.role,
        text,
        timestamp: new Date().toISOString(),
      });
      this.saveToStorage();
    }
  }

  public updateTicketStatus(ticketId: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED') {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (ticket) {
      ticket.status = status;
      this.saveToStorage();
    }
  }

  // Task 6: Export CSV Helper
  public exportLedgerCSV(): string {
    const headers = ['Contribution ID', 'Member ID', 'Membership ID', 'Amount (INR)', 'Cycle #', 'Due Date', 'Paid Date', 'Status', 'Txn Ref', 'Payment Method'];
    const rows = this.contributions.map((c) => [
      c.id,
      c.user_id,
      c.membership_id,
      c.amount,
      c.cycle_number,
      c.due_date,
      c.paid_date || 'N/A',
      c.status,
      c.transaction_ref,
      c.payment_method || 'razorpay'
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return csvContent;
  }

  public downloadCSV(csvText: string, filename: string = 'samruddisave_ledger.csv') {
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  public resetToDefaults() {
    localStorage.clear();
    this.loadFromStorage();
    this.saveToStorage();
  }
}

export const stateStore = new StateStore();
