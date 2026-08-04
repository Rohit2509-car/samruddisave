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
  }

  private loadFromStorage() {
    try {
      const storedProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
      let loadedProfiles: UserProfile[] = storedProfiles ? JSON.parse(storedProfiles) : INITIAL_PROFILES;

      // Sanitize: If localStorage contains legacy multi-member dataset or unknown roles, reset to clean single-member dataset
      const isLegacy = loadedProfiles.length > 2 || loadedProfiles.some((p) => p.id === 'user-member-2' || (p.role as string) === 'employee');
      if (isLegacy) {
        localStorage.clear();
        loadedProfiles = INITIAL_PROFILES;
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
    return this.profiles;
  }

  public getMemberships(): Membership[] {
    return this.memberships;
  }

  public getUserMembership(userId: string): Membership | undefined {
    return this.memberships.find((m) => m.user_id === userId);
  }

  public getUserContributions(userId: string): ContributionRecord[] {
    return this.contributions.filter((c) => c.user_id === userId);
  }

  public getContributions(): ContributionRecord[] {
    return this.contributions;
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
    const admin = this.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase() && p.role === 'admin');
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

  // Task 2 & Task 7: Record Payment Linked to Membership ID (Online & Offline Manual Reconciliation)
  public recordPaymentWithMembership(
    membershipId: string,
    paymentRef: string,
    method: 'razorpay' | 'offline_cash' | 'offline_upi' = 'razorpay',
    adminId?: string,
    notes?: string
  ): ContributionRecord | null {
    const membership = this.memberships.find((m) => m.id === membershipId);
    if (!membership) return null;

    const userContribs = this.contributions.filter((c) => c.membership_id === membershipId);
    const paidCount = userContribs.filter((c) => c.status === 'PAID').length;
    const nextCycle = Math.min(paidCount + 1, 12);

    const txRef = paymentRef || `PAY_SS_${Math.floor(10000000 + Math.random() * 90000000)}`;
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
      reconciled_by_admin: adminId,
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
        notes: notes || `Admin manually reconciled offline payment (${method})`,
        details: {
          membership_id: membershipId,
          transaction_ref: txRef,
          cycle_number: nextCycle,
          amount: membership.monthly_amount,
          payment_method: method
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

  public updateKYCStatus(userId: string, status: KYCStatus, adminId: string, notes?: string) {
    const profile = this.profiles.find((p) => p.id === userId);
    if (profile) {
      profile.kyc_status = status;
      if (status === 'approved') {
        profile.pipeline_stage = 'ACTIVE_SAVING';
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

  public updateMemberPipelineStage(userId: string, newStage: string, adminId: string, notes?: string) {
    const profile = this.profiles.find((p) => p.id === userId);
    if (profile) {
      (profile as any).pipeline_stage = newStage;
      this.recordAuditLog({
        admin_id: adminId,
        member_id: userId,
        action: 'PIPELINE_STAGE_UPDATE',
        notes: notes || `Admin moved member ${profile.full_name} to stage: ${newStage}`,
        details: { user_id: userId, new_stage: newStage }
      });
      this.saveToStorage();
    }
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
